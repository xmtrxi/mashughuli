<!-- components/AppHeader.vue -->
<template>
  <header class="bg-white shadow-sm sticky top-0">
    <div class="container mx-auto py-4">
      <div class="flex justify-between items-center">
        <!-- Logo -->
        <div class="flex items-center space-x-2">
          <div
            class="h-8 w-8 rounded-full bg-primary flex items-center justify-center"
          >
            <span class="text-white font-bold">H</span>
          </div>
          <span class="text-dark font-bold text-xl">Haraka Hub</span>
        </div>

        <!-- Desktop Navigation -->
        <nav class="hidden md:flex items-center space-x-8">
          <NuxtLink to="/" class="text-gray-dark hover:text-primary font-medium"
            >Home</NuxtLink
          >
          <NuxtLink
            to="/explore"
            class="text-gray-dark hover:text-primary font-medium"
            >Explore</NuxtLink
          >
          <NuxtLink
            to="/events"
            class="text-gray-dark hover:text-primary font-medium"
            >Events</NuxtLink
          >
          <NuxtLink
            to="/community"
            class="text-gray-dark hover:text-primary font-medium"
            >Community</NuxtLink
          >
          <NuxtLink
            to="/about"
            class="text-gray-dark hover:text-primary font-medium"
            >About</NuxtLink
          >
        </nav>

        <!-- Actions -->
        <div class="flex items-center space-x-4">
          <button
            class="hidden md:block px-4 py-2 text-primary border border-primary rounded-lg hover:bg-primary hover:text-white transition"
          >
            Sign In
          </button>
          <button
            class="hidden md:block px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
          >
            Join Now
          </button>

          <!-- Mobile menu button -->
          <button
            @click="isMenuOpen = !isMenuOpen"
            class="md:hidden p-2 text-gray-dark"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                v-if="!isMenuOpen"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
              <path
                v-else
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile Navigation Menu -->
      <div v-if="isMenuOpen" class="md:hidden mt-4 pb-4">
        <nav class="flex flex-col space-y-4">
          <NuxtLink to="/" class="text-gray-dark hover:text-primary font-medium"
            >Home</NuxtLink
          >
          <NuxtLink
            to="/explore"
            class="text-gray-dark hover:text-primary font-medium"
            >Explore</NuxtLink
          >
          <NuxtLink
            to="/events"
            class="text-gray-dark hover:text-primary font-medium"
            >Events</NuxtLink
          >
          <NuxtLink
            to="/community"
            class="text-gray-dark hover:text-primary font-medium"
            >Community</NuxtLink
          >
          <NuxtLink
            to="/about"
            class="text-gray-dark hover:text-primary font-medium"
            >About</NuxtLink
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

<script setup>
import { ref } from "vue";

const isMenuOpen = ref(false);
</script>
