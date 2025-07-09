<script setup lang="ts">
import type { Prisma } from "@prisma/client";
import { buttonVariants } from "~/components/ui/button";
import VirtualScrollList from "~/components/ui/VirtualScrollList.vue";
import type { ApiResponse, ErrandWithRelationships } from "~/types";

const searchQuery = ref("");
const categoryFilter = ref("all");
const priorityFilter = ref("all");
const sortBy = ref("newest");

const categoryOptions = [
  { value: "shopping", label: "Shopping" },
  { value: "delivery", label: "Delivery" },
  { value: "home-services", label: "Home Services" },
  { value: "administrative", label: "Administrative" },
  { value: "pet-care", label: "Pet Care" },
];

const priorityOptions = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

const sortOptions = [
  { value: "newest", label: "Due Soon" },
  { value: "oldest", label: "Due Later" },
  { value: "budget-high", label: "Budget (High to Low)" },
  { value: "budget-low", label: "Budget (Low to High)" },
  { value: "most-bids", label: "Most Bids" },
];
type ErrandWithCategory = Prisma.ErrandGetPayload<{
  include: { category: true; requester: true };
}>;
const { data: errands, error } =
  await useApiFetch<ApiResponse<ErrandWithRelationships[]>>("/api/errands");
const filteredErrands = computed(() => {
  return errands.value?.data
    .filter((errand) => {
      const search = searchQuery.value.toLowerCase();
      const matchesSearch =
        errand.title.toLowerCase().includes(search) ||
        errand.description.toLowerCase().includes(search);

      const matchesCategory =
        categoryFilter.value === "all" ||
        errand.category.name.toLowerCase() ===
          categoryFilter.value.toLowerCase();

      const matchesPriority =
        priorityFilter.value === "all" ||
        errand.priority === priorityFilter.value;

      return matchesSearch && matchesCategory && matchesPriority;
    })
    .sort((a, b) => {
      switch (sortBy.value) {
        case "newest":
          return new Date(b.deadline) - new Date(a.deadline);
        case "oldest":
          return new Date(a.deadline) - new Date(b.deadline);
        // case "budget-high":
        //   return b.budget.max - a.budget.max;
        // case "budget-low":
        //   return a.budget.min - b.budget.min;
        // case "most-bids":
        //   return b.bids - a.bids;
        default:
          return 0;
      }
    });
});

function resetFilters() {
  searchQuery.value = "";
  categoryFilter.value = "all";
  priorityFilter.value = "all";
  sortBy.value = "newest";
}
</script>

<template>
  <div class="container mx-auto px-4 py-12">
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-bold">Post a New Errand</h1>
        <p class="text-muted-foreground mt-2 max-w-2xl mx-auto">
          Fill out the form below with details about your errand to connect with
          runners who can help you get it done.
        </p>
      </div>
      <NuxtLink
        to="/errands/new"
        :class="buttonVariants({ variant: 'default' })"
      >
        <Icon name="mdi:add" />
        Post An Errand
      </NuxtLink>
    </div>
    <div class="space-y-6">
      <!-- Search and filter section -->
      <div class="space-y-4">
        <div class="relative">
          <Icon
            name="mdi:search"
            class="absolute left-3 top-3 h-4 w-4 text-muted-foreground"
          />
          <Input
            v-model="searchQuery"
            type="text"
            placeholder="Search errands..."
            class="pl-10 input"
          />
        </div>

        <div class="flex flex-col sm:flex-row gap-3">
          <Select v-model="categoryFilter">
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all"> All Categories </SelectItem>
              <SelectItem
                v-for="cat in categoryOptions"
                :key="cat.value"
                :value="cat.value"
              >
                {{ cat.label }}
              </SelectItem>
            </SelectContent>
          </Select>

          <Select v-model="priorityFilter">
            <SelectTrigger>
              <SelectValue placeholder="All Priorities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all"> All Priorities </SelectItem>
              <SelectItem
                v-for="prio in priorityOptions"
                :key="prio.value"
                :value="prio.value"
              >
                {{ prio.label }}
              </SelectItem>
            </SelectContent>
          </Select>
          <Select v-model="sortBy">
            <SelectTrigger>
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="opt in sortOptions"
                :key="opt.value"
                :value="opt.value"
              >
                {{ opt.label }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <!-- Results count -->
      <p class="text-sm text-muted-foreground">
        Showing {{ filteredErrands?.length }} errand<span
          v-if="filteredErrands?.length !== 1"
          >s</span
        >
      </p>

      <!-- Errands grid -->
      <div v-if="filteredErrands && filteredErrands.length > 0">
        <!-- Use virtual scrolling for large lists -->
        <VirtualScrollList
          v-if="filteredErrands.length > 20"
          :items="filteredErrands"
          :item-height="280"
          :container-height="600"
          class="rounded-lg border"
        >
          <template #default="{ item: errand }">
            <div class="p-3">
              <ErrandsErrandCard :errand="errand" />
            </div>
          </template>
          <template #empty>
            <div class="text-center py-8">
              <Icon
                name="mdi:briefcase-search-outline"
                class="h-16 w-16 mx-auto mb-4 text-muted-foreground"
              />
              <h3 class="text-lg font-semibold mb-2">No errands found</h3>
              <p class="text-muted-foreground mb-4">
                Try adjusting your filters or search terms
              </p>
              <Button @click="resetFilters">Clear filters</Button>
            </div>
          </template>
        </VirtualScrollList>

        <!-- Regular grid for smaller lists -->
        <div
          v-else
          class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          <ErrandsErrandCard
            v-for="errand in filteredErrands"
            :key="errand.id"
            :errand="errand"
          />
        </div>
      </div>
      <div v-else class="py-8 text-center">
        <p class="text-muted-foreground">
          No errands found matching your criteria.
        </p>
        <Button class="btn-link" @click="resetFilters">Reset filters</Button>
      </div>
    </div>
  </div>
</template>
