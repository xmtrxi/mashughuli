import { usePaymentWs } from "./usePaymentWs";

export const useConditionalPaymentWs = () => {
  const wsManager = ref<ReturnType<typeof usePaymentWs> | null>(null);

  const isActive = computed(() => !!wsManager.value);
  const paymentStatus = computed(
    () => wsManager.value?.paymentStatus || "idle",
  );
  const paymentMessage = computed(() => wsManager.value?.paymentMessage || "");
  const paymentData = computed(() => wsManager.value?.paymentData || null);
  const isSubscribed = computed(() => wsManager.value?.isSubscribed || false);
  const connectionStatus = computed(
    () => wsManager.value?.connectionStatus || "CLOSED",
  );

  const initializeConnection = (checkoutId: string, merchantId: string) => {
    if (!wsManager.value) {
      wsManager.value = usePaymentWs(checkoutId, merchantId);
    }
  };

  const cleanup = () => {
    if (wsManager.value) {
      wsManager.value.cleanup();
      wsManager.value = null;
    }
  };

  return {
    paymentStatus,
    paymentMessage,
    paymentData,
    isSubscribed,
    connectionStatus,
    isActive: readonly(isActive),
    initializeConnection,
    cleanup,
  };
};
