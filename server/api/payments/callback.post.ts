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
    await redisClient?.publish(
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
        // Update transaction status
        await tx.transaction.update({
          where: { id: pendingTransaction.id },
          data: {
            status: "completed",
            transactionReference: String(mpesaReceiptNumber),
          },
        });

        // Get the errand and accepted bid details for notifications
        const errand = await tx.errand.findUnique({
          where: { id: pendingTransaction.errandId },
          include: {
            requester: { omit: { password: true } },
            bids: {
              include: {
                runner: { omit: { password: true } }
              }
            }
          }
        });

        if (!errand) {
          throw new Error('Errand not found');
        }

        // Find the accepted bid
        const acceptedBid = errand.bids.find(bid => bid.runnerId === pendingTransaction.payeeId);
        if (!acceptedBid) {
          throw new Error('Accepted bid not found');
        }

        // Update errand status and assign runner
        await tx.errand.update({
          where: { id: pendingTransaction.errandId },
          data: {
            status: "in_progress",
            runnerId: pendingTransaction.payeeId,
            finalPrice: pendingTransaction.amount,
            acceptedBidId: acceptedBid.id,
            startTime: new Date()
          },
        });

        // Accept the winning bid and reject others
        await tx.bid.update({
          where: { id: acceptedBid.id },
          data: { status: "accepted" },
        });

        const rejectedBids = errand.bids.filter(bid => bid.id !== acceptedBid.id);
        if (rejectedBids.length > 0) {
          await tx.bid.updateMany({
            where: {
              errandId: pendingTransaction.errandId,
              NOT: { id: acceptedBid.id },
            },
            data: { status: "rejected" },
          });
        }

        // Create payout record for escrow
        await tx.payout.create({
          data: {
            errandId: pendingTransaction.errandId,
            runnerId: pendingTransaction.payeeId,
            transactionId: pendingTransaction.id,
            amount: pendingTransaction.amount,
            status: "pending",
          },
        });

        // Create notifications
        const notifications = [];

        // Notify the accepted runner
        notifications.push({
          userId: pendingTransaction.payeeId,
          type: "bid_accepted" as const,
          title: "🎉 Congratulations! Your bid was accepted",
          message: `Your bid for "${errand.title}" has been accepted and payment has been secured in escrow. You can now start working on this errand.`,
          relatedId: pendingTransaction.errandId
        });

        // Notify the requester
        notifications.push({
          userId: pendingTransaction.payerId,
          type: "payment" as const,
          title: "Payment confirmed - Errand in progress",
          message: `Payment for "${errand.title}" has been confirmed. Your runner ${acceptedBid.runner.fullName} has been notified and can now start working on your errand.`,
          relatedId: pendingTransaction.errandId
        });

        // Notify rejected bidders
        for (const rejectedBid of rejectedBids) {
          notifications.push({
            userId: rejectedBid.runnerId,
            type: "errand_update" as const,
            title: "Bid not selected",
            message: `Unfortunately, your bid for "${errand.title}" was not selected. The requester chose another runner. Keep bidding on other errands!`,
            relatedId: pendingTransaction.errandId
          });
        }

        // Create all notifications
        await tx.notification.createMany({
          data: notifications
        });
      });
      console.log(
        `[callback] Payment for ${CheckoutRequestID} processed successfully.`,
      );
      await redisClient?.publish(topic, JSON.stringify(paymentData));
    } catch (e) {
      console.error(
        `[callback] DB transaction failed for ${CheckoutRequestID}:`,
        e,
      );
      await redisClient?.publish(
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
    await redisClient?.publish(topic, JSON.stringify(paymentData));
  }

  return { success: true, message: "Callback processed." };
});
