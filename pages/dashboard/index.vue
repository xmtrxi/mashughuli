<script setup lang="ts">
import { buttonVariants } from "~/components/ui/button";

definePageMeta({
  layout: "dashboard",
});
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
      <Tabs default-value="requester">
        <TabsList>
          <TabsTrigger value="requester">Requester View</TabsTrigger>
          <TabsTrigger value="runner">Runners View</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
    <div class="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      <DashboardStatCard
        title="Total Amount"
        description="Total Amount Collected"
        icon="mdi:home"
        value="Ksh 100"
        v-for="i in 6"
        :key="i"
      />
    </div>
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">Recent Errands</h3>
        <NuxtLink :class="buttonVariants({ variant: 'outline', size: 'sm' })">
          View all
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
