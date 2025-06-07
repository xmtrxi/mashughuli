<script setup lang="ts">
import { ref, computed } from "vue";
import { toast } from "vue-sonner";
import type { Payout, Errand } from "@prisma/client";
import type { ApiResponse } from "~/types";
import { format } from "date-fns";

type PayoutWithErrand = Payout & { errand: Pick<Errand, "title"> };

// This would be your actual API call
const { data: response, pending } =
  await useApiFetch<
    ApiResponse<{ balance: number; payouts: PayoutWithErrand[] }>
  >("/api/me/payouts");

const availableBalance = computed(() => response.value?.data.balance ?? 0);
const payouts = computed(() => response.value?.data.payouts ?? []);
const isLoading = ref(false);

async function requestPayout() {
  isLoading.value = true;
  toast.info("Requesting payout...");
  try {
    // In a real app, this would trigger a backend process.
    // For now, we simulate it.
    await new Promise((resolve) => setTimeout(resolve, 1500));
    toast.success("Payout request submitted!", {
      description:
        "You will receive the funds in your registered M-Pesa account shortly.",
    });
  } catch (error: any) {
    toast.error("Payout request failed.", { description: error.message });
  } finally {
    isLoading.value = false;
  }
}

const statusVariant = (status: string) => {
  return status === "completed"
    ? "default"
    : status === "failed"
      ? "destructive"
      : "secondary";
};
</script>

<template>
  <div class="space-y-8">
    <h2 class="text-3xl font-bold tracking-tight">Earnings & Payouts</h2>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card class="md:col-span-1">
        <CardHeader>
          <CardTitle>Available for Payout</CardTitle>
        </CardHeader>
        <CardContent>
          <p class="text-4xl font-bold">
            {{ formatCurrency(availableBalance, "KES") }}
          </p>
          <p class="text-sm text-muted-foreground mt-2">
            This is your total cleared earnings from completed errands.
          </p>
        </CardContent>
        <CardFooter>
          <Button
            @click="requestPayout"
            :disabled="isLoading || availableBalance <= 0"
            class="w-full"
          >
            <Icon
              v-if="isLoading"
              name="mdi:loading"
              class="animate-spin mr-2"
            />
            Request Payout
          </Button>
        </CardFooter>
      </Card>

      <Card class="md:col-span-2">
        <CardHeader>
          <CardTitle>Payout History</CardTitle>
          <CardDescription>A record of all your past payouts.</CardDescription>
        </CardHeader>
        <CardContent>
          <div v-if="pending" class="text-center py-10">
            <Icon name="mdi:loading" class="animate-spin h-8 w-8" />
          </div>
          <div
            v-else-if="!payouts.length"
            class="text-center py-10 text-muted-foreground"
          >
            No payout history yet.
          </div>
          <Table v-else>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Errand</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="payout in payouts" :key="payout.id">
                <TableCell>{{
                  format(new Date(payout.createdAt), "PP")
                }}</TableCell>
                <TableCell>{{
                  formatCurrency(payout.amount, "KES")
                }}</TableCell>
                <TableCell class="truncate max-w-xs">{{
                  payout.errand.title
                }}</TableCell>
                <TableCell>
                  <Badge :variant="statusVariant(payout.status)">{{
                    payout.status
                  }}</Badge>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
