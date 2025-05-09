<script lang="ts" setup>
const categories = [
  {
    name: "Shopping",
    icon: "🛒",
    description: "Grocery shopping, retail pickups and more",
  },
  {
    name: "Delivery",
    icon: "📦",
    description: "Package pickup and delivery services",
  },
  {
    name: "Home Services",
    icon: "🏠",
    description: "Home cleaning, maintenance and assistance",
  },
  {
    name: "Administrative",
    icon: "📝",
    description: "Office errands, document services and more",
  },
  {
    name: "Pet Care",
    icon: "🐶",
    description: "Pet sitting, walking and related services",
  },
  {
    name: "Other",
    icon: "✨",
    description: "Miscellaneous tasks and special requests",
  },
];
</script>
<template>
  <section class="py-16 md:py-24 bg-white">
    <div class="container mx-auto">
      <div class="text-center mb-16">
        <h2 class="text-3xl md:text-4xl font-bold mb-4 text-dark">
          Errand Categories
        </h2>
        <p class="text-gray-dark max-w-3xl mx-auto">
          Explore the different types of errands available on our platform
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <Card v-for="category in categories" :key="category.name" class="">
          <CardContent>
            <div class="text-3xl mb-3">{{ category.icon }}</div>
            <h3 class="text-xl font-semibold mb-2">{{ category.name }}</h3>
            <p class="text-muted-foreground">{{ category.description }}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  </section>
</template>
