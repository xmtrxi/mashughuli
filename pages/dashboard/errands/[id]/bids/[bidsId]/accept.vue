<script setup lang="ts">
import { buttonVariants } from "~/components/ui/button";
import type { ApiResponse, BidsWithRelationships } from "~/types";

const route = useRoute();
const bidsId = route.params.bidsId;

const { data } = await useApiFetch<ApiResponse<BidsWithRelationships>>(
  `/api/bids/${bidsId}`,
);
const bid = ref(data.value?.data);
const form = ref({
  phoneNumber: "",
  errandsId: bid.value?.errandId,
  amount: bid.value?.price ?? "",
});

const submitPayment = async () => {
  try {
    const {} = await useApiRequest("/api/payment/stk", form.value);
  } catch (e: any) {}
};
</script>
<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex items-center mb-6">
      <NuxtLink
        :class="
          buttonVariants({ variant: 'ghost', class: 'flex items-center' })
        "
        :to="`/errands/${bid?.errandId}`"
      >
        <Icon name="mdi:arrow-left" class="h-4 w-4 mr-2" />
        Back
      </NuxtLink>
    </div>
    <h1 class="text-3xl font-bold mb-6">Accept Bid</h1>
    <div v-if="!bid"></div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Bid Details</CardTitle>
            <CardDescription>
              For errand: {{ bid.errand.title }}
            </CardDescription>
          </CardHeader>
          <CardContent class="space-y-6">
            <div class="flex items-start gap-4">
              <Avatar class="h-12 w-12">
                <AvatarImage
                  v-if="bid.runner.avatarUrl"
                  :src="bid.runner.avatarUrl"
                />
                <AvatarFallback>{{
                  bid.runner.fullName.charAt(0).toUpperCase()
                }}</AvatarFallback>
              </Avatar>
              <div>
                <h3 class="font-medium">Test</h3>
                <div class="flex items-center text-sm text-muted-foreground">
                  <span class="flex items-center">
                    <Icon name="mdi:star" v-for="i in 5" :key="i" />
                    <span class="ml-1">4</span>
                  </span>
                  <span class="mx-2">*</span>
                  <span>3 errands completed</span>
                </div>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-sm font-medium">Bid Amount</p>
                <p class="text-xl font-bold">
                  {{ formatCurrency(bid.price, "Kes") }}
                </p>
              </div>
              <div>
                <p class="text-sm font-medium">Estimated Time</p>
                <p class="text-xl font-bold">
                  {{ bid.estimatedCompletionTime }}
                </p>
              </div>
            </div>

            <div>
              <p class="text-sm font-medium mb-2">
                Message from {{ bid.runner.fullName }}
              </p>
              <p class="text-muted-foreground">{{ bid.experienceDetails }}</p>
            </div>
          </CardContent>
        </Card>
      </div>
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Payment Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              <div class="flex justify-between">
                <span>Bid amount</span>
                <span>{{ formatCurrency(bid.price, "Kes") }}</span>
              </div>
              <div class="flex justify-between">
                <span>Service fee</span>
                <span>{{ formatCurrency(bid.price * 0.1, "Kes") }}</span>
              </div>
              <div class="border-t pt-2 mt-2">
                <div class="flex justify-between font-medium">
                  <span>Total</span>
                  <span>{{ formatCurrency(bid.price * 1.1, "Kes") }}</span>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter class="flex flex-col gap-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button class="w-full">Accept Bid & Proceed to Payment</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm Bid Acceptance</DialogTitle>
                  <DialogDescription>
                    You are about to accept the bid from
                    <b class="font-black font-semibold">{{
                      bid.runner.fullName
                    }}</b>
                    for {{ formatCurrency(bid.price, "Kes") }}. After payment,
                    they will be notified and can start working on your errand.
                  </DialogDescription>
                </DialogHeader>
                <div class="py-4">
                  <p class="font-medium">
                    Total amount: {{ formatCurrency(bid.price * 1.1, "Kes") }}
                  </p>
                  <p class="text-sm text-muted-foreground mt-2">
                    This includes a 10% service fee to cover platform costs.
                  </p>
                </div>
                <DialogFooter>
                  <DialogClose>
                    <Button variant="outline"> Cancel</Button>
                  </DialogClose>
                  <Dialog>
                    <DialogTrigger as-child>
                      <Button class="flex items-center gap-2">
                        <Icon name="mdi:credit-card" class="h-4 w-4" />
                        Proceed to Payment
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Process Payment</DialogTitle>
                        <DialogDescription>
                          Pay for your payment to start
                        </DialogDescription>
                      </DialogHeader>
                      <div class="py-4 space-y-2">
                        <div class="">
                          <Label>Final Price</Label>
                          <Input v-model="form.amount" class="" />
                        </div>
                        <div>
                          <Label>Phone Number</Label>
                          <Input v-model="form.phoneNumber" class="" />
                        </div>
                        <div>
                          <Button @click.prevent="submitPayment">Submit</Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <NuxtLink
              :to="`/errands/${bid.errandId}`"
              :class="buttonVariants({ variant: 'outline' })"
              >Cancel</NuxtLink
            >
          </CardFooter>
        </Card>
      </div>
    </div>
  </div>
</template>
