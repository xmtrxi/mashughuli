export const usePaymentWs = (checkoutId: string, mechantId: string) => {
  const { ws } = useWebSocket("/_ws");
  const paymentStatus = ref<"pending" | "success" | "failed">("pending");
  const paymentMessage = ref("");

  onMounted(() => {
    if (ws.value) {
      ws.value.send(
        JSON.stringify({
          type: "subscribe",
          `${checkoutId}:${mechantId}`,
        }),
      );

      ws.value.addEventListener("message", (event) => {
        const data = JSON.parse(event.data);

        if (data.type === "payment_update") {
          paymentStatus.value = data.success ? "success" : "failed";
          paymentMessage.value = data.message;
        }
      });
    }
  
  });

  return {
    paymentStatus: readonly(paymentStatus),
    paymentMessage: readonly(paymentMessage),
  };
};
