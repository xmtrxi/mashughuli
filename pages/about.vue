<script setup lang="ts">
import { buttonVariants } from "~/components/ui/button";
</script>
<template>
  <div class="">
    <section
      class="bg-gradient-to-b from-primary-200 to-background py-16 md:py-24"
    >
      <div class="container mx-auto px-4 text-center">
        <h1 class="text-4xl md:text-5xl font-bold mb-6">About Mashughuli</h1>
        <p class="text-xl text-muted-foreground max-w-3xl mx-auto">
          We're on a mission to transform how everyday tasks get done, making
          life easier for busy people and creating flexible earning
          opportunities.
        </p>
      </div>
    </section>
    <section class="py-16 bg-background">
      <div class="container mx-auto px-4">
        <div class="flex flex-col md:flex-row gap-12 items-center">
          <div class="md:w-1/2">
            <h2 class="text-3xl font-bold mb-6">Our Story</h2>
            <div class="space-y-4 text-muted-foreground">
              <p>
                Mashughuli was founded in 2023 with a simple idea: to create a
                platform that connects people who need errands done with those
                who have the time and skills to help.
              </p>
              <p>
                Our founder, Sarah Johnson, experienced firsthand the challenges
                of balancing a demanding career with personal responsibilities.
                After struggling to find reliable help for simple tasks, she
                envisioned a community-based solution.
              </p>
              <p>
                What started as a small local network has grown into a thriving
                marketplace serving communities across East Africa, helping
                thousands of people save time and earn income on their own
                terms.
              </p>
              <p>
                Today, Mashughuli continues to innovate and expand, guided by
                our core values of trust, accessibility, and community
                empowerment.
              </p>
            </div>
          </div>
          <div class="md:w-1/2">
            <div class="relative">
              <div
                class="absolute -top-6 -left-6 w-32 h-32 bg-primary-100 rounded-full -z-10"
              ></div>
              <img
                src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=600&h=400"
                alt="Team meeting"
                class="rounded-lg shadow-lg"
              />
              <div
                class="absolute -bottom-6 -right-6 w-24 h-24 bg-primary-200 rounded-full -z-10"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section class="py-16 bg-purple-50">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold mb-12 text-center">
          Our Mission & Values
        </h2>

        <div class="flex flex-col md:flex-row gap-8">
          <div class="flex-1 bg-background p-8 rounded-lg shadow-sm border">
            <h3 class="text-2xl font-semibold mb-4">Our Mission</h3>
            <p class="text-muted-foreground mb-6">
              To create a trusted community marketplace that connects people in
              need of assistance with skilled individuals ready to help,
              fostering economic opportunities and saving valuable time.
            </p>
            <div class="h-1 w-20 bg-primary"></div>
          </div>

          <div class="flex-1 bg-background p-8 rounded-lg shadow-sm border">
            <h3 class="text-2xl font-semibold mb-4">Our Vision</h3>
            <p class="text-muted-foreground mb-6">
              To be the most trusted platform for everyday task assistance in
              Africa, known for reliability, accessibility, and positive
              community impact.
            </p>
            <div class="h-1 w-20 bg-primary"></div>
          </div>
        </div>

        <div class="mt-12 grid grid-cols-3 md:grid-cols-3 gap-6">
          <div class="bg-background p-6 rounded-lg shadow-sm border">
            <h3 class="text-xl font-semibold mb-3">Trust & Safety</h3>
            <p class="text-muted-foreground">
              We prioritize creating a secure environment through thorough
              verification, transparent reviews, and secure transactions.
            </p>
          </div>

          <div class="bg-background p-6 rounded-lg shadow-sm border">
            <h3 class="text-xl font-semibold mb-3">Community Focus</h3>
            <p class="text-muted-foreground">
              We believe in strengthening local communities by facilitating
              connections and creating economic opportunities.
            </p>
          </div>

          <div class="bg-background p-6 rounded-lg shadow-sm border">
            <h3 class="text-xl font-semibold mb-3">Accessibility</h3>
            <p class="text-muted-foreground">
              We're committed to making our platform inclusive and available to
              people from all walks of life.
            </p>
          </div>
        </div>
      </div>
    </section>
    <section class="py-16 bg-primary-50">
      <div class="container mx-auto px-4 text-center">
        <h2 class="text-3xl font-bold mb-6">Our Impact</h2>
        <p class="text-xl text-muted-foreground max-w-3xl mx-auto mb-12">
          Since our launch, we've made a meaningful difference in communities
          across East Africa.
        </p>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <p class="text-4xl font-bold text-primary-600 mb-2">10k+</p>
            <p class="text-muted-foreground">Registered Users</p>
          </div>
          <div>
            <p class="text-4xl font-bold text-primary-600 mb-2">25k+</p>
            <p class="text-muted-foreground">Errands Completed</p>
          </div>
          <div>
            <p class="text-4xl font-bold text-primary-600 mb-2">5</p>
            <p class="text-muted-foreground">Cities Served</p>
          </div>
          <div>
            <p class="text-4xl font-bold text-primary-600 mb-2">$500k+</p>
            <p class="text-muted-foreground">Income Generated</p>
          </div>
        </div>
      </div>
    </section>
    <section class="py-16">
      <div class="container mx-auto px-4 text-center">
        <h2 class="text-3xl font-bold mb-6">Join Our Growing Community</h2>
        <p class="text-xl mb-8 max-w-2xl mx-auto">
          Whether you need help with errands or want to earn by helping others,
          Mashughuli is here for you.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <NuxtLink
            :to="`/auth/register`"
            :class="buttonVariants({ variant: 'default' })"
          >
            Sign Up Now
          </NuxtLink>
          <NuxtLink
            to="/contact"
            :class="buttonVariants({ variant: 'secondary' })"
          >
            Contact Us
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>
