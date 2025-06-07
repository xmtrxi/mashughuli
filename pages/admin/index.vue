<script setup lang="ts">
import { toast } from "vue-sonner";
import { buttonVariants } from "~/components/ui/button";
import type { ApiResponse } from "~/types";

definePageMeta({ layout: "admin" });

interface AdminDashboardData {
  totalUsers: number;
  totalErrands: number;
  totalVolume: number;
  platformRevenue: number;
  openDisputes: number;
}

const { data: response, pending } = await useApiFetch<
  ApiResponse<AdminDashboardData>
>("/api/admin/dashboard");
const dashboardData = computed(() => response.value?.data);

const stats = computed(() => [
  {
    title: "Total Users",
    value: dashboardData.value?.totalUsers ?? 0,
    icon: "mdi:account-group",
  },
  {
    title: "Total Errands",
    value: dashboardData.value?.totalErrands ?? 0,
    icon: "mdi:format-list-bulleted",
  },
  {
    title: "Transaction Volume",
    value: formatCurrency(dashboardData.value?.totalVolume ?? 0, "KES"),
    icon: "mdi:cash-multiple",
  },
  {
    title: "Platform Revenue",
    value: formatCurrency(dashboardData.value?.platformRevenue ?? 0, "KES"),
    icon: "mdi:currency-usd",
  },
  {
    title: "Open Disputes",
    value: dashboardData.value?.openDisputes ?? 0,
    icon: "mdi:gavel",
  },
]);
</script>

<template>
  <div class="space-y-8">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-3xl font-bold tracking-tight">Admin Overview</h2>
        <p class="text-muted-foreground">
          A high-level view of platform activity.
        </p>
      </div>
    </div>
    <div
      v-if="pending"
      class="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-5"
    >
      <LoaderSkeleton v-for="i in 5" :key="i" />
    </div>
    <div v-else class="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-5">
      <DashboardStatCard
        v-for="stat in stats"
        :key="stat.title"
        :title="stat.title"
        :value="stat.value"
        :icon="stat.icon"
        description=""
      />
    </div>
    <div>
      <h3 class="text-xl font-semibold mb-4">Quick Actions</h3>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <NuxtLink
          to="/admin/users"
          :class="buttonVariants({ variant: 'outline' })"
          >Manage Users</NuxtLink
        >
        <NuxtLink
          to="/admin/errands"
          :class="buttonVariants({ variant: 'outline' })"
          >View Errands</NuxtLink
        >
        <NuxtLink
          to="/admin/disputes"
          :class="buttonVariants({ variant: 'outline' })"
          >Resolve Disputes</NuxtLink
        >
        <NuxtLink
          to="/admin/transactions"
          :class="buttonVariants({ variant: 'outline' })"
          >View Transactions</NuxtLink
        >
      </div>
    </div>
  </div>
</template>
