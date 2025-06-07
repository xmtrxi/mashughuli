<script setup lang="ts">
import type { Errand } from "@prisma/client";
import type { ApiResponse } from "~/types";
import { format } from "date-fns";

definePageMeta({ layout: "admin" });

type ErrandWithRelations = Errand & {
  requester: { fullName: string };
  runner: { fullName: string } | null;
  category: { name: string };
};

const { data: response, pending } =
  await useApiFetch<ApiResponse<ErrandWithRelations[]>>("/api/admin/errands");
const errands = computed(() => response.value?.data ?? []);

const statusVariant = (status: string) => {
  switch (status) {
    case "completed":
      return "default";
    case "open":
      return "outline";
    case "in_progress":
      return "secondary";
    case "cancelled":
      return "destructive";
    case "disputed":
      return "destructive";
    default:
      return "outline";
  }
};
</script>

<template>
  <div class="space-y-8">
    <h2 class="text-3xl font-bold tracking-tight">Errand Management</h2>
    <Card>
      <CardHeader>
        <CardTitle>All Errands</CardTitle>
        <CardDescription
          >Oversee all errands posted on the platform.</CardDescription
        >
      </CardHeader>
      <CardContent>
        <div v-if="pending" class="text-center py-10">
          <Icon name="mdi:loading" class="h-8 w-8 animate-spin" />
        </div>
        <Table v-else>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Requester</TableHead>
              <TableHead>Runner</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Posted On</TableHead>
              <TableHead class="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="errand in errands" :key="errand.id">
              <TableCell class="font-medium">{{ errand.title }}</TableCell>
              <TableCell>{{ errand.requester.fullName }}</TableCell>
              <TableCell>{{ errand.runner?.fullName ?? "N/A" }}</TableCell>
              <TableCell>
                <Badge :variant="statusVariant(errand.status)">{{
                  errand.status.replace("_", " ")
                }}</Badge>
              </TableCell>
              <TableCell>{{
                format(new Date(errand.createdAt), "PP")
              }}</TableCell>
              <TableCell class="text-right">
                <NuxtLink
                  :to="`/errands/${errand.id}`"
                  :class="buttonVariants({ variant: 'ghost', size: 'sm' })"
                  >View</NuxtLink
                >
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </div>
</template>
