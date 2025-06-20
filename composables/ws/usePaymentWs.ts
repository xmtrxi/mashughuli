const PAYMENT_TIMEOUT_MS = 90000; // 90 seconds

export const usePaymentWs = (checkoutId: string, merchantId: string) => {
  const { ws, status, close } = useWebSocket("/_ws", {
    autoReconnect: false, // We will manage this manually
  });

  const paymentStatus = ref<
    "pending" | "success" | "failed" | "timeout" | "connecting"
  >("connecting");
  const paymentMessage = ref("Awaiting payment confirmation...");
  const paymentData = ref<any>(null);
  const isSubscribed = ref(false);

  let timeout: NodeJS.Timeout | null = null;

  const startTimeout = () => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      if (paymentStatus.value === "pending") {
        paymentStatus.value = "timeout";
        paymentMessage.value = "Payment timed out. Please try again.";
        cleanup();
      }
    }, PAYMENT_TIMEOUT_MS);
  };

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
        paymentMessage.value =
          "Please complete the M-Pesa payment prompt on your phone.";
        startTimeout();
        console.log("Subscribed to payment updates");
      } else if (data.type === "payment_update") {
        if (timeout) clearTimeout(timeout); // Clear the timeout on receiving an update

        paymentData.value = data;
        paymentStatus.value = data.success ? "success" : "failed";
        paymentMessage.value = data.message || data.resultDesc;

        console.log("Payment update received:", {
          status: paymentStatus.value,
          message: paymentMessage.value,
        });
        cleanup(); // Clean up after receiving the final status
      }
    } catch (error) {
      console.error("Failed to parse WebSocket message:", error);
    }
  };

  const cleanup = () => {
    if (timeout) clearTimeout(timeout);
    if (ws.value && ws.value.readyState === WebSocket.OPEN) {
      close(); // Close the WebSocket connection
    }
    console.log("Payment WS cleaned up.");
  };

  watchEffect(() => {
    if (status.value === "OPEN") {
      subscribe();
    }
  });

  onMounted(() => {
    if (ws.value) {
      ws.value.addEventListener("message", handleMessage);
    }
  });

  onUnmounted(() => {
    if (ws.value) {
      ws.value.removeEventListener("message", handleMessage);
    }
    cleanup();
  });

  return {
    paymentStatus: readonly(paymentStatus),
    paymentMessage: readonly(paymentMessage),
    paymentData: readonly(paymentData),
    isSubscribed: readonly(isSubscribed),
    connectionStatus: status,
    cleanup, // Expose cleanup to the parent composable
  };
};
