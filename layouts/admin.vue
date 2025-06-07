<script setup lang="ts">
const isMobile = useIsMobile();

const adminLinks = [
  { name: "Overview", href: "/admin", icon: "mdi:view-dashboard" },
  { name: "Users", href: "/admin/users", icon: "mdi:account-group" },
  { name: "Errands", href: "/admin/errands", icon: "mdi:format-list-bulleted" },
  {
    name: "Categories",
    href: "/dashboard/categories",
    icon: "mdi:tag-multiple",
  },
  { name: "Disputes", href: "/admin/disputes", icon: "mdi:gavel" },
  { name: "Transactions", href: "/admin/transactions", icon: "mdi:cash" },
];

const settingsLinks = [
  { name: "Profile", href: "/dashboard/profile", icon: "mdi:user" },
  { name: "Settings", href: "/admin/settings", icon: "mdi:settings" },
];
</script>
<template>
  <div class="flex min-h-screen bg-background">
    <aside class="hidden md:block w-64 border-r bg-card overflow-y-auto">
      <LayoutDashboardSideBar
        :links="adminLinks"
        :settings-links="settingsLinks"
      />
    </aside>
    <div class="flex-1 flex flex-col">
      <template v-if="isMobile">
        <header class="sticky top-0 z-10 border-b bg-background p-4">
          <div class="flex justify-between items-center">
            <NuxtLink to="/admin" class="font-bold text-xl text-primary">
              Admin Panel
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
                  <SheetTitle>Admin Menu</SheetTitle>
                </SheetHeader>

                <LayoutDashboardSideBar
                  :links="adminLinks"
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
