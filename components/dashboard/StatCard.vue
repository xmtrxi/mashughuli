<script setup lang="ts">
const props = defineProps<{
  title: string;
  value: string | number;
  description: string;
  icon: string;
  trend?: {
    direction: "up" | "down" | "neutal";
    value: string;
  };
}>();
</script>
<template>
  <Card>
    <CardHeader
      class="flex flex-row items-center justify-between space-y-0 pb-2"
    >
      <div>
        <CardTitle class="text-base font-medium">{{ title }}</CardTitle>
        <CardDescription>{{ description }}</CardDescription>
      </div>
      <div
        class="h-8 w-8 rounded-full bg-muted flex items-center justify-center"
      >
        <Icon :name="icon" class="h-4 w-4" />
      </div>
    </CardHeader>
    <CardContent>
      <div class="text-2xl font-bold">{{ value }}</div>
    </CardContent>
  </Card>
</template>
