<script setup lang="ts">
import type { ApiResponse, ErrandWithRelationships } from "~/types";

const { data } =
  await useApiFetch<ApiResponse<ErrandWithRelationships[]>>("/api/me/errands");
const errands = ref(data.value?.data);
</script>
<template>
  <div v-if="!errands"></div>
  <div v-else>
    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <ErrandsErrandCard
        v-for="errand in errands"
        :key="errand.id"
        :errand="errand"
      />
    </div>
  </div>
</template>
