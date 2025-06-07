<script setup lang="ts">
import { ref } from "vue";
import type { Dispute, User, Errand } from "@prisma/client";
import type { ApiResponse } from "~/types";
import { format } from "date-fns";

definePageMeta({ layout: "admin" });

type DisputeWithRelations = Dispute & {
  errand: Pick<Errand, "title">;
  requester: Pick<User, "fullName">;
  runner: Pick<User, "fullName">;
  filedByUser: Pick<User, "fullName">;
};

const {
  data: response,
  pending,
  refresh,
} = await useApiFetch<ApiResponse<DisputeWithRelations[]>>(
  "/api/admin/disputes",
);
const disputes = computed(() => response.value?.data ?? []);
</script>

<template>
  <div class="space-y-8">
    <h2 class="text-3xl font-bold tracking-tight">Dispute Resolution Center</h2>
    <Card>
      <CardHeader>
        <CardTitle>Open Disputes</CardTitle>
        <CardDescription
          >Review and resolve user-filed disputes.</CardDescription
        >
      </CardHeader>
      <CardContent>
        <div v-if="pending" class="text-center py-10">
          <Icon name="mdi:loading" class="h-8 w-8 animate-spin" />
        </div>
        <div
          v-else-if="!disputes.length"
          class="text-center py-10 text-muted-foreground"
        >
          No open disputes. Great job!
        </div>
        <Table v-else>
          <TableHeader>
            <TableRow>
              <TableHead>Errand</TableHead>
              <TableHead>Filed By</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Date Filed</TableHead>
              <TableHead class="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="dispute in disputes" :key="dispute.id">
              <TableCell class="font-medium">{{
                dispute.errand.title
              }}</TableCell>
              <TableCell>{{ dispute.filedByUser.fullName }}</TableCell>
              <TableCell>{{ dispute.reason }}</TableCell>
              <TableCell>{{
                format(new Date(dispute.createdAt), "PP")
              }}</TableCell>
              <TableCell class="text-right">
                <Button variant="outline" size="sm">Resolve</Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </div>
</template>
