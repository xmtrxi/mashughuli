<script setup lang="ts">
import { buttonVariants } from "~/components/ui/button";

const authStore = useAuthStore();
const user = computed(() => authStore.user);
</script>

<template>
  <div class="max-w-3xl mx-auto py-10 px-6">
    <div v-if="user" class="bg-white shadow-xl rounded-2xl p-6">
      <h2 class="text-2xl font-semibold text-gray-800 mb-4">My Profile</h2>

      <div class="flex items-center space-x-6">
        <Avatar class="w-24 h-24 text-4xl">
          <AvatarImage
            v-if="user.avatarUrl"
            :src="user.avatarUrl"
            :alt="user.fullName"
          />
          <AvatarFallback>{{ user.fullName.charAt(0) }}</AvatarFallback>
        </Avatar>

        <div class="flex-col space-y-2">
          <h3 class="text-xl font-bold text-gray-900">
            {{ user.fullName }}
          </h3>
          <p class="text-gray-600 text-lg">Email: {{ user.email }}</p>
          <p class="text-gray-600 text-lg">Phone: {{ user.phoneNumber }}</p>
          <p class="text-gray-500 text-sm">
            Member since
            {{ new Date(user.createdAt).toLocaleDateString() }}
          </p>
          <p class="text-gray-500 text-sm capitalize">
            Role: {{ user.primaryRole }}
          </p>
        </div>
      </div>
      <div class="mt-4 border-t pt-4">
        <h4 class="font-semibold text-gray-700">Bio</h4>
        <p class="text-gray-600 italic mt-1">
          {{ user.bio || "No bio provided." }}
        </p>
      </div>

      <div class="mt-6 flex space-x-4">
        <NuxtLink
          to="/dashboard/profile/edit"
          :class="buttonVariants({ variant: 'default' })"
        >
          <Icon name="mdi:edit" class="mr-2" />
          Edit Profile
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
