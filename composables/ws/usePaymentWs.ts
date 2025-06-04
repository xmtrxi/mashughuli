export const usePaymentWs = (checkoutId: string, merchantId: string) => {
  const { ws, status } = useWebSocket("/_ws");
  const paymentStatus = ref<"pending" | "success" | "failed" | "connecting">(
    "connecting",
  );
  const paymentMessage = ref("");
  const paymentData = ref<any>(null);
  const isSubscribed = ref(false);

  const subscribe = () => {
    if (
      ws.value &&
      ws.value.readyState === WebSocket.OPEN &&
      !isSubscribed.value
    ) {
      ws.value.send(
        JSON.stringify({
          type: "subscribe",
          checkoutRequestId: checkoutId,
          merchantRequestId: merchantId,
        }),
      );
    }
  };

  const handleMessage = (event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);

      if (data.type === "subscribed") {
        isSubscribed.value = true;
        paymentStatus.value = "pending";
        console.log("Subscribed to payment updates");
      } else if (data.type === "payment_update") {
        paymentData.value = data;
        paymentStatus.value = data.success ? "success" : "failed";
        paymentMessage.value = data.message || data.resultDesc;

        console.log("Payment update received:", {
          status: paymentStatus.value,
          message: paymentMessage.value,
        });
      }
    } catch (error) {
      console.error("Failed to parse WebSocket message:", error);
    }
  };

  // Watch for WebSocket connection status
  watchEffect(() => {
    if (status.value === "OPEN") {
      subscribe();
    } else if (status.value === "CLOSED" || status.value === "CONNECTING") {
      isSubscribed.value = false;
      if (paymentStatus.value === "connecting") {
        paymentStatus.value = "pending";
      }
    }
  });

  // Set up message listener
  onMounted(() => {
    if (ws.value) {
      ws.value.addEventListener("message", handleMessage);
    }
  });

  onUnmounted(() => {
    if (ws.value) {
      ws.value.removeEventListener("message", handleMessage);
    }
  });

  return {
    paymentStatus: readonly(paymentStatus),
    paymentMessage: readonly(paymentMessage),
    paymentData: readonly(paymentData),
    isSubscribed: readonly(isSubscribed),
    connectionStatus: status,
  };
};
