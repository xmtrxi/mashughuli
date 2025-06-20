import { StkCallbackHook } from "~/types";
import prisma from "~/lib/prisma";
import redisClient from "~/server/utils/redis"; // Import our shared Redis client

export default defineEventHandler(async (event) => {
  const hook = (await readBody(event)) as StkCallbackHook;
  const callback = hook.Body.stkCallback;

  if (!callback) {
    throw createError({ statusCode: 400, message: "Invalid M-Pesa callback." });
  }

  const { MerchantRequestID, CheckoutRequestID, ResultCode, ResultDesc } =
    callback;
  const topic = `payment:${CheckoutRequestID}:${MerchantRequestID}`;

  const paymentData = {
    type: "payment_update", // This is important for the client to identify the message
    checkoutRequestId: CheckoutRequestID,
    merchantRequestId: MerchantRequestID,
    resultCode: ResultCode,
    resultDesc: ResultDesc,
    success: ResultCode === 0,
    message: ResultDesc,
  };

  // Find the pending transaction to update it
  const pendingTransaction = await prisma.transaction.findFirst({
    where: { transactionReference: CheckoutRequestID, status: "pending" },
  });

  if (!pendingTransaction) {
    console.error(
      `[callback] No pending transaction found for ${CheckoutRequestID}. Publishing failure to Redis.`,
    );
    await redisClient.publish(
      topic,
      JSON.stringify({
        ...paymentData,
        success: false,
        message: "Transaction not found.",
      }),
    );
    return {
      success: false,
      message: "Transaction not found or already processed.",
    };
  }

  // Handle successful payment in a database transaction
  if (ResultCode === 0) {
    const mpesaReceiptNumber = callback.CallbackMetadata?.Item.find(
      (item) => item.Name === "MpesaReceiptNumber",
    )?.Value;
    try {
      await prisma.$transaction(async (tx) => {
        await tx.transaction.update({
          where: { id: pendingTransaction.id },
          data: {
            status: "completed",
            transactionReference: String(mpesaReceiptNumber),
          },
        });
        await tx.errand.update({
          where: { id: pendingTransaction.errandId },
          data: {
            status: "in_progress",
            runnerId: pendingTransaction.payeeId,
            finalPrice: pendingTransaction.amount,
          },
        });
        await tx.bid.updateMany({
          where: {
            errandId: pendingTransaction.errandId,
            runnerId: pendingTransaction.payeeId,
          },
          data: { status: "accepted" },
        });
        await tx.bid.updateMany({
          where: {
            errandId: pendingTransaction.errandId,
            NOT: { runnerId: pendingTransaction.payeeId },
          },
          data: { status: "rejected" },
        });
        await tx.payout.create({
          data: {
            errandId: pendingTransaction.errandId,
            runnerId: pendingTransaction.payeeId,
            transactionId: pendingTransaction.id,
            amount: pendingTransaction.amount,
            status: "pending",
          },
        });
      });
      console.log(
        `[callback] Payment for ${CheckoutRequestID} processed successfully.`,
      );
      await redisClient.publish(topic, JSON.stringify(paymentData));
    } catch (e) {
      console.error(
        `[callback] DB transaction failed for ${CheckoutRequestID}:`,
        e,
      );
      await redisClient.publish(
        topic,
        JSON.stringify({
          ...paymentData,
          success: false,
          message: "Database processing failed.",
        }),
      );
    }
  } else {
    // Handle failed payment
    await prisma.transaction.update({
      where: { id: pendingTransaction.id },
      data: { status: "failed" },
    });
    console.log(
      `[callback] Payment failed for ${CheckoutRequestID}. Publishing to Redis.`,
    );
    await redisClient.publish(topic, JSON.stringify(paymentData));
  }

  return { success: true, message: "Callback processed." };
});
