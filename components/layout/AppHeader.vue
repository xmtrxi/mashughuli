<script lang="ts" setup>
import { buttonVariants } from "../ui/button";

const isMenuOpen = ref(false);
const colorMode = useColorMode();

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

const authStore = useAuthStore();

// Toggle dark mode
const toggleDarkMode = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark';
};

// Close mobile menu when clicking outside
const handleOutsideClick = () => {
  isMenuOpen.value = false;
};

// Handle mobile menu navigation
const handleMobileNavigation = (href: string) => {
  isMenuOpen.value = false;
  navigateTo(href);
};

// Close menu on route change
watch(() => useRoute().path, () => {
  isMenuOpen.value = false;
});
</script>

<template>
  <header class="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm border-b sticky top-0 z-50 left-0 right-0">
    <div class="container mx-auto py-3 px-4">
      <div class="flex justify-between items-center">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center space-x-2 hover:opacity-80 transition-opacity">
          <div
            class="h-8 w-8 rounded-full bg-primary flex items-center justify-center"
          >
            <span class="text-primary-foreground font-bold">M</span>
          </div>
          <span class="text-foreground font-bold text-xl">Mashughuli</span>
        </NuxtLink>

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
        <div class="flex items-center space-x-2 md:space-x-4">
          <!-- Dark Mode Toggle -->
          <Button
            variant="ghost"
            size="sm"
            @click="toggleDarkMode"
            class="hidden sm:flex"
            :title="colorMode.value === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
          >
            <Icon
              :name="colorMode.value === 'dark' ? 'mdi:weather-sunny' : 'mdi:weather-night'"
              class="h-5 w-5"
            />
          </Button>
          
          <!-- Notifications (only for logged in users) -->
          <div v-if="authStore.user && authStore.token" class="hidden sm:block">
            <!-- NotificationProvider will inject the notification bell here -->
          </div>
          
          <NuxtLink
            v-if="!authStore.user && !authStore.token"
            to="/auth/login"
            :class="
              buttonVariants({
                variant: 'outline',
                class:
                  'hidden md:block px-4 py-2 bg-background text-foreground border border-border rounded-lg hover:bg-muted transition-colors',
              })
            "
          >
            Sign In
          </NuxtLink>
          <NuxtLink
            v-if="!authStore.user && !authStore.token"
            to="/auth/register"
            :class="
              buttonVariants({
                variant: 'default',
                class:
                  'hidden md:block px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors',
              })
            "
          >
            Join Now
          </NuxtLink>
          <NuxtLink
            v-if="
              authStore.user &&
              authStore.token &&
              authStore.user.primaryRole == 'admin'
            "
            to="/admin"
            :class="
              buttonVariants({
                variant: 'default',
                class:
                  'hidden md:block px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition',
              })
            "
          >
            Admin Dashboard
          </NuxtLink>
          <NuxtLink
            v-if="authStore.user && authStore.token"
            to="/dashboard"
            :class="
              buttonVariants({
                variant: 'default',
                class:
                  'hidden md:block px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition',
              })
            "
          >
            Dashboard
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
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 -translate-y-4"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-4"
      >
        <div
          v-if="isMenuOpen"
          class="absolute top-full left-0 right-0 md:hidden bg-background/95 backdrop-blur border-b shadow-lg z-[999]"
        >
          <nav class="container mx-auto px-4 py-6">
            <div class="flex flex-col space-y-4">
              <NuxtLink
                v-for="link in links"
                :key="link.href"
                :to="link.href"
                @click="handleMobileNavigation(link.href)"
                active-class="text-primary font-semibold"
                class="text-foreground hover:text-primary font-medium py-2 transition-colors"
                >{{ link.name }}</NuxtLink
              >
              
              <!-- Dark Mode Toggle (Mobile) -->
              <Button
                variant="ghost"
                @click="toggleDarkMode"
                class="justify-start p-2"
              >
                <Icon
                  :name="colorMode.value === 'dark' ? 'mdi:weather-sunny' : 'mdi:weather-night'"
                  class="h-5 w-5 mr-2"
                />
                {{ colorMode.value === 'dark' ? 'Light Mode' : 'Dark Mode' }}
              </Button>

              <!-- Auth Buttons (Mobile) -->
              <div v-if="!authStore.user && !authStore.token" class="flex flex-col space-y-3 pt-4 border-t">
                <NuxtLink
                  to="/auth/login"
                  @click="isMenuOpen = false"
                  class="w-full px-4 py-3 text-center text-primary border border-primary rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  Sign In
                </NuxtLink>
                <NuxtLink
                  to="/auth/register"
                  @click="isMenuOpen = false"
                  class="w-full px-4 py-3 text-center bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Join Now
                </NuxtLink>
              </div>
              
              <!-- Dashboard Links (Mobile) -->
              <div v-if="authStore.user && authStore.token" class="flex flex-col space-y-3 pt-4 border-t">
                <NuxtLink
                  v-if="authStore.user.primaryRole === 'admin'"
                  to="/admin"
                  @click="isMenuOpen = false"
                  class="w-full px-4 py-3 text-center bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Admin Dashboard
                </NuxtLink>
                <NuxtLink
                  to="/dashboard"
                  @click="isMenuOpen = false"
                  class="w-full px-4 py-3 text-center bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Dashboard
                </NuxtLink>
              </div>
            </div>
          </nav>
        </div>
      </Transition>
    </div>
  </header>
</template>
