<script setup lang="ts">
const isMobile = useIsMobile();
const authStore = useAuthStore();
const userRole = computed(() => authStore.user?.primaryRole);

const requesterLinks = [
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
    name: "Post Errand",
    href: "/errands/new",
    icon: "mdi:plus-box",
  },
  {
    name: "Messages",
    href: "/dashboard/messages",
    icon: "mdi:message",
  },
];

const runnerLinks = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: "mdi:home",
  },
  {
    name: "Find Errands",
    href: "/errands",
    icon: "mdi:magnify",
  },
  {
    name: "My Bids",
    href: "/dashboard/bids",
    icon: "mdi:gavel",
  },
  {
    name: "Messages",
    href: "/dashboard/messages",
    icon: "mdi:message",
  },
  {
    name: "Payouts",
    href: "/dashboard/payouts",
    icon: "mdi:cash-multiple",
  },
];

const links = computed(() => {
  if (userRole.value === "runner") return runnerLinks;
  return requesterLinks;
});

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
];
</script>
<template>
  <div class="flex min-h-screen bg-background transition-colors duration-200">
    <!-- Desktop Sidebar -->
    <aside
      class="hidden lg:block md:block w-64 border-r bg-card/50 backdrop-blur-sm overflow-y-auto"
    >
      <LayoutDashboardSideBar :links="links" :settings-links="settingsLinks" />
    </aside>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- Mobile Header -->
      <template v-if="isMobile">
        <header
          class="sticky top-0 z-20 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4"
        >
          <div class="flex justify-between items-center">
            <NuxtLink
              to="/"
              class="font-bold text-xl text-primary hover:opacity-80 transition-opacity"
            >
              Mashughuli
            </NuxtLink>

            <div class="flex items-center gap-2">
              <!-- Notifications for mobile -->
              <!-- This will be auto-injected by NotificationProvider -->

              <!-- Mobile Menu -->
              <Sheet>
                <SheetTrigger as-child>
                  <Button
                    variant="ghost"
                    size="icon"
                    class="flex items-center justify-center"
                  >
                    <Icon name="mdi:menu" class="h-5 w-5" />
                  </Button>
                </SheetTrigger>

                <SheetContent side="left" class="p-0 w-80 overflow-auto">
                  <SheetHeader class="p-6 pb-2">
                    <SheetTitle>Dashboard</SheetTitle>
                  </SheetHeader>

                  <LayoutDashboardSideBar
                    :links="links"
                    :settings-links="settingsLinks"
                    class="px-4"
                  />
                  <div
                    class="px-6 flex flex-col items-center text-center space-y-3"
                  >
                    <LazyNotificationsNotificationProvider />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </header>
      </template>

      <!-- Desktop Header -->
      <div v-else>
        <LayoutAppDashboardHeader />
      </div>

      <!-- Main Content -->
      <main class="p-4 md:p-6 lg:p-8 flex-1 overflow-auto">
        <div class="max-w-7xl mx-auto">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>
