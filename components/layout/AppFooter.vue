<!-- components/AppFooter.vue -->

<template>
  <footer class="bg-primary text-white py-12 mt-auto">
    <div class="container mx-auto px-4">
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
          <p class="text-gray-300 text-sm">
            Connecting people and building communities for a better future.
          </p>
          <div class="flex space-x-4">
            <a
              href="#"
              class="text-gray-300 hover:text-white transition-colors"
            >
              <TwitterIcon class="h-5 w-5" />
            </a>
            <a
              href="#"
              class="text-gray-300 hover:text-white transition-colors"
            >
              <LinkedinIcon class="h-5 w-5" />
            </a>
            <a
              href="#"
              class="text-gray-300 hover:text-white transition-colors"
            >
              <GithubIcon class="h-5 w-5" />
            </a>
          </div>
        </div>

        <!-- Quick Links -->
        <div>
          <h3 class="text-lg font-semibold mb-4">Quick Links</h3>
          <ul class="space-y-2">
            <li>
              <a
                href="#"
                class="text-gray-300 hover:text-white transition-colors"
                >Home</a
              >
            </li>
            <li>
              <a
                href="#"
                class="text-gray-300 hover:text-white transition-colors"
                >About Us</a
              >
            </li>
            <li>
              <a
                href="#"
                class="text-gray-300 hover:text-white transition-colors"
                >Services</a
              >
            </li>
            <li>
              <a
                href="#"
                class="text-gray-300 hover:text-white transition-colors"
                >Events</a
              >
            </li>
            <li>
              <a
                href="#"
                class="text-gray-300 hover:text-white transition-colors"
                >Blog</a
              >
            </li>
          </ul>
        </div>

        <!-- Resources -->
        <div>
          <h3 class="text-lg font-semibold mb-4">Resources</h3>
          <ul class="space-y-2">
            <li>
              <a
                href="#"
                class="text-gray-300 hover:text-white transition-colors"
                >Help Center</a
              >
            </li>
            <li>
              <a
                href="#"
                class="text-gray-300 hover:text-white transition-colors"
                >Community Guidelines</a
              >
            </li>
            <li>
              <a
                href="#"
                class="text-gray-300 hover:text-white transition-colors"
                >Privacy Policy</a
              >
            </li>
            <li>
              <a
                href="#"
                class="text-gray-300 hover:text-white transition-colors"
                >Terms of Service</a
              >
            </li>
            <li>
              <a
                href="#"
                class="text-gray-300 hover:text-white transition-colors"
                >FAQs</a
              >
            </li>
          </ul>
        </div>

        <!-- Newsletter -->
        <div>
          <h3 class="text-lg font-semibold mb-4">Subscribe</h3>
          <p class="text-gray-300 text-sm mb-4">
            Join our newsletter to stay up to date on features and releases.
          </p>
          <form class="space-y-2" @submit.prevent="subscribeToNewsletter">
            <input
              v-model="email"
              class="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white/50"
              type="email"
              placeholder="Enter your email"
              required
            />
            <button
              type="submit"
              class="w-full bg-white text-primary py-2 px-4 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      <div
        class="border-t border-white/20 mt-8 pt-8 text-center text-gray-300 text-sm"
      >
        <p>
          &copy; {{ new Date().getFullYear() }} Haraka Hub. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { ref } from "vue";
import {
  Twitter as TwitterIcon,
  Linkedin as LinkedinIcon,
  Github as GithubIcon,
} from "lucide-vue-next";

const email = ref("");

const subscribeToNewsletter = () => {
  // Here you would implement the newsletter subscription logic
  alert(`Thank you for subscribing with: ${email.value}`);
  email.value = "";
};
</script>
