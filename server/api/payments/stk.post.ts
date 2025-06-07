import { processFormPayments } from "~/server/services/mpesa/mpesa.service";
import { paymentSchema } from "~/shared/schemas/payment.schema";
import { useAuthUser } from "~/server/services/auth/auth.service";
import prisma from "~/lib/prisma";
import { errandService } from "~/server/services/errands";

export default defineEventHandler(async (event) => {
  const user = await useAuthUser(event);
  const { data, error } = await readValidatedBody(
    event,
    paymentSchema.safeParse,
  );

  if (error) {
    throw createError({
      statusCode: 422,
      message: error.message,
    });
  }

  try {
    const { errandId, bidId, phone } = data;

    // 1. Fetch Errand and the specific Bid to ensure they are valid
    const bid = await prisma.bid.findUnique({
      where: { id: bidId, errandId: errandId },
      include: { errand: true },
    });

    if (!bid) {
      throw createError({
        statusCode: 404,
        message: "Bid not found or does not belong to this errand.",
      });
    }

    if (bid.errand.requesterId !== user.id) {
      throw createError({
        statusCode: 403,
        message: "You are not authorized to pay for this errand.",
      });
    }

    const { updateErrand } = await errandService();
    const amount = bid.price.toNumber();
    const platformFee = amount * 0.1; // 10% platform fee
    const totalAmount = amount + platformFee;
    return await updateErrand(errandId, {
      runnerId: bid.runnerId,
      finalPrice: bid.price,
    });

    // 2. Initiate M-Pesa STK Push
    const callBack = await processFormPayments({
      phoneNumber: phone,
      accountNumber: user.fullName, // The requester's name as the account number
      amount: totalAmount, // Pay the total amount including fee
      description: `Payment for: ${bid.errand.title}`,
    });

    // 3. Create a PENDING transaction record. This is crucial for tracking.
    await prisma.transaction.create({
      data: {
        errandId: errandId,
        payerId: user.id, // The requester
        payeeId: bid.runnerId, // The runner who will be paid
        amount: amount,
        platformFee: platformFee,
        status: "pending",
        transactionReference: callBack.CheckoutRequestID, // Track with M-Pesa's ID
      },
    });

    return {
      success: true,
      data: {
        checkoutRequestId: callBack.CheckoutRequestID,
        merchantRequestId: callBack.MerchantRequestID,
        message: callBack.CustomerMessage,
      },
    };
  } catch (e: any) {
    console.error("STK Push Error:", e);
    throw createError({
      statusCode: e.statusCode || 500,
      message: e.message || "An error occurred while initiating payment.",
    });
  }
});
