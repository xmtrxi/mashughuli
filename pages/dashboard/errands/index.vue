<script setup lang="ts">
import { buttonVariants } from "~/components/ui/button";
import type { ApiResponse, ErrandWithRelationships } from "~/types";

const errands = ref([]);
const loading = ref(false);

const fetchErrands = async () => {
  loading.value = true;
  try {
    const { data } =
      await useApiFetch<ApiResponse<ErrandWithRelationships[]>>(
        "/api/me/errands",
      );
    if (data.value?.data) {
      errands.value = data.value.data;
    }
  } catch (e: any) {
  } finally {
    loading.value = false;
  }
};
fetchErrands();
</script>
<template>
  <div>
    <div class="space-y-8">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-3xl font-bold tracking-tight">Your Errands</h2>
          <p class="text-muted-foreground">Manage errands</p>
        </div>
      </div>
      <div>
        <NuxtLink
          to="/errands/new"
          :class="buttonVariants({ variant: 'default' })"
        >
          <Icon name="mdi:add" />
          Post An Errand
        </NuxtLink>
      </div>
    </div>
    <div v-if="loading" class="flex justify-center py-8">
      <div
        class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"
      ></div>
    </div>
    <div v-else-if="errands.length == 0">
      <p class="text-muted-foreground">No Errands found</p>
      <p class="text-sm text-muted-foreground mt-2">
        Create your first errand to get started
      </p>
    </div>
    <div class="py-4" v-else>
      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <ErrandsErrandCard
          v-for="errand in errands"
          :key="errand.id"
          :errand="errand"
        />
      </div>
    </div>
  </div>
</template>
