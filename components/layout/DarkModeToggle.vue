<template>
  <Button
    variant="ghost"
    size="icon"
    @click="toggleColorMode"
    class="h-10 w-10 rounded-full transition-all duration-200 hover:bg-accent/10"
    :title="isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
  >
    <Icon
      v-if="isDark"
      name="mdi:weather-sunny"
      class="h-5 w-5 text-yellow-500 transition-all duration-300"
    />
    <Icon
      v-else
      name="mdi:weather-night"
      class="h-5 w-5 text-slate-600 transition-all duration-300"
    />
  </Button>
</template>

<script setup lang="ts">
import { Button } from "~/components/ui/button";

const colorMode = useColorMode()

const isDark = computed(() => colorMode.value === 'dark')

const toggleColorMode = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}
</script>

<style scoped>
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}
</style>
