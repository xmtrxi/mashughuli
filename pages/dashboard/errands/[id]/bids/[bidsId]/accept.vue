<script setup lang="ts">
import { toast } from "vue-sonner";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { buttonVariants } from "~/components/ui/button";
import { useConditionalPaymentWs } from "~/composables/ws/useConditionalPaymentWs";
import type { ApiResponse, BidsWithRelationships } from "~/types";
import { paymentSchema } from "~/shared/schemas/payment.schema";

interface MpesaPaymentResponse {
  merchantRequestId: string;
  checkoutRequestId: string;
  message: string;
}

const route = useRoute();
const bidId = route.params.bidsId as string;
const errandId = route.params.id as string;

const { data: bidResponse, pending: bidPending } = await useApiFetch<
  ApiResponse<BidsWithRelationships>
>(`/api/bids/${bidId}`);
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
        <Card>
          <CardHeader>
            <CardTitle>Payment Summary</CardTitle>
            <CardDescription
              >Funds will be held in escrow and released to the runner upon
              successful completion.</CardDescription
            >
          </CardHeader>
          <CardContent>
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
          </CardContent>
          <CardFooter class="flex flex-col gap-4">
            <form @submit="submitPayment" class="w-full space-y-4">
              <FormField v-slot="{ componentField }" name="phone">
                <FormItem>
                  <FormLabel>M-Pesa Phone Number</FormLabel>
                  <div class="relative">
                    <span
                      class="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground text-sm"
                      >+254</span
                    >
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
