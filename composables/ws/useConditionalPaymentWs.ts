import { usePaymentWs } from "./usePaymentWs";

export const useConditionalPaymentWs = () => {
  const wsManager = ref<ReturnType<typeof usePaymentWs> | null>(null);
  const isActive = ref(false);

  const paymentStatus = computed(
    () => wsManager.value?.paymentStatus || "idle",
  );
  const paymentMessage = computed(() => wsManager.value?.paymentMessage || "");
  const paymentData = computed(() => wsManager.value?.paymentData || null);
  const isSubscribed = computed(() => wsManager.value?.isSubscribed || false);

  const initializeConnection = (checkoutId: string, merchantId: string) => {
    if (!isActive.value) {
      wsManager.value = usePaymentWs(checkoutId, merchantId);
      isActive.value = true;
    }
  };

  const cleanup = () => {
    wsManager.value = null;
    isActive.value = false;
  };

  return {
    paymentStatus,
    paymentMessage,
    paymentData,
    isSubscribed,
    isActive: readonly(isActive),
    initializeConnection,
    cleanup,
  };
};
