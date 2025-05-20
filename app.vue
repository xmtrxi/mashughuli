<script setup lang="ts">
const route = useRoute();

const layout = computed(() => {
  return route.path.startsWith("/dashboard") ? "dashboard" : "default";
});
</script>
<template>
  <div>
    <div class="font-sans min-h-screen">
      <NuxtRouteAnnouncer />
      <Toaster rich-colors position="top-center" />
      <NuxtLayout :name="layout">
        <NuxtPage />
      </NuxtLayout>
    </div>
  </div>
</template>
