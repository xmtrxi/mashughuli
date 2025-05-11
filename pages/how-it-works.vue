<script setup lang="ts">
import { buttonVariants } from "~/components/ui/button";

const steps = [
  {
    icon: "mdi:clipboard-check-outline",
    title: "Post your errand",
    description:
      "Describe what you need done, set your budget, and choose a deadline that works for you.",
  },
  {
    icon: "mdi:account-check-outline",
    title: "Choose a runner",
    description:
      "Review profiles, ratings, and bids from qualified runners who can help get your errand done.",
  },
  {
    icon: "mdi:clock-outline",
    title: "Track progress",
    description:
      "Stay updated with real-time notifications and communicate directly with your runner.",
  },
  {
    icon: "mdi:check-circle-outline",
    title: "Approve completion",
    description:
      "Verify the task is completed to your satisfaction before releasing payment.",
  },
  {
    icon: "mdi:credit-card-outline",
    title: "Secure payment",
    description:
      "Only pay when you're completely satisfied with the completed errand.",
  },
  {
    icon: "mdi:star-outline",
    title: "Leave feedback",
    description:
      "Rate your experience and help maintain our community's high standards.",
  },
];
const requesterItems = [
  {
    title: "Post with confidence",
    description:
      "Create detailed errand requests with secure payment protection. Only pay when the job is done right.",
  },
  {
    title: "Vetted runners",
    description:
      "All our runners are background-checked and rated by other users to ensure quality and reliability.",
  },
  {
    title: "Real-time updates",
    description:
      "Stay informed with notifications and tracking as your errand progresses to completion.",
  },
  {
    title: "Flexible options",
    description:
      "Set your budget, timeline, and specific requirements to get exactly what you need.",
  },
];
const runnerItems = [
  {
    title: "Flexible schedule",
    description:
      "Pick up errands that fit your availability and location. Work as much or as little as you want.",
  },
  {
    title: "Secure earnings",
    description:
      "Get paid promptly through our secure payment system once jobs are completed and approved.",
  },
  {
    title: "Build your reputation",
    description:
      "Earn positive reviews and increase your visibility to get more errand opportunities.",
  },
  {
    title: "Support when you need it",
    description:
      "Access our helpdesk and community resources to succeed as a runner on our platform.",
  },
];
const faqs = [
  {
    question: "How much does it cost to use Mashughuli?",
    answer:
      "Posting errands is free. When your errand is completed, a small service fee is added to the total cost to maintain the platform's quality and security features.",
  },
  {
    question: "How are runners vetted?",
    answer:
      "Runners undergo identity verification, background checks, and must maintain a positive rating to continue using the platform.",
  },
  {
    question: "What if my errand isn't completed properly?",
    answer:
      "Our satisfaction guarantee ensures you only pay when you're happy with the results. If there's an issue, our support team will help resolve it.",
  },
  {
    question: "How quickly will I find someone to help with my errand?",
    answer:
      "Most errands receive responses within hours, depending on the complexity, location, and budget. Urgent errands can be marked as priority.",
  },
  {
    question: "How do I become a runner?",
    answer:
      "Sign up, complete your profile, pass the verification process, and you can start bidding on errands that match your skills and availability.",
  },
];
</script>
<template>
  <div>
    <section
      class="bg-gradient-to-b from-mashughuli-50 to-background py-16 md:py-24"
    >
      <div class="container mx-auto px-4 text-center">
        <h1 class="text-4xl md:text-5xl font-bold mb-6">
          How Mashughuli Works
        </h1>
        <p class="text-xl text-muted-foreground max-w-3xl mx-auto">
          Our platform connects people who need errands done with reliable
          runners who can help. Here's how to get started.
        </p>
      </div>
    </section>

    <!-- Steps Section -->
    <section class="py-16 bg-background">
      <div class="container mx-auto px-4">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div
            v-for="(step, index) in steps"
            :key="index"
            class="bg-card border rounded-lg p-6 flex flex-col items-center text-center hover:shadow-md transition-shadow"
          >
            <div class="mb-4">
              <Icon :name="step.icon" class="h-12 w-12 text-mashughuli-400" />
            </div>
            <h3 class="text-xl font-semibold mb-2">{{ step.title }}</h3>
            <p class="text-muted-foreground">{{ step.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- For Requesters Section -->

    <section class="py-24 mt-16 bg-muted">
      <div class="container mx-auto px-4">
        <div class="max-w-3xl mx-auto text-center mb-12">
          <h2 class="text-4xl font-bold mb-6 text-foreground pt-10">
            For Errand Requesters
          </h2>
          <p class="text-xl text-muted-foreground">
            Need something done but don't have the time? Our platform makes it
            easy to find reliable help.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto">
          <div
            v-for="(item, index) in requesterItems"
            :key="index"
            class="flex gap-5 p-6 rounded-lg bg-card hover:shadow-md transition-all duration-300 card-hover"
          >
            <div class="flex-shrink-0">
              <div
                class="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center"
              >
                <Icon
                  :name="'mdi:check-circle-outline'"
                  class="h-6 w-6 text-primary"
                />
              </div>
            </div>
            <div>
              <h3 class="text-2xl font-medium mb-3 text-primary">
                {{ item.title }}
              </h3>
              <p class="text-muted-foreground text-lg">
                {{ item.description }}
              </p>
            </div>
          </div>
        </div>

        <div class="mt-16 text-center">
          <Button> Post Your First Errand </Button>
        </div>
      </div>
    </section>

    <!-- For Runners Section -->
    <section class="py-24 mt-16 bg-background">
      <div class="container mx-auto px-4">
        <div class="max-w-3xl mx-auto text-center mb-16">
          <h2 class="text-4xl font-bold mb-6 text-foreground">
            For Errand Runners
          </h2>
          <p class="text-xl text-muted-foreground">
            Earn money on your schedule by helping others with their errands and
            tasks.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto">
          <div
            v-for="(item, index) in runnerItems"
            :key="index"
            class="flex gap-5 p-6 bg-card border border-border rounded-lg shadow-sm hover:shadow-md transition-all duration-300 card-hover"
          >
            <div class="flex-shrink-0">
              <div
                class="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center"
              >
                <Icon
                  :name="'mdi:check-circle-outline'"
                  class="h-6 w-6 text-primary"
                />
              </div>
            </div>
            <div>
              <h3 class="text-2xl font-medium mb-3 text-primary">
                {{ item.title }}
              </h3>
              <p class="text-muted-foreground text-lg">
                {{ item.description }}
              </p>
            </div>
          </div>
        </div>

        <div class="mt-16 text-center">
          <Button> Become a Runner </Button>
        </div>
      </div>
    </section>

    <!-- FAQ Section -->
    <section class="py-16 bg-mashughuli-50">
      <div class="container mx-auto px-4">
        <div class="max-w-3xl mx-auto">
          <h2 class="text-3xl font-bold mb-8 text-center">
            Frequently Asked Questions
          </h2>

          <div class="space-y-6">
            <div
              v-for="(faq, index) in faqs"
              :key="index"
              class="border-b pb-6"
            >
              <h3 class="text-xl font-medium mb-2">{{ faq.question }}</h3>
              <p class="text-muted-foreground">{{ faq.answer }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-16">
      <div class="container mx-auto px-4 text-center">
        <h2 class="text-3xl font-bold mb-6">Ready to Get Started?</h2>
        <p class="text-xl mb-8 max-w-2xl mx-auto">
          Join our community today and experience the convenience of getting
          your errands done or earning by helping others.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <NuxtLink
            to="/register"
            :class="buttonVariants({ variant: 'default' })"
          >
            Sign Up Now
          </NuxtLink>
          <NuxtLink
            to="/errands"
            :class="buttonVariants({ variant: 'secondary' })"
          >
            Browse Errands
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>
<style scoped>
/* Additional custom styles can be added here */
.bg-mashughuli-50 {
  background-color: #f0f7ff;
}

.text-mashughuli-700 {
  color: #1e58b0;
}

.text-mashughuli-800 {
  color: #12468a;
}

.bg-mashughuli-600 {
  background-color: #2563eb;
}

.bg-mashughuli-700 {
  background-color: #1d4ed8;
}

.text-mashughuli-600 {
  color: #2563eb;
}

.border-mashughuli-100 {
  border-color: #e0eaff;
}

.bg-mashughuli-100 {
  background-color: #e0eaff;
}
/* Additional styles to enhance accessibility and dark mode support */
@media (prefers-reduced-motion: reduce) {
  .card-hover {
    @apply hover:transform-none;
  }
}

/* Dark mode specific adjustments */
:deep(.dark) .bg-primary\/10 {
  background-color: rgba(var(--primary), 0.15);
}
</style>
