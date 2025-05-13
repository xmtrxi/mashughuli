<!-- components/HeroSection.vue -->
<template>
  <section
    class="relative bg-gradient-to-br from-primary-200 to-primary-50 text-black py-16 md:py-24"
  >
    <!-- Background pattern -->
    <div class="">
      <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
        <defs>
          <pattern
            id="dotPattern"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="3" cy="3" r="1.5" fill="white" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dotPattern)" />
      </svg>
    </div>

    <div class="container mx-auto relative">
      <div class="flex flex-col md:flex-row items-center">
        <!-- Text content -->
        <div class="w-full md:w-1/2 text-center md:text-left px-4 md:pr-12">
          <h1
            class="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
          >
            Your Errand Marketplace Platform
          </h1>
          <p class="text-lg md:text-xl mb-8 max-w-lg mx-auto md:mx-0">
            Connect with reliable runners to get your errands done, or earn by
            helping others with their tasks.
          </p>
          <div
            class="flex flex-col sm:flex-row gap-4 justify-center md:justify-start"
          >
            <Button> Post Errand </Button>
            <Button class="bg-secondary hover:bg-secondary-foreground">
              <Icon
                name="arcticons:runnerup"
                color="black"
                class="h-5 w-5 mr-2"
              />
              Become A Runner
            </Button>
          </div>
        </div>

        <!-- Image or illustration -->
        <div class="w-full md:w-1/2 mt-12 md:mt-0">
          <div class="relative">
            <!-- Image placeholder with gradient background -->
            <div
              class="bg-gradient-to-br from-white/20 to-white/5 rounded-lg p-4 shadow-xl"
            >
              <div class="bg-white/10 rounded-lg overflow-hidden aspect-video">
                <div
                  class="flex items-center justify-center h-full text-center p-8"
                >
                  <div>
                    <Icon
                      name="mdi:users"
                      height="48"
                      width="48"
                      class="h-12 w-12 mx-auto mb-4 text-white/80"
                    />

                    <p class="font-medium">
                      Connect with thousands of runners worldwide
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Floating elements -->
            <div
              class="absolute -top-6 -right-6 bg-secondary/90 rounded-full w-12 h-12 flex items-center justify-center shadow-lg"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>

            <div
              class="absolute -bottom-4 -left-4 rounded-lg p-3 shadow-lg bg-white"
            >
              <div class="flex items-center space-x-2">
                <div
                  class="bg-white rounded-full w-8 h-8 flex items-center justify-center text-black font-bold"
                >
                  50k+
                </div>
                <span class="text-black font-medium text-sm"
                  >Active Members</span
                >
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Trusted by logos -->
      <div class="mt-16">
        <p class="text-center text-gray-200 text-sm font-medium mb-6">
          TRUSTED BY LEADING ORGANIZATIONS
        </p>
        <div class="flex flex-wrap justify-center gap-8 opacity-75">
          <div
            class="h-8 w-24 bg-white/30 rounded flex items-center justify-center"
          >
            <span class="font-bold text-white">Company 1</span>
          </div>
          <div
            class="h-8 w-24 bg-white/30 rounded flex items-center justify-center"
          >
            <span class="font-bold text-white">Company 2</span>
          </div>
          <div
            class="h-8 w-24 bg-white/30 rounded flex items-center justify-center"
          >
            <span class="font-bold text-white">Company 3</span>
          </div>
          <div
            class="h-8 w-24 bg-white/30 rounded flex items-center justify-center"
          >
            <span class="font-bold text-white">Company 4</span>
          </div>
          <div
            class="h-8 w-24 bg-white/30 rounded flex items-center justify-center"
          >
            <span class="font-bold text-white">Company 5</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
// No additional setup needed for this component
</script>
