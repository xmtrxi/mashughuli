<script setup lang="ts">
import { cn } from "@/lib/utils";
import { buttonVariants } from "~/components/ui/button";
</script>
<template>
  <div class="flex min-h-screen bg-background">
    <aside class="hidden md:block w-64 border-r bg-card overflow-y-auto">
      <div class="py-6 space-y-6">
        <div class="px-6 flex flex-col items-center text-center space-y-3">
          <div
            class="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center"
          >
            <span class="text-2xl font-medium text-primary-400">JD</span>
          </div>
          <div>
            <h3 class="font-medium">John Doe</h3>
            <p class="text-sm text-muted-foreground capitalize">Runners</p>
          </div>
        </div>

        <Separator />

        <div class="space-y-1 px-3">
          <NuxtLink
            to="/dashboard"
            active-class="bg-primary-100 text-primary-600 font-medium"
            :class="
              cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors text-muted-foreground hover:text-foreground hover:bg-accent',
              )
            "
          >
            <Icon name="mdi:home" class="h-4 w-4" />
            <span>Dashboard</span>
          </NuxtLink>
        </div>
      </div>
    </aside>
    <div class="flex-1">
      <main class="p-4 md:p-6">
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
              <NuxtLink
                :class="buttonVariants({ variant: 'outline', size: 'sm' })"
              >
                View all
              </NuxtLink>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>
