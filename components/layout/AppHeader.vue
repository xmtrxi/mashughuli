<script lang="ts" setup>
import { buttonVariants } from "../ui/button";

const isMenuOpen = ref(false);

const links = [
  {
    name: "Home",
    href: "/",
  },
  {
    name: "Find Errands",
    href: "/errands",
  },
  {
    name: "Find Runners",
    href: "/runners",
  },
  {
    name: "How It Works",
    href: "/how-it-works",
  },
  {
    name: "About",
    href: "/about",
  },
  {
    name: "Contact",
    href: "/contact",
  },
];
</script>

<template>
  <header class="bg-white shadow-sm sticky top-0">
    <div class="container mx-auto py-4">
      <div class="flex justify-between items-center">
        <!-- Logo -->
        <div class="flex items-center space-x-2">
          <div
            class="h-8 w-8 rounded-full bg-primary flex items-center justify-center"
          >
            <span class="text-white font-bold">M</span>
          </div>
          <span class="text-dark font-bold text-xl">Mashughuli Hub</span>
        </div>

        <!-- Desktop Navigation -->
        <nav class="hidden md:flex items-center space-x-8">
          <NuxtLink
            v-for="link in links"
            :key="link.href"
            :to="link.href"
            active-class="text-primary"
            class="text-gray-dark hover:text-primary font-medium"
            >{{ link.name }}</NuxtLink
          >
        </nav>

        <!-- Actions -->
        <div class="flex items-center space-x-4">
          <NuxtLink
            to="/auth/login"
            :class="
              buttonVariants({
                variant: 'default',
                class:
                  'hidden md:block px-4 py-2 bg-white text-primary border border-primary rounded-lg hover:bg-primary hover:text-white transition',
              })
            "
          >
            Sign In
          </NuxtLink>
          <NuxtLink
            to="/auth/register"
            :class="
              buttonVariants({
                variant: 'default',
                class:
                  'hidden md:block px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition',
              })
            "
          >
            Join Now
          </NuxtLink>

          <!-- Mobile menu button -->
          <button
            class="md:hidden p-2 text-gray-dark"
            @click="isMenuOpen = !isMenuOpen"
          >
            <Icon v-if="!isMenuOpen" name="mdi:menu" class="h-6 w-6" />
            <Icon v-if="isMenuOpen" name="mdi:close" class="h-6 w-6" />
          </button>
        </div>
      </div>

      <!-- Mobile Navigation Menu -->
      <div
        v-if="isMenuOpen"
        class="fixed inset-0 top-[64px] md:hidden bg-white z-[999] overflow-auto shadow-lg"
      >
        <nav class="flex flex-col space-y-4 pl-3">
          <NuxtLink
            v-for="link in links"
            :key="link.href"
            :to="link.href"
            active-class="text-primary"
            class="text-gray-dark hover:text-primary font-medium"
            >{{ link.name }}</NuxtLink
          >

          <div class="flex space-x-4 pt-2">
            <button
              class="px-4 py-2 text-primary border border-primary rounded-lg hover:bg-primary hover:text-white transition flex-1"
            >
              Sign In
            </button>
            <button
              class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition flex-1"
            >
              Join Now
            </button>
          </div>
        </nav>
      </div>
    </div>
  </header>
</template>
