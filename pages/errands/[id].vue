<script setup lang="ts">
import type { ApiResponse, ErrandWithRelationships } from "~/types";

const route = useRoute();
const { data, pending, error } = await useApiFetch<
  ApiResponse<ErrandWithRelationships>
>(`/api/errands/${route.params.id}`);
const errand = computed(() => data.value?.data);
</script>
<template>
  <div>
    <div v-if="pending" class="flex justify-center items-center h-screen">
      <Icon name="mdi:loading" class="h-12 w-12 animate-spin text-primary" />
    </div>
    <div v-else-if="error || !errand" class="text-center py-20">
      <h2 class="text-2xl font-semibold">Errand Not Found</h2>
      <p class="text-muted-foreground">
        The errand you are looking for does not exist or has been removed.
      </p>
    </div>
    <ErrandsErrandViewer v-else :errand="errand" :show-bid-form="true" />
  </div>
</template>
