import { StkCallback, StkCallbackHook } from "~/types";
import { notifyPayment } from "../_ws";

export default defineEventHandler(async (event) => {
  const hook = (await readBody(event)) as StkCallbackHook;
  const callback = hook.Body.stkCallback;
  if (!callback) {
    throw createError({
      statusCode: 400,
      message: "No callback found",
    });
  }
  // Create room ID
  const roomId = `${callback.CheckoutRequestID}:${callback.MerchantRequestID}`;

  // Prepare payment data based on result
  const paymentData = {
    checkoutRequestId: callback.CheckoutRequestID,
    merchantRequestId: callback.MerchantRequestID,
    resultCode: callback.ResultCode,
    resultDesc: callback.ResultDesc,
    success: callback.ResultCode === 0,
    message: callback.ResultDesc,
  };

  // Add transaction details if payment was successful
  if (callback.ResultCode === 0 && callback.CallbackMetadata?.Item) {
    const metadata = callback.CallbackMetadata.Item;
    const transactionId = metadata.find(
      (item) => item.Name === "MpesaReceiptNumber",
    )?.Value;
    const transactionDate = metadata.find(
      (item) => item.Name === "TransactionDate",
    )?.Value;
    const phoneNumber = metadata.find(
      (item) => item.Name === "PhoneNumber",
    )?.Value;

    paymentData.transactionId = transactionId;
    paymentData.transactionDate = transactionDate;
    paymentData.phoneNumber = phoneNumber;
  }

  // Notify connected clients
  const notified = notifyPayment(roomId, paymentData);

  console.log(
    `[callback] Payment ${callback.ResultCode === 0 ? "success" : "failed"} for ${roomId}, notified: ${notified}`,
  );

  return { success: true };
});
