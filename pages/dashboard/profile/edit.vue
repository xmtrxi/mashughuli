<script setup lang="ts">
import { ref, watch } from "vue";
import { z } from "zod";
import type { ApiResponse } from "~/types";
import {
  profileSchema,
  type ProfileData,
} from "~/shared/schemas/profileData.schema";
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { toast } from "vue-sonner";

definePageMeta({
  title: "Edit Profile",
});

const isLoading = ref(false);
const authStore = useAuthStore();

// Vee-Validate Form
const { handleSubmit, setValues, resetForm, errors } = useForm<ProfileData>({
  validationSchema: toTypedSchema(profileSchema),
});

// Fetch profile data and set form values
const { data: profileResponse, pending } =
  await useApiFetch<ApiResponse<ProfileData>>("/api/users/profile");

watch(
  profileResponse,
  (newProfile) => {
    if (newProfile?.data) {
      setValues({
        fullName: newProfile.data.fullName,
        email: newProfile.data.email,
        phoneNumber: newProfile.data.phoneNumber,
        bio: newProfile.data.bio,
        avatarUrl: newProfile.data.avatarUrl,
      });
    }
  },
  { immediate: true },
);

const onSubmit = handleSubmit(async (values) => {
  isLoading.value = true;
  try {
    const { data: updatedUser, success } = await useApiRequest<
      ApiResponse<ProfileData>
    >("/api/users/update", {
      method: "PUT",
      body: values,
    });

    if (success && updatedUser) {
      toast.success("Profile updated successfully!");
      // Optionally update the auth store user
      authStore.user = { ...authStore.user, ...updatedUser };
      await navigateTo("/dashboard/profile");
    } else {
      toast.error("Failed to update profile.");
    }
  } catch (error: any) {
    console.error("Error updating profile:", error);
    toast.error(error.data?.message || "An error occurred.");
  } finally {
    isLoading.value = false;
  }
});
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
        <div v-if="pending" class="flex justify-center items-center py-10">
          <Icon name="mdi:loading" class="h-8 w-8 animate-spin text-primary" />
        </div>
        <form v-else @submit="onSubmit" class="space-y-6">
          <FormField v-slot="{ componentField }" name="fullName">
            <FormItem>
              <FormLabel
                >Full Name <span class="text-destructive">*</span></FormLabel
              >
              <FormControl>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  v-bind="componentField"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="email">
            <FormItem>
              <FormLabel
                >Email Address
                <span class="text-destructive">*</span></FormLabel
              >
              <FormControl>
                <div class="relative">
                  <Icon
                    name="mdi:email"
                    class="absolute left-3 top-3 h-4 w-4 text-muted-foreground"
                  />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    class="pl-10"
                    v-bind="componentField"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="phoneNumber">
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <div class="relative">
                  <Icon
                    name="mdi:phone"
                    class="absolute left-3 top-3 h-4 w-4 text-muted-foreground"
                  />
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="Enter your phone number"
                    class="pl-10"
                    v-bind="componentField"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="bio">
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea
                  id="bio"
                  placeholder="Tell us about yourself"
                  class="min-h-[100px]"
                  v-bind="componentField"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="avatarUrl">
            <FormItem>
              <FormLabel>Avatar URL</FormLabel>
              <FormControl>
                <div class="relative">
                  <Icon
                    name="mdi:image"
                    class="absolute left-3 top-3 h-4 w-4 text-muted-foreground"
                  />
                  <Input
                    id="avatarUrl"
                    type="url"
                    placeholder="Enter avatar image URL"
                    class="pl-10"
                    v-bind="componentField"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Action Buttons -->
          <div class="flex flex-col sm:flex-row gap-3 pt-4">
            <Button type="submit" :disabled="isLoading" class="flex-1">
              <Icon
                v-if="isLoading"
                name="mdi:loading"
                class="animate-spin mr-2 h-4 w-4"
              />
              <Icon v-else name="mdi:check" class="mr-2 h-4 w-4" />
              {{ isLoading ? "Updating..." : "Update Profile" }}
            </Button>

            <Button
              type="button"
              variant="outline"
              @click="() => resetForm()"
              :disabled="isLoading"
              class="flex-1"
            >
              <Icon name="mdi:refresh" class="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
