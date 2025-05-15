<script setup lang="ts">
import { cn } from "@/lib/utils";
import { buttonVariants } from "~/components/ui/button";

const isMobile = useIsMobile();
const links = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: "mdi:home",
  },
  {
    name: "My Errands",
    href: "/dashboard/errands",
    icon: "arcticons:jobstreet",
  },
  {
    name: "Messages",
    href: "/dashboard/messages",
    icon: "mdi:message",
  },
  {
    name: "Notifications",
    href: "/dashboard/notifications",
    icon: "mdi:notifications",
  },
  {
    name: "Statitics",
    href: "/statistics",
    icon: "mdi:graph",
  },
];
const settingsLinks = [
  {
    name: "My Profile",
    href: "/dashboard/profile",
    icon: "mdi:user",
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: "mdi:settings",
  },
  {
    name: "Logout",
    href: "/dashboard/logout",
    icon: "mdi:logout",
  },
];
</script>
<template>
  <div class="flex min-h-screen bg-background">
    <aside class="hidden md:block w-64 border-r bg-card overflow-y-auto">
      <LayoutDashboardSideBar :links="links" :settings-links="settingsLinks" />
    </aside>
    <div class="flex-1">
      <template v-if="isMobile">
        <header class="sticky top-0 z-10 border-b bg-background p-4">
          <div class="flex justify-between items-center">
            <NuxtLink to="/" class="font-bold text-xl text-primary-400">
              Mashughuli
            </NuxtLink>

            <Sheet>
              <SheetTrigger>
                <Button
                  variant="ghost"
                  size="icon"
                  class="flex items-center justify-center"
                >
                  <Icon name="mdi:menu" class="h-5 w-5" />
                </Button>
              </SheetTrigger>

              <SheetContent side="left" class="p-0">
                <SheetHeader class="p-6 pb-2">
                  <SheetTitle>Dashboard</SheetTitle>
                </SheetHeader>

                <LayoutDashboardSideBar
                  :links="links"
                  :settings-links="settingsLinks"
                />
              </SheetContent>
            </Sheet>
          </div>
        </header>
      </template>

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
