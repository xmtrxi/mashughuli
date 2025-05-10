<script setup lang="ts">
import { buttonVariants } from "~/components/ui/button";

const errandsData = [
  {
    id: "1",
    title: "Grocery Shopping & Delivery",
    description:
      "Need someone to pick up groceries from Whole Foods and deliver...",
    location: "Downtown, Main Street",
    budget: { min: 15, max: 25, currency: "USD" },
    dueDate: "2025-05-05",
    category: "Shopping",
    priority: "medium",
    status: "open",
    bids: 3,
  },
  {
    id: "2",
    title: "Collect Package from Post Office",
    description:
      "Need someone to pick up a package from the local post office...",
    location: "Westside, Oak Avenue",
    budget: { min: 10, max: 20, currency: "USD" },
    dueDate: "2025-05-03",
    category: "Delivery",
    priority: "high",
    status: "open",
    bids: 5,
  },
  {
    id: "2",
    title: "Collect Package from Post Office",
    description:
      "Need someone to pick up a package from the local post office...",
    location: "Westside, Oak Avenue",
    budget: { min: 10, max: 20, currency: "USD" },
    dueDate: "2025-05-03",
    category: "Delivery",
    priority: "high",
    status: "open",
    bids: 5,
  },
  {
    id: "2",
    title: "Collect Package from Post Office",
    description:
      "Need someone to pick up a package from the local post office...",
    location: "Westside, Oak Avenue",
    budget: { min: 10, max: 20, currency: "USD" },
    dueDate: "2025-05-03",
    category: "Delivery",
    priority: "high",
    status: "open",
    bids: 5,
  },
  {
    id: "2",
    title: "Collect Package from Post Office",
    description:
      "Need someone to pick up a package from the local post office...",
    location: "Westside, Oak Avenue",
    budget: { min: 10, max: 20, currency: "USD" },
    dueDate: "2025-05-03",
    category: "Delivery",
    priority: "high",
    status: "open",
    bids: 5,
  },
  {
    id: "2",
    title: "Collect Package from Post Office",
    description:
      "Need someone to pick up a package from the local post office...",
    location: "Westside, Oak Avenue",
    budget: { min: 10, max: 20, currency: "USD" },
    dueDate: "2025-05-03",
    category: "Delivery",
    priority: "high",
    status: "open",
    bids: 5,
  },
  // ... (rest of your errands)
];

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

const filteredErrands = computed(() => {
  return errandsData
    .filter((errand) => {
      const search = searchQuery.value.toLowerCase();
      const matchesSearch =
        errand.title.toLowerCase().includes(search) ||
        errand.description.toLowerCase().includes(search);

      const matchesCategory =
        categoryFilter.value === "all" ||
        errand.category.toLowerCase() === categoryFilter.value.toLowerCase();

      const matchesPriority =
        priorityFilter.value === "all" ||
        errand.priority === priorityFilter.value;

      return matchesSearch && matchesCategory && matchesPriority;
    })
    .sort((a, b) => {
      switch (sortBy.value) {
        case "newest":
          return new Date(b.dueDate) - new Date(a.dueDate);
        case "oldest":
          return new Date(a.dueDate) - new Date(b.dueDate);
        case "budget-high":
          return b.budget.max - a.budget.max;
        case "budget-low":
          return a.budget.min - b.budget.min;
        case "most-bids":
          return b.bids - a.bids;
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
            type="text"
            placeholder="Search errands..."
            class="pl-10 input"
            v-model="searchQuery"
          />
        </div>

        <div class="flex flex-col sm:flex-row gap-3">
          <Select v-model="categoryFilter">
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
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
              <SelectItem value="all">All Priorities</SelectItem>
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
        Showing {{ filteredErrands.length }} errand<span
          v-if="filteredErrands.length !== 1"
          >s</span
        >
      </p>

      <!-- Errands grid -->
      <div
        v-if="filteredErrands.length > 0"
        class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
      >
        <ErrandsErrandCard
          v-for="errand in filteredErrands"
          :key="errand.id"
          :errand="errand"
        />
      </div>
      <div v-else class="py-8 text-center">
        <p class="text-muted-foreground">
          No errands found matching your criteria.
        </p>
        <button class="btn-link" @click="resetFilters">Reset filters</button>
      </div>
    </div>
  </div>
</template>
