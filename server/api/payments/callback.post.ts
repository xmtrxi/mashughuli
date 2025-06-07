import { StkCallbackHook } from "~/types";
import prisma from "~/lib/prisma";
import { notifyPayment } from "../_ws";
// In a real application, you would uncomment these and implement the email service
// import { sendErrandPaidEmailToRequester, sendErrandAssignedEmailToRunner } from '~/server/services/email.service';

export default defineEventHandler(async (event) => {
  const hook = (await readBody(event)) as StkCallbackHook;
  const callback = hook.Body.stkCallback;

  if (!callback) {
    throw createError({
      statusCode: 400,
      message: "Invalid M-Pesa callback received.",
    });
  }

  const { MerchantRequestID, CheckoutRequestID, ResultCode, ResultDesc } =
    callback;
  const roomId = `${CheckoutRequestID}:${MerchantRequestID}`;

  const paymentData = {
    checkoutRequestId: CheckoutRequestID,
    merchantRequestId: MerchantRequestID,
    resultCode: ResultCode,
    resultDesc: ResultDesc,
    success: ResultCode === 0,
    message: ResultDesc,
    transactionId: null as string | number | undefined,
  };

  const pendingTransaction = await prisma.transaction.findFirst({
    where: {
      transactionReference: CheckoutRequestID,
      status: "pending",
    },
  });

  if (!pendingTransaction) {
    console.error(
      `[callback] No pending transaction found for CheckoutRequestID: ${CheckoutRequestID}`,
    );
    notifyPayment(roomId, paymentData);
    return {
      success: false,
      message: "Transaction not found or already processed.",
    };
  }

  if (ResultCode === 0 && callback.CallbackMetadata?.Item) {
    // ---- PAYMENT SUCCESSFUL ----
    const metadata = callback.CallbackMetadata.Item;
    const mpesaReceiptNumber = metadata.find(
      (item) => item.Name === "MpesaReceiptNumber",
    )?.Value;

    try {
      const result = await prisma.$transaction(async (tx) => {
        // 1. Update our transaction record with the successful payment details
        const updatedTransaction = await tx.transaction.update({
          where: { id: pendingTransaction.id },
          data: {
            status: "completed",
            transactionReference: String(mpesaReceiptNumber), // Overwrite with the final M-Pesa receipt
          },
        });

        // 2. Update the Errand: Assign runner, set price, and change status to 'in_progress'
        const errand = await tx.errand.update({
          where: { id: pendingTransaction.errandId },
          data: {
            status: "in_progress",
            runnerId: pendingTransaction.payeeId, // Assign the runner
            finalPrice: pendingTransaction.amount, // Set the final price from the bid
          },
          include: {
            requester: true,
            runner: true,
          },
        });

        // 3. Update the accepted Bid's status
        await tx.bid.updateMany({
          where: { errandId: errand.id, runnerId: errand.runnerId! },
          data: { status: "accepted" },
        });

        // 4. Reject all other bids for this errand
        await tx.bid.updateMany({
          where: { errandId: errand.id, NOT: { runnerId: errand.runnerId! } },
          data: { status: "rejected" },
        });

        // 5. Create a Payout record for the runner (this will be processed later)
        await tx.payout.create({
          data: {
            errandId: errand.id,
            runnerId: errand.runnerId!,
            transactionId: updatedTransaction.id,
            amount: updatedTransaction.amount, // The amount due to the runner (pre-fee)
            status: "pending", // Payout status is pending until admin processes it
          },
        });

        // TODO: UNCOMMENT AND IMPLEMENT EMAIL SERVICE
        // if (errand.requester && errand.runner) {
        //   await sendErrandPaidEmailToRequester(errand.requester, errand);
        //   await sendErrandAssignedEmailToRunner(errand.runner, errand);
        // }

        return { errand, updatedTransaction };
      });

      console.log(
        `[callback] Successfully processed payment for errand ${result.errand.id}`,
      );
      paymentData.transactionId = mpesaReceiptNumber;
    } catch (e: any) {
      console.error(
        `[callback] CRITICAL ERROR during transaction for CheckoutRequestID ${CheckoutRequestID}:`,
        e,
      );
      // If the transaction fails, we mark our internal record as failed to prevent double processing
      await prisma.transaction.update({
        where: { id: pendingTransaction.id },
        data: { status: "failed" },
      });
      paymentData.success = false;
      paymentData.message =
        "An internal error occurred while processing the payment.";
    }
  } else {
    // ---- PAYMENT FAILED ----
    await prisma.transaction.update({
      where: { id: pendingTransaction.id },
      data: { status: "failed" },
    });
    console.log(
      `[callback] Payment failed for CheckoutRequestID ${CheckoutRequestID}. Reason: ${ResultDesc}`,
    );
  }

  // Notify the connected WebSocket client about the final status
  notifyPayment(roomId, paymentData);

  return { success: true, message: "Callback processed." };
});
