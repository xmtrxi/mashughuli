<script setup lang="ts">
import { toast } from "vue-sonner";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { buttonVariants } from "~/components/ui/button";
import { useConditionalPaymentWs } from "~/composables/ws/useConditionalPaymentWs";
import type {
  ApiResponse,
  BidsWithRelationships,
  TransactionsWithRelationShips,
} from "~/types";
import { paymentSchema } from "~/shared/schemas/payment.schema";
import { Loader2 } from "lucide-vue-next";

interface MpesaPaymentResponse {
  merchantRequestId: string;
  checkoutRequestId: string;
  message: string;
}

const route = useRoute();
const bidId = route.params.bidsId as string;
const errandId = route.params.id as string;
const loading = ref({
  payments: false,
});
const transactions = ref<TransactionsWithRelationShips[]>([]);

const { data: bidResponse, pending: bidPending } = await useApiFetch<
  ApiResponse<BidsWithRelationships>
>(`/api/bids/${bidId}`);
const fetchPayments = async () => {
  loading.value.payments = true;
  try {
    const { data } = await useApiFetch<
      ApiResponse<TransactionsWithRelationShips[]>
    >(`/api/errands/${errandId}/payments`);
    if (data.value?.data) {
      transactions.value = data.value.data;
    }
  } finally {
    loading.value.payments = false;
  }
};
fetchPayments();
const bid = computed(() => bidResponse.value?.data);

const { handleSubmit, errors } = useForm({
  validationSchema: toTypedSchema(paymentSchema),
  initialValues: { errandId: errandId, bidId: bidId, phone: "" },
});

const isPaymentInitiated = ref(false);
const platformFee = computed(() =>
  bid.value ? parseFloat(bid.value.price.toString()) * 0.1 : 0,
);
const totalAmount = computed(() =>
  bid.value ? parseFloat(bid.value.price.toString()) + platformFee.value : 0,
);

const {
  paymentStatus,
  paymentMessage,
  isActive: isWsActive,
  initializeConnection,
  cleanup,
} = useConditionalPaymentWs();

const submitPayment = handleSubmit(async (values) => {
  isPaymentInitiated.value = true;
  try {
    const { data } = await useApiRequest<ApiResponse<MpesaPaymentResponse>>(
      "/api/payments/stk",
      {
        method: "POST",
        body: values,
      },
    );
    if (data) {
      toast.info("STK Push Sent!", {
        description: "Please check your phone to complete the payment.",
      });
      initializeConnection(data.checkoutRequestId, data.merchantRequestId);
    }
  } catch (e: any) {
    toast.error(e.data?.message || "Failed to initiate payment.");
  } finally {
    isPaymentInitiated.value = false;
  }
});

watch(paymentStatus, (status) => {
  if (status === "success") {
    toast.success("Payment Successful!", {
      description:
        "The runner has been notified and the errand is now in progress.",
      duration: 10000,
    });
    setTimeout(() => {
      navigateTo(`/dashboard/errands/${errandId}`);
    }, 3000);
  } else if (status === "failed" || status === "timeout") {
    toast.error(`Payment ${status.charAt(0).toUpperCase() + status.slice(1)}`, {
      description:
        paymentMessage.value ||
        "The payment could not be completed. Please try again.",
      duration: 10000,
    });
  }
});

const buttonText = computed(() => {
  if (isPaymentInitiated.value) return "Sending prompt...";
  if (isWsActive.value && paymentStatus.value === "pending")
    return "Awaiting payment...";
  if (
    isWsActive.value &&
    (paymentStatus.value === "failed" || paymentStatus.value === "timeout")
  )
    return "Try Again";
  return "Accept & Pay";
});

