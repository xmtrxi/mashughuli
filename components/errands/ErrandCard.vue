<script lang="ts" setup>
import { buttonVariants } from "../ui/button";
import type { ErrandWithRelationships } from "~/types";

const props = defineProps<{ errand: ErrandWithRelationships }>();

const formatCurrency = (amount: number, currency: string): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount);
};

const formattedBudget = `${formatCurrency(parseFloat((props.errand.budgetMin ?? 0).toString()), "Kes")} - ${formatCurrency(
  parseFloat((props.errand.budgetMax ?? 0).toString()),
  "Kes",
)}`;

const priorityColors: Record<ErrandWithRelationships["priority"], string> = {
  low: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-red-100 text-red-800",
};

const statusColors: Record<ErrandWithRelationships["status"], string> = {
  open: "bg-blue-100 text-blue-800",
  "in-progress": "bg-purple-100 text-purple-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-gray-100 text-gray-800",
};

const priorityClass = priorityColors[props.errand.priority];
const statusClass = statusColors[props.errand.status];

const capitalize = (val: string) => val.charAt(0).toUpperCase() + val.slice(1);
</script>
<template>
  <Card class="card-hover overflow-hidden">
    <CardHeader class="pb-3">
      <div class="flex justify-between items-start">
        <CardTitle class="text-xl line-clamp-1">{{ errand.title }}</CardTitle>
        <Badge :class="statusClass">
          {{ capitalize(errand.status) }}
        </Badge>
      </div>
    </CardHeader>

    <CardContent class="pb-4">
      <div class="space-y-3">
        <p class="text-sm text-muted-foreground line-clamp-2">
          {{ errand.description }}
        </p>

        <div class="flex items-center gap-2 text-sm">
          <Icon name="mdi:map-marker" class="h-4 w-4 text-muted-foreground" />
          <span class="text-muted-foreground">{{ errand.customLocation }}</span>
        </div>

        <div class="flex items-center gap-2 text-sm">
          <Icon name="mdi:clock" class="h-4 w-4 text-muted-foreground" />
          <span class="text-muted-foreground">
            Due {{ new Date(errand.deadline ?? "").toLocaleDateString() }}
          </span>
        </div>

        <div class="flex items-center gap-2 text-sm">
          <Icon name="mdi:dollar" class="h-4 w-4 text-muted-foreground" />
          <span class="font-medium">{{ formattedBudget }}</span>
        </div>

        <div class="flex flex-wrap gap-2">
          <Badge variant="outline">{{ errand.category.name }}</Badge>
          <Badge :class="priorityClass">
            {{ capitalize(errand.priority) }} Priority
          </Badge>
        </div>
      </div>
    </CardContent>

    <CardFooter class="flex justify-between pt-3 border-t">
      <div class="flex items-center gap-2 text-sm">
        <span class="text-muted-foreground">{{ errand.bids }} bids</span>
      </div>
      <NuxtLink
        :class="buttonVariants({ variant: 'default' })"
        :to="`/errands/${errand.id}`"
        >View Details</NuxtLink
      >
    </CardFooter>
  </Card>
</template>
<style scoped></style>
