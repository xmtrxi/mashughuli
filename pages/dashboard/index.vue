<script setup lang="ts">
import { toast } from "vue-sonner";
import { buttonVariants } from "~/components/ui/button";
import type { ApiResponse, ErrandWithRelationships } from "~/types";

interface DashboardData {
  counts: {
    title: string;
    description: string;
    icon: string;
    count: number;
  }[];
  errands: ErrandWithRelationships[];
}
const dashboardData = ref<DashboardData | null>(null);
const loading = ref(false);

const fetchDashboardData = async () => {
  loading.value = true;
  try {
    const { data } =
      await useApiFetch<ApiResponse<DashboardData>>("/api/me/dashboard");
    if (data.value?.data) {
      dashboardData.value = data.value.data;
    }
    console.log(dashboardData.value);
  } catch (e: any) {
    toast.error("An error occurred while fetching dashboard data");
  } finally {
    loading.value = false;
  }
};
fetchDashboardData();
</script>
<template>
  <div class="space-y-8">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p class="text-muted-foreground">
          Welcome back! Here's an overview of your activity.
        </p>
      </div>
    </div>
    <div class="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
      <template v-if="loading">
        <LoaderSkeleton v-for="i in 8" :key="i" />
      </template>

      <template v-else>
        <DashboardStatCard
          v-for="count in dashboardData?.counts"
          :key="count.title"
          :title="count.title"
          :description="count.description"
          :icon="count.icon"
          :value="count.count"
        />
      </template>
    </div>
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">Recent Errands</h3>
        <NuxtLink :class="buttonVariants({ variant: 'outline', size: 'sm' })">
          View all
        </NuxtLink>
      </div>
      <div class="space-y-4">
        <template v-if="loading">
          <LoaderSkeleton v-for="i in 3" />
        </template>
        <template v-else>
          <Card v-for="errand in dashboardData?.errands">
            <CardHeader class="">
              <div class="flex justify-between items-start">
                <NuxtLink :to="`/dashboard/errands/${errand.id}`">
                  <CardTitle class="text-base hover:underline">
                    {{ errand.title }}
                  </CardTitle>
                </NuxtLink>
                <Badge>
                  {{
                    errand.status.charAt(0).toUpperCase() +
                    errand.status.slice(1)
                  }}
                </Badge>
              </div>
            </CardHeader>
            <CardContent class="pt-0">
              <div class="flex justify-between text-sm">
                <span class="text-muted-foreground"
                  >Due
                  {{
                    new Date(errand.deadline ?? "").toLocaleDateString()
                  }}</span
                >
                <span>{{
                  errand.runner
                    ? `${errand.runner.fullName}`
                    : `No runner assigned`
                }}</span>
              </div>
            </CardContent>
          </Card>
        </template>
      </div>
    </div>
  </div>
</template>
