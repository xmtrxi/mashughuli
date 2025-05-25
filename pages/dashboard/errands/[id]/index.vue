<script setup lang="ts">
import type { ApiResponse, ErrandWithRelationships } from "~/types";

const route = useRoute();
const { data } = await useApiFetch<ApiResponse<ErrandWithRelationships>>(
  `/api/errands/${route.params.id}`,
);
const errand = ref(data.value?.data);
</script>
<template>
  <div v-if="!errand" />
  <ErrandsErrandViewer v-else :errand="errand" :show-bid-form="false" />
</template>
