<script setup lang="ts">
const features = [
  {
    title: 'Verified Runners',
    icon: 'mdi:check-circle',
    description:
      'All our runners go through a thorough verification process to ensure reliability and quality.',
  },
  {
    title: 'Time-Saving',
    icon: 'mdi:clock-outline',
    description:
      'Delegate your errands and focus on what matters most to you, saving valuable time.',
  },
  {
    title: 'Competitive Pricing',
    icon: 'mdi:currency-usd',
    description:
      'Set your own budget and choose from competitive bids that match your requirements.',
  },
  {
    title: 'Secure Platform',
    icon: 'mdi:shield-check',
    description:
      'Our platform provides secure payment processing and protection for all users.',
  },
  {
    title: '24/7 Support',
    icon: 'mdi:headphones',
    description:
      'Our customer support team is available around the clock to assist with any issues.',
  },
  {
    title: 'Rating System',
    icon: 'mdi:star',
    description:
      'Our comprehensive review and rating system helps you find the most reliable runners.',
  },
]
</script>

<template>
  <section class="py-16 md:py-24 bg-white">
    <div class="container mx-auto">
      <div class="text-center mb-16">
        <h2 class="text-3xl md:text-4xl font-bold mb-4 text-dark">
          Why Choose Mashughuli Hub
        </h2>
        <p class="text-gray-800 max-w-3xl mx-auto">
          Discover the benefits of using our errand marketplace platform
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <Card
          v-for="feature in features"
          :key="feature.title"
        >
          <CardContent>
            <div class="flex flex-col items-center text-center p-6">
              <div
                class="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4"
              >
                <Icon
                  :name="feature.icon"
                  size="24"
                  class="text-primary"
                />
              </div>
              <h3 class="text-xl font-semibold">
                {{ feature.title }}
              </h3>
              <p class="text-muted-foreground">
                {{ feature.description }}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </section>
</template>
