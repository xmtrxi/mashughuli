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
  <div class="flex min-h-screen bg-background">
    <aside class="hidden md:block w-64 border-r bg-card overflow-y-auto">
      <LayoutDashboardSideBar :links="links" :settings-links="settingsLinks" />
    </aside>
    <div class="flex-1 flex flex-col">
      <template v-if="isMobile">
        <header class="sticky top-0 z-10 border-b bg-background p-4">
          <div class="flex justify-between items-center">
            <NuxtLink to="/" class="font-bold text-xl text-primary">
              Mashughuli
            </NuxtLink>

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
      <div v-else>
        <LayoutAppDashboardHeader />
      </div>

      <main class="p-4 md:p-6 flex-1">
        <slot />
      </main>
    </div>
  </div>
</template>