onUnmounted(() => {
  cleanup();
});
</script>
<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex items-center mb-6">
      <NuxtLink
        v-if="errandId"
        :class="
          buttonVariants({ variant: 'ghost', class: 'flex items-center' })
        "
        :to="`/errands/${errandId}`"
      >
        <Icon name="mdi:arrow-left" class="h-4 w-4 mr-2" />
        Back to Errand
      </NuxtLink>
    </div>

    <div v-if="bidPending" class="text-center py-10">
      <Icon name="mdi:loading" class="animate-spin h-10 w-10 text-primary" />
    </div>
    <div v-else-if="!bid" class="text-center py-10">
      <h2 class="text-2xl font-bold">Bid Not Found</h2>
      <p class="text-muted-foreground">
        This bid may have been withdrawn or is no longer available.
      </p>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Accepting Bid for: {{ bid.errand.title }}</CardTitle>
            <CardDescription>
              You are about to accept the bid from
              <strong class="text-foreground">{{ bid.runner.fullName }}</strong
              >.
            </CardDescription>
          </CardHeader>
          <CardContent class="space-y-6">
            <div class="flex items-start gap-4 p-4 bg-muted rounded-lg">
              <Avatar class="h-16 w-16">
                <AvatarImage
                  v-if="bid.runner.avatarUrl"
                  :src="bid.runner.avatarUrl"
                />
                <AvatarFallback class="text-2xl">{{
                  bid.runner.fullName.charAt(0).toUpperCase()
                }}</AvatarFallback>
              </Avatar>
              <div>
                <h3 class="font-semibold text-lg">{{ bid.runner.fullName }}</h3>
                <div
                  class="flex items-center text-sm text-muted-foreground mt-1"
                >
                  <span class="flex items-center">
                    <Icon name="mdi:star" class="text-yellow-400 mr-1" />
                    4.8 (23 reviews)
                  </span>
                </div>
              </div>
            </div>
            <div class="space-y-2">
              <p class="text-sm font-medium">Bid Amount</p>
              <p class="text-2xl font-bold">
                {{ formatCurrency(bid.price, "Kes") }}
              </p>
            </div>
            <div v-if="bid.experienceDetails">
              <p class="text-sm font-medium mb-1">Runner's Message</p>
              <p
                class="text-muted-foreground border p-3 rounded-md bg-background"
              >
                {{ bid.experienceDetails }}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <Card v-if="loading.payments">
          <CardContent>
            <div class="flex justify-center">
              <Loader2 class="animate-spin" />
            </div>
          </CardContent>
        </Card>
        <Card v-else>
          <CardHeader>
            <CardTitle>Payment Summary</CardTitle>
            <CardDescription>
              <span v-if="transactions && transactions.length > 0">
                Transaction history for this errand.
              </span>
              <span v-else>
                Funds will be held in escrow and released to the runner upon
                successful completion.
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <!-- Show existing transactions if they exist -->
            <div
              v-if="transactions && transactions.length > 0"
              class="space-y-4"
            >
              <div
                v-for="transaction in transactions"
                :key="transaction.id"
                class="border rounded-lg p-4 space-y-3"
              >
                <div class="flex justify-between items-center">
                  <span class="font-medium"
                    >Transaction #{{ transaction.id.slice(-8) }}</span
                  >
                  <span
                    :class="{
                      'bg-green-100 text-green-800':
                        transaction.status === 'completed',
                      'bg-yellow-100 text-yellow-800':
                        transaction.status === 'pending',
                      'bg-red-100 text-red-800':
                        transaction.status === 'failed',
                    }"
                    class="px-2 py-1 rounded-full text-xs font-medium capitalize"
                  >
                    {{ transaction.status }}
                  </span>
                </div>

                <div class="space-y-2 border-b pb-3">
                  <div class="flex justify-between">
                    <span>Amount</span>
                    <span>{{ formatCurrency(transaction.amount, "Kes") }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>Platform Fee</span>
                    <span>{{
                      formatCurrency(transaction.platformFee, "Kes")
                    }}</span>
                  </div>
                  <div class="flex justify-between font-medium">
                    <span>Total</span>
                    <span>{{
                      formatCurrency(
                        Number(transaction.amount) +
                          Number(transaction.platformFee),
                        "Kes",
                      )
                    }}</span>
                  </div>
                </div>

                <div class="space-y-1 text-sm text-muted-foreground">
                  <div
                    v-if="transaction.transactionReference"
                    class="flex justify-between"
                  >
                    <span>Reference:</span>
                    <span class="font-mono">{{
                      transaction.transactionReference
                    }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>Date:</span>
                    <span>{{
                      new Date(transaction.createdAt).toLocaleDateString()
                    }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Show payment form if no transactions exist -->
            <div v-else>
              <div class="space-y-2 border-b pb-4">
                <div class="flex justify-between">
                  <span>Bid amount</span>
                  <span>{{ formatCurrency(bid.price, "Kes") }}</span>
                </div>
                <div class="flex justify-between">
                  <span>Platform Fee (10%)</span>
                  <span>{{ formatCurrency(platformFee, "Kes") }}</span>
                </div>
              </div>
              <div class="flex justify-between font-bold text-lg pt-4">
                <span>Total Due</span>
                <span>{{ formatCurrency(totalAmount, "Kes") }}</span>
              </div>
            </div>
          </CardContent>

          <CardFooter class="flex flex-col gap-4">
            <!-- Show payment form only if no completed transactions -->
            <div
              v-if="
                !transactions ||
                transactions.length === 0 ||
                !transactions.some((t) => t.status === 'completed')
              "
              class="w-full"
            >
              <form @submit="submitPayment" class="w-full space-y-4">
                <FormField v-slot="{ componentField }" name="phone">
                  <FormItem>
                    <FormLabel>M-Pesa Phone Number</FormLabel>
                    <div class="relative">
                      <span
                        class="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground text-sm"
                      >
                        +254
                      </span>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="712345678"
                          class="pl-12"
                          v-bind="componentField"
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                </FormField>
                <Button
                  type="submit"
                  class="w-full"
                  :disabled="
                    isPaymentInitiated ||
                    (isWsActive && paymentStatus === 'pending')
                  "
                >
                  <Icon
                    v-if="
                      isPaymentInitiated ||
                      (isWsActive && paymentStatus === 'pending')
                    "
                    name="mdi:loading"
                    class="animate-spin mr-2"
                  />
                  <span>{{ buttonText }}</span>
                </Button>
              </form>
            </div>

            <!-- Show message if payment is already completed -->
            <div
              v-else-if="transactions.some((t) => t.status === 'completed')"
              class="w-full text-center p-4 bg-green-50 border border-green-200 rounded-lg"
            >
              <p class="text-sm text-green-700 font-medium">
                Payment has been completed successfully.
              </p>
            </div>

            <div
              v-if="isWsActive"
              class="w-full text-center p-2 bg-blue-50 border border-blue-200 rounded-lg"
            >
              <p class="text-sm text-blue-700 font-medium">
                {{ paymentMessage }}
              </p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  </div>
</template>
