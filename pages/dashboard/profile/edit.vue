<script setup lang="ts">
import { ref } from 'vue';
import { z } from 'zod';
import type {ApiResponse, Profile} from "~/types";
import { profileSchema } from "~/shared/schemas/profileData.schema";


// Loading state
const isLoading = ref(false);

const profileData = ref({
  fullName: "",
  phoneNumber: "",
  email: "",
  bio: "",
  avatarUrl: ""
});

const fetchProfile = async () => {
  try {
    // Use type assertion for the data property
    const { data } = await useFetch<Profile>('/api/users/profile', {
      method: 'GET',
    });

    if (data.value) {
      profileData.value = {
        fullName: data.value.fullName,
        phoneNumber: data.value.phoneNumber,
        email: data.value.email,
        bio: data.value.bio,
        avatarUrl: data.value.avatarUrl,
      };
    }
  } catch (e: any) {
    console.error('Error loading profile:', e);
  }
};
fetchProfile()

// Handle form submission - sending JSON, not FormData
async function handleSubmit() {
    isLoading.value = true;
  try {
    const { data  } = await useApiRequest('/api/users/update', {
      method: 'PUT',
      body: {
        fullName: profileData.value.fullName,
        phoneNumber: profileData.value.phoneNumber,
        email: profileData.value.email,
        bio: profileData.value.bio,
        avatarUrl: profileData.value.avatarUrl
      }
    });

  } catch (error) {
    console.error('Error updating profile:', error);
  } finally {
    isLoading.value = false;
  }
}

// Reset form to initial state
function resetForm() {
  profileData.value = {
    fullName: "",
    phoneNumber: "",
    email: "",
    bio: "",
    avatarUrl: ""
  };

  errors.value = {
    fullName: "",
    phoneNumber: "",
    email: "",
    bio: "",
    avatarUrl: ""
  };
}
</script>

<template>
  <div class="container mx-auto px-4 py-12">
    <div class="max-w-2xl mx-auto">
      <div class="mb-8">
        <h1 class="text-3xl font-bold">Edit Profile</h1>
        <p class="text-muted-foreground mt-2">
          Update your personal information and preferences.
        </p>
      </div>

      <div class="bg-card rounded-lg border p-6">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Full Name Field -->
          <div class="space-y-2">
            <label for="fullName" class="text-sm font-medium">
              Full Name <span class="text-destructive">*</span>
            </label>
            <Input
                id="fullName"
                v-model="profileData.fullName"
                type="text"
                placeholder="Enter your full name"
                :class="{ 'border-destructive': errors.fullName }"
            />
            <p v-if="errors.fullName" class="text-sm text-destructive">
              {{ errors.fullName }}
            </p>
          </div>

          <!-- Email Field -->
          <div class="space-y-2">
            <label for="email" class="text-sm font-medium">
              Email Address <span class="text-destructive">*</span>
            </label>
            <div class="relative">
              <Icon
                  name="mdi:email"
                  class="absolute left-3 top-3 h-4 w-4 text-muted-foreground"
              />
              <Input
                  id="email"
                  v-model="profileData.email"
                  type="email"
                  placeholder="Enter your email address"
                  class="pl-10"
                  :class="{ 'border-destructive': errors.email }"
              />
            </div>
            <p v-if="errors.email" class="text-sm text-destructive">
              {{ errors.email }}
            </p>
          </div>

          <!-- Phone Number Field -->
          <div class="space-y-2">
            <label for="phoneNumber" class="text-sm font-medium">
              Phone Number
            </label>
            <div class="relative">
              <Icon
                  name="mdi:phone"
                  class="absolute left-3 top-3 h-4 w-4 text-muted-foreground"
              />
              <Input
                  id="phoneNumber"
                  v-model="profileData.phoneNumber"
                  type="tel"
                  placeholder="Enter your phone number"
                  class="pl-10"
                  :class="{ 'border-destructive': errors.phoneNumber }"
              />
            </div>
            <p v-if="errors.phoneNumber" class="text-sm text-destructive">
              {{ errors.phoneNumber }}
            </p>
          </div>

          <!-- Bio Field -->
          <div class="space-y-2">
            <label for="bio" class="text-sm font-medium">
              Bio
            </label>
            <div class="relative">
              <Icon
                  name="mdi:text"
                  class="absolute left-3 top-3 h-4 w-4 text-muted-foreground"
              />
              <textarea
                  id="bio"
                  v-model="profileData.bio"
                  placeholder="Tell us about yourself"
                  class="pl-10 min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  :class="{ 'border-destructive': errors.bio }"
              />
            </div>
            <p v-if="errors.bio" class="text-sm text-destructive">
              {{ errors.bio }}
            </p>
          </div>

          <!-- Avatar URL Field -->
          <div class="space-y-2">
            <label for="avatarUrl" class="text-sm font-medium">
              Avatar URL
            </label>
            <div class="relative">
              <Icon
                  name="mdi:image"
                  class="absolute left-3 top-3 h-4 w-4 text-muted-foreground"
              />
              <Input
                  id="avatarUrl"
                  v-model="profileData.avatarUrl"
                  type="url"
                  placeholder="Enter avatar image URL"
                  class="pl-10"
                  :class="{ 'border-destructive': errors.avatarUrl }"
              />
            </div>
            <p v-if="errors.avatarUrl" class="text-sm text-destructive">
              {{ errors.avatarUrl }}
            </p>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
                type="submit"
                :disabled="isLoading"
                class="flex-1"
            >
              <Icon
                  v-if="isLoading"
                  name="mdi:loading"
                  class="animate-spin mr-2 h-4 w-4"
              />
              <Icon
                  v-else
                  name="mdi:check"
                  class="mr-2 h-4 w-4"
              />
              {{ isLoading ? 'Updating...' : 'Update Profile' }}
            </Button>

            <Button
                type="button"
                variant="outline"
                @click="resetForm"
                :disabled="isLoading"
                class="flex-1"
            >
              <Icon name="mdi:refresh" class="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>
        </form>
      </div>

      <!-- Additional Info Section -->
      <div class="mt-6 p-4 bg-muted rounded-lg">
        <div class="flex items-start gap-3">
          <Icon name="mdi:information" class="h-5 w-5 text-muted-foreground mt-0.5" />
          <div class="text-sm text-muted-foreground">
            <p class="font-medium mb-1">Privacy Notice</p>
            <p>
              Your personal information is securely stored and will only be used
              to facilitate errand connections and improve your experience on our platform.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>