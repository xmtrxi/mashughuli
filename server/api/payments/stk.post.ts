import { z } from "zod";
import { errandService } from "~/server/services/errands";
import { processFormPayments } from "~/server/services/mpesa/mpesa.service";
import { updateErrandSchema } from "~/shared/schemas/errands.schema";
import { paymentSchema } from "~/shared/schemas/payment.schema";

export default defineEventHandler(async (event) => {
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
    const { getErrandById, updateErrand } = errandService();
    const errand = await getErrandById(data.errandId);
    if (!errand) {
      throw createError({
        statusCode: 404,
        message: "Errand not found",
      });
    }
    await updateErrand(data.errandId, {
      finalPrice: data.amount,
    });

    const callBack = await processFormPayments({
      phoneNumber: data.phone,
      accountNumber: errand.requester.fullName,
      amount: data.amount,
      description: `Payment for errand ${errand.title}`,
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
    throw createError({
      statusCode: e.statusCode || 500,
      message: e.message || "An error occurred",
    });
  }
});
