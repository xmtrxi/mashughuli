<script setup lang="ts">
import { NuxtLink } from "#components";
import {
  Bell,
  ChevronDown,
  User,
  Settings,
  LogOut,
  HomeIcon,
} from "lucide-vue-next";

const authStore = useAuthStore();
</script>
<template>
  <header
    class="sticky top-0 z-40 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60"
  >
    <div class="flex h-16 items-center justify-between px-4 md:px-6">
      <!-- Left section -->
      <div class="flex items-center gap-4">
        <div class="hidden md:block">
          <NuxtLink to="/" class="text-2xl font-bold">Mashughuli</NuxtLink>
        </div>
      </div>

      <!-- Right section -->
      <div class="flex items-center gap-4">
        <!-- Notifications -->
        <Button variant="ghost" size="sm" class="relative">
          <Bell class="h-5 w-5" />
          <span
            class="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"
          ></span>
        </Button>

        <!-- User menu -->
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="ghost" size="sm" class="flex items-center gap-2">
              <div
                class="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center"
              >
                <User class="h-4 w-4 text-blue-600" />
              </div>
              <span class="hidden md:block">{{
                authStore.user?.fullName
              }}</span>
              <ChevronDown class="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" class="bg-white">
            <DropdownMenuItem :as="NuxtLink" to="/dashboard/profile">
              <User class="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem
              v-if="
                authStore.user &&
                authStore.token &&
                authStore.user.primaryRole == 'admin'
              "
              :as="NuxtLink"
              to="/admin"
            >
              <HomeIcon class="mr-2 h-4 w-4" />
              Admin Dashboard
            </DropdownMenuItem>
            <DropdownMenuItem :as="NuxtLink" to="/dashboard/settings">
              <Settings class="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem
              @click.prevent="authStore.logout()"
              class="cursor-pointer"
            >
              <LogOut class="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  </header>
</template>
