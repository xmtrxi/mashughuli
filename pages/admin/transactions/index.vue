<script setup lang="ts">
import { ref, computed } from "vue";
import type { Transaction, User, Errand } from "@prisma/client";
import type { ApiResponse } from "~/types";
import { format } from "date-fns";
import { formatCurrency } from "~/utils";

definePageMeta({ layout: "admin" });

type TransactionWithRelations = Transaction & {
  payer: Pick<User, "fullName">;
  payee: Pick<User, "fullName">;
  errand: Pick<Errand, "title">;
};

const { data: response, pending } = await useApiFetch<
  ApiResponse<TransactionWithRelations[]>
>("/api/admin/transactions");
const transactions = computed(() => response.value?.data ?? []);

const statusVariant = (status: string) => {
  switch (status) {
    case "completed":
      return "default";
    case "failed":
      return "destructive";
    case "refunded":
      return "secondary";
    default:
      return "outline";
  }
};
</script>

<template>
  <div class="space-y-8">
    <h2 class="text-3xl font-bold tracking-tight">Platform Transactions</h2>
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
        <CardDescription
          >A complete log of all payments made on the platform.</CardDescription
        >
      </CardHeader>
      <CardContent>
        <div v-if="pending" class="text-center py-10">
          <Icon name="mdi:loading" class="h-8 w-8 animate-spin" />
        </div>
        <div
          v-else-if="!transactions.length"
          class="text-center py-10 text-muted-foreground"
        >
          No transactions have been made yet.
        </div>
        <Table v-else>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Errand</TableHead>
              <TableHead>Payer (Requester)</TableHead>
              <TableHead>Payee (Runner)</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Platform Fee</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="tx in transactions" :key="tx.id">
              <TableCell>{{ format(new Date(tx.createdAt), "PPp") }}</TableCell>
              <TableCell class="font-medium">{{ tx.errand.title }}</TableCell>
              <TableCell>{{ tx.payer.fullName }}</TableCell>
              <TableCell>{{ tx.payee.fullName }}</TableCell>
              <TableCell>{{ formatCurrency(tx.amount, "KES") }}</TableCell>
              <TableCell>{{ formatCurrency(tx.platformFee, "KES") }}</TableCell>
              <TableCell>
                <Badge :variant="statusVariant(tx.status)">{{
                  tx.status
                }}</Badge>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </div>
</template>
