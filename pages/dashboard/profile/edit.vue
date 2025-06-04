<script setup lang="ts">
import { buttonVariants } from "~/components/ui/button";

const authStore = useAuthStore();

// Form data
const profileData = ref({
  name: authStore?.user?.fullName || "",
  phone: authStore?.user?.phoneNumber || "",
  email: authStore?.user?.email || "",
  // dob: authStore?.user?.dateOfBirth ? new Date(authStore.user.dateOfBirth).toISOString().split('T')[0] : ""
});

// Form validation errors
const errors = ref({
  name: "",
  phone: "",
  email: "",
  dob: ""
});

// Loading state
const isLoading = ref(false);

// Load existing profile data
onMounted(async () => {
  // If user data is not already loaded in the store, fetch it
  if (!authStore.user) {
    try {
      const { data } = await $fetch('/api/users/:id', {
        method: 'GET'
      }).catch((error) => {
        console.error('Error loading profile:', error);
        return null;
      });
      if (data) {
        authStore.setUser(data);
        // Update form with fresh data
        profileData.value = {
          name: data.name || "",
          phone: data.phone || "",
          email: data.email || "",
          dob: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString().split('T')[0] : ""
        };
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  }
});

// Validate form fields
function validateForm() {
  errors.value = {
    name: "",
    phone: "",
    email: "",
    dob: ""
  };

  let isValid = true;

  // Name validation
  if (!profileData.value.name.trim()) {
    errors.value.name = "Name is required";
    isValid = false;
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!profileData.value.email.trim()) {
    errors.value.email = "Email is required";
    isValid = false;
  } else if (!emailRegex.test(profileData.value.email)) {
    errors.value.email = "Please enter a valid email address";
    isValid = false;
  }

  // Phone validation
  if (!profileData.value.phone.trim()) {
    errors.value.phone = "Phone number is required";
    isValid = false;
  }

  // Date of birth validation
  if (!profileData.value.dob) {
    errors.value.dob = "Date of birth is required";
    isValid = false;
  }

  return isValid;
}

// Handle form submission
async function handleSubmit() {
  if (!validateForm()) {
    return;
  }

  isLoading.value = true;

  try {
    // Update profile via API
    const { data } = await $fetch('/api/profile', {
      method: 'PUT',
      body: {
        name: profileData.value.name,
        phone: profileData.value.phone,
        email: profileData.value.email,
        dateOfBirth: new Date(profileData.value.dob).toISOString()
      }
    });

    // Update the auth store with new data
    if (data) {
      authStore.updateUser(data);
    }

    // Show success message
    console.log('Profile updated successfully');

  } catch (error) {
    console.error('Error updating profile:', error);
  } finally {
    isLoading.value = false;
  }
}

// Reset form
function resetForm() {
  profileData.value = {
    name: "",
    phone: "",
    email: "",
    dob: ""
  };
  errors.value = {
    name: "",
    phone: "",
    email: "",
    dob: ""
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
          <!-- Name Field -->
          <div class="space-y-2">
            <label for="name" class="text-sm font-medium">
              Full Name <span class="text-destructive">*</span>
            </label>
            <Input
                id="name"
                v-model="profileData.name"
                type="text"
                placeholder="Enter your full name"
                :class="{ 'border-destructive': errors.name }"
            />
            <p v-if="errors.name" class="text-sm text-destructive">
              {{ errors.name }}
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

          <!-- Phone Field -->
          <div class="space-y-2">
            <label for="phone" class="text-sm font-medium">
              Phone Number <span class="text-destructive">*</span>
            </label>
            <div class="relative">
              <Icon
                  name="mdi:phone"
                  class="absolute left-3 top-3 h-4 w-4 text-muted-foreground"
              />
              <Input
                  id="phone"
                  v-model="profileData.phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  class="pl-10"
                  :class="{ 'border-destructive': errors.phone }"
              />
            </div>
            <p v-if="errors.phone" class="text-sm text-destructive">
              {{ errors.phone }}
            </p>
          </div>

          <!-- Date of Birth Field -->
          <div class="space-y-2">
            <label for="dob" class="text-sm font-medium">
              Date of Birth <span class="text-destructive">*</span>
            </label>
            <div class="relative">
              <Icon
                  name="mdi:calendar"
                  class="absolute left-3 top-3 h-4 w-4 text-muted-foreground"
              />
              <Input
                  id="dob"
                  v-model="profileData.dob"
                  type="date"
                  class="pl-10"
                  :class="{ 'border-destructive': errors.dob }"
              />
            </div>
            <p v-if="errors.dob" class="text-sm text-destructive">
              {{ errors.dob }}
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