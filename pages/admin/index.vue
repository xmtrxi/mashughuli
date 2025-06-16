<script setup lang="ts">
import { toast } from "vue-sonner";
import { buttonVariants } from "~/components/ui/button";
import type { ApiResponse } from "~/types";
import { subDays, format } from "date-fns";

definePageMeta({ layout: "admin" });

interface AdminDashboardData {
  totalUsers: number;
  totalErrands: number;
  totalVolume: number;
  platformRevenue: number;
  openDisputes: number;
  charts: {
    users: Record<string, number>;
    errands: Record<string, number>;
  };
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

// Prepare chart data in the format Unovis expects: { x, y }[]
const userChartData = computed(() => {
  const data: { day: string; count: number }[] = [];
  if (!dashboardData.value) return data;

  for (let i = 29; i >= 0; i--) {
    const date = subDays(new Date(), i);
    const dayKey = format(date, "yyyy-MM-dd");
    const shortLabel = format(date, "MMM d");
    data.push({
      day: shortLabel,
      count: dashboardData.value.charts.users[dayKey] ?? 0,
    });
  }
  return data;
});

const errandChartData = computed(() => {
  const data: { day: string; count: number }[] = [];
  if (!dashboardData.value) return data;

  for (let i = 29; i >= 0; i--) {
    const date = subDays(new Date(), i);
    const dayKey = format(date, "yyyy-MM-dd");
    const shortLabel = format(date, "MMM d");
    data.push({
      day: shortLabel,
      count: dashboardData.value.charts.errands[dayKey] ?? 0,
    });
  }
  return data;
});
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

    <!-- Charts Section -->
    <div class="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>New Users (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="h-72">
            <ClientOnly>
              <ChartsUnovisLineChart
                v-if="!pending"
                :data="userChartData"
                :x="(d: any) => d.day"
                :y="(d: any) => d.count"
                :colors="{
                  line: 'hsl(var(--primary))',
                  area: 'user-area-gradient',
                }"
              />
              <template #fallback>
                <div class="w-full h-full flex justify-center items-center">
                  <Icon
                    name="mdi:loading"
                    class="animate-spin h-8 w-8 text-muted-foreground"
                  />
                </div>
              </template>
            </ClientOnly>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Errands Created (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="h-72">
            <ClientOnly>
              <ChartsUnovisLineChart
                v-if="!pending"
                :data="errandChartData"
                :x="(d: any) => d.day"
                :y="(d: any) => d.count"
                :colors="{
                  line: 'hsl(var(--chart-2))',
                  area: 'errand-area-gradient',
                }"
              />
              <template #fallback>
                <div class="w-full h-full flex justify-center items-center">
                  <Icon
                    name="mdi:loading"
                    class="animate-spin h-8 w-8 text-muted-foreground"
                  />
                </div>
              </template>
            </ClientOnly>
          </div>
        </CardContent>
      </Card>
    </div>

    <div>
      <h3 class="text-xl font-semibold mb-4">Quick Actions</h3>
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
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
          to="/admin/verifications"
          :class="buttonVariants({ variant: 'outline' })"
          >Verifications</NuxtLink
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
        <NuxtLink
          to="/admin/settings"
          :class="buttonVariants({ variant: 'outline' })"
          >System Settings</NuxtLink
        >
      </div>
    </div>
  </div>
</template>
