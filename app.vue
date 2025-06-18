<script setup lang="ts">
import "vue-sonner/style.css";
const route = useRoute();

const layout = computed(() => {
  if (route.path.startsWith("/admin")) {
    return "admin";
  }
  if (route.path.startsWith("/dashboard")) {
    return "dashboard";
  }
  return "default";
});
</script>
<template>
  <div>
    <div class="font-sans min-h-screen">
      <NuxtLoadingIndicator color="black" />
      <NuxtRouteAnnouncer />
      <Toaster rich-colors />
      <NuxtLayout :name="layout">
        <NuxtPage />
      </NuxtLayout>
    </div>
  </div>
</template>
