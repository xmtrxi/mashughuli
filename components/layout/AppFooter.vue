<!-- components/AppFooter.vue -->
<template>
  <footer class="bg-primary text-white py-12">
    <div class="container mx-auto">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <!-- Logo and About -->
        <div class="space-y-4">
          <div class="flex items-center space-x-2">
            <div
              class="h-8 w-8 rounded-full bg-white flex items-center justify-center"
            >
              <span class="text-primary font-bold">M</span>
            </div>
            <span class="text-white font-bold text-xl">Mashughuli Hub</span>
          </div>
          <p class="text-gray-medium text-sm">
            Connecting people and building communities for a better future.
          </p>
          <div class="flex space-x-4">
            <a
              href="#"
              class="text-gray-medium hover:text-white"
            >
              <Icon
                name="mdi:twitter"
                class="h-5 w-5"
              />
            </a>
            <a
              href="#"
              class="text-gray-medium hover:text-white"
            >
              <Icon
                name="mdi:linkedin"
                class="h-5 w-5"
              />
            </a>
            <a
              href="#"
              class="text-gray-medium hover:text-white"
            >
              <Icon
                name="mdi:github"
                class="h-5 w-5"
              />
            </a>
          </div>
        </div>

        <!-- Quick Links -->
        <div>
          <h3 class="text-lg font-semibold mb-4">
            Quick Links
          </h3>
          <ul class="space-y-2">
            <li>
              <a
                href="#"
                class="text-gray-medium hover:text-white"
              >Home</a>
            </li>
            <li>
              <a
                href="#"
                class="text-gray-medium hover:text-white"
              >About Us</a>
            </li>
            <li>
              <a
                href="#"
                class="text-gray-medium hover:text-white"
              >Services</a>
            </li>
            <li>
              <a
                href="#"
                class="text-gray-medium hover:text-white"
              >Events</a>
            </li>
            <li>
              <a
                href="#"
                class="text-gray-medium hover:text-white"
              >Blog</a>
            </li>
          </ul>
        </div>

        <!-- Resources -->
        <div>
          <h3 class="text-lg font-semibold mb-4">
            Resources
          </h3>
          <ul class="space-y-2">
            <li>
              <a
                href="#"
                class="text-gray-medium hover:text-white"
              >Help Center</a>
            </li>
            <li>
              <a
                href="#"
                class="text-gray-medium hover:text-white"
              >Community Guidelines</a>
            </li>
            <li>
              <a
                href="#"
                class="text-gray-medium hover:text-white"
              >Privacy Policy</a>
            </li>
            <li>
              <a
                href="#"
                class="text-gray-medium hover:text-white"
              >Terms of Service</a>
            </li>
            <li>
              <a
                href="#"
                class="text-gray-medium hover:text-white"
              >FAQs</a>
            </li>
          </ul>
        </div>

        <!-- Newsletter -->
        <div>
          <h3 class="text-lg font-semibold mb-4">
            Subscribe
          </h3>
          <p class="text-gray-medium text-sm mb-4">
            Join our newsletter to stay up to date on features and releases.
          </p>
          <form
            class="space-y-2"
            @submit.prevent="subscribeToNewsletter"
          >
            <Input
              v-model="email"
              class="bg-secondary"
              type="email"
              placeholder="Enter your email"
              required
            />
            <Button
              type="submit"
              class="w-full bg-secondary hover:bg-primary-dark text-primary py-2 px-4 rounded-lg transition"
            >
              Subscribe
            </Button>
          </form>
        </div>
      </div>

      <div
        class="border-t border-gray-800 mt-8 pt-8 text-center text-gray-medium text-sm"
      >
        <p>
          &copy; {{ new Date().getFullYear() }} Haraka Hub. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { ref } from 'vue'

const email = ref('')

const subscribeToNewsletter = () => {
  // Here you would implement the newsletter subscription logic
  alert(`Thank you for subscribing with: ${email.value}`)
  email.value = ''
}
</script>
