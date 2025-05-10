<script lang="ts" setup>
const works = [
  {
    title: 'Post Your Errand',
    decription: 'Describe your task, set a budget and choose a deadline.',
  },
  {
    title: 'Receive Bids',
    decription: 'Review offers from qualified runners in your area.',
  },
  {
    title: 'Get It Done',
    decription: 'Choose a runner and get your errand completed efficiently.',
  },
]
</script>

<template>
  <section class="py-16 md:py-24 bg-white">
    <div class="container mx-auto">
      <div class="text-center mb-16">
        <h2 class="text-3xl md:text-4xl font-bold mb-4 text-dark">
          How Mashughuli Hub Works?
        </h2>
        <p class="text-gray-dark max-w-3xl mx-auto">
          Get your errands done in three steps.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <Card
          v-for="(work, index) in works"
          :key="work.title"
          class="shadow-2xl"
        >
          <CardContent>
            <div class="flex flex-col items-center text-center rounded-lg">
              <div
                class="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4"
              >
                <span class="text-2xl">{{ index + 1 }}</span>
              </div>
              <h3 class="text-xl font-semibold">
                {{ work.title }}
              </h3>
              <p class="text-muted-foreground mt-2">
                {{ work.decription }}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </section>
</template>
