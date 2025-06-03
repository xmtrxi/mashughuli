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
  if (callback.ResultCode != 0) {
    notifyPayment(
      `${callback.CheckoutRequestID}:${callback.MerchantRequestID}`,
      callback,
    );
  }
  return { success: true };
});
