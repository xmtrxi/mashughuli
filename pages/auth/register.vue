<script setup lang="ts">
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "vue-sonner";
import { userSchema } from "~/shared/schemas/auth.schema";
import type { User } from "@prisma/client";
import type { ApiResponse } from "~/types";

useServerSeoMeta({
  title: "Create a Mashughuli Account | Join as a Requester or Runner",
  ogTitle: "Create a Mashughuli Account | Join as a Requester or Runner",
  description:
    "Sign up for Mashughuli to start posting errands or earning by completing tasks. Create your account as a requester or runner today.",
  ogDescription:
    "Sign up for Mashughuli to start posting errands or earning by completing tasks. Create your account as a requester or runner today.",
  ogImage: "/images/seo/mashughuli.png",
  ogUrl: "/auth/register",
  ogType: "website",
  twitterCard: "summary_large_image",
  twitterTitle: "Create a Mashughuli Account | Join as a Requester or Runner",
  twitterDescription:
    "Sign up for Mashughuli to start posting errands or earning by completing tasks. Create your account as a requester or runner today.",
  twitterImage: "/images/seo/mashughuli.png",
  twitterSite: "@mashughuli",
  robots: "noindex, nofollow",
});

// Router
const router = useRouter();

// Fetch errand categories for the categories field
const { data: categoriesData } = await useFetch<{
  data: Array<{ id: string; name: string; description?: string }>;
}>("/api/categories");
const errandCategories = computed(() => categoriesData.value?.data || []);

// Form handling
const { handleSubmit, errors, isFieldDirty, values } = useForm({
  validationSchema: toTypedSchema(userSchema),
  initialValues: {
    primaryRole: "requester",
    bio: "",
    categories: {},
  },
});

// Submission state
const isSubmitting = ref(false);

// Watch primary role to show/hide relevant fields
const showRunnerFields = computed(() => values.primaryRole === "runner");

// Submit handler
const onSubmit = handleSubmit(async (values) => {
  isSubmitting.value = true;
  try {
    const { data } = await useApiRequest<ApiResponse<User>>(
      "/api/auth/register",
      {
        method: "POST",
        body: values,
      },
    );

    if (data) {
      toast.success(
        "Registration successful! Please check your email to verify your account.",
      );
      await router.push("/auth/login");
    }
  } catch (error: any) {
    toast.error(error.message);
  } finally {
    isSubmitting.value = false;
  }
});
</script>

<template>
  <div class="py-12 px-4 sm:px-6 lg:px-8">
    <div
      class="mx-auto w-full max-w-lg space-y-6 rounded-lg border bg-card p-6 shadow-sm"
    >
      <div class="text-center">
        <h2 class="text-2xl font-bold">
          {{ "Create an Account" }}
        </h2>
        <p class="text-muted-foreground">
          {{ "Join Mashughuli and start your journey" }}
        </p>
      </div>

      <form @submit.prevent="onSubmit" class="space-y-4">
        <!-- User Type Selection (moved to top for better UX) -->
        <FormField
          name="primaryRole"
          v-slot="{ componentField }"
          :validate-on-blur="!isFieldDirty"
        >
          <FormItem class="space-y-3">
            <FormLabel>I want to:</FormLabel>
            <FormControl>
              <RadioGroup
                v-bind="componentField"
                class="flex flex-col space-y-2"
              >
                <FormItem
                  class="flex items-center space-x-3 space-y-0 rounded-lg border p-3 hover:bg-accent/50 transition-colors"
                >
                  <FormControl>
                    <RadioGroupItem value="requester" />
                  </FormControl>
                  <div class="space-y-1">
                    <FormLabel class="font-medium cursor-pointer">
                      Post errands (Requester)
                    </FormLabel>
                    <p class="text-sm text-muted-foreground">
                      Need help with tasks? Post errands and find reliable
                      runners.
                    </p>
                  </div>
                </FormItem>
                <FormItem
                  class="flex items-center space-x-3 space-y-0 rounded-lg border p-3 hover:bg-accent/50 transition-colors"
                >
                  <FormControl>
                    <RadioGroupItem value="runner" />
                  </FormControl>
                  <div class="space-y-1">
                    <FormLabel class="font-medium cursor-pointer">
                      Complete errands (Runner)
                    </FormLabel>
                    <p class="text-sm text-muted-foreground">
                      Earn money by helping others complete their tasks.
                    </p>
                  </div>
                </FormItem>
              </RadioGroup>
            </FormControl>
            <FormMessage>{{ errors.primaryRole }}</FormMessage>
          </FormItem>
        </FormField>

        <!-- Basic Information -->
        <div class="space-y-4">
          <div class="border-t pt-4">
            <h3 class="text-lg font-medium mb-3">Basic Information</h3>
          </div>

          <FormField
            v-slot="{ componentField }"
            name="fullName"
            :validate-on-blur="!isFieldDirty"
          >
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="Enter your full name"
                  v-bind="componentField"
                />
              </FormControl>
              <FormMessage>{{ errors.fullName }}</FormMessage>
            </FormItem>
          </FormField>

          <FormField
            v-slot="{ componentField }"
            name="email"
            :validate-on-blur="!isFieldDirty"
          >
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  v-bind="componentField"
                />
              </FormControl>
              <FormMessage>{{ errors.email }}</FormMessage>
            </FormItem>
          </FormField>

          <FormField
            v-slot="{ componentField }"
            name="phoneNumber"
            :validate-on-blur="!isFieldDirty"
          >
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input
                  type="tel"
                  placeholder="Enter your phone number"
                  v-bind="componentField"
                />
              </FormControl>
              <FormDescription>
                We'll use this to contact you about your errands.
              </FormDescription>
              <FormMessage>{{ errors.phoneNumber }}</FormMessage>
            </FormItem>
          </FormField>

          <FormField
            v-slot="{ componentField }"
            name="password"
            :validate-on-blur="!isFieldDirty"
          >
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Create a secure password"
                  v-bind="componentField"
                />
              </FormControl>
              <FormDescription>
                Must be at least 8 characters with uppercase, lowercase, and
                number.
              </FormDescription>
              <FormMessage>{{ errors.password }}</FormMessage>
            </FormItem>
          </FormField>
        </div>

        <!-- Profile Information -->
        <div class="space-y-4">
          <div class="border-t pt-4">
            <h3 class="text-lg font-medium mb-3">Profile Information</h3>
          </div>

          <FormField
            v-slot="{ componentField }"
            name="bio"
            :validate-on-blur="!isFieldDirty"
          >
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us a bit about yourself..."
                  class="min-h-[80px]"
                  v-bind="componentField"
                />
              </FormControl>
              <FormDescription>
                <template v-if="showRunnerFields">
                  Help requesters understand your experience and what makes you
                  reliable.
                </template>
                <template v-else>
                  Share a brief introduction about yourself.
                </template>
              </FormDescription>
              <FormMessage>{{ errors.bio }}</FormMessage>
            </FormItem>
          </FormField>

          <!-- Categories (show for runners) -->
          <FormField
            v-if="showRunnerFields"
            v-slot="{ componentField }"
            name="categories"
            :validate-on-blur="!isFieldDirty"
          >
            <FormItem class="space-y-3">
              <FormLabel>Service Categories</FormLabel>
              <FormDescription>
                Select the types of errands you're interested in completing.
              </FormDescription>
              <FormControl>
                <div
                  class="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto border rounded-md p-3"
                >
                  <div
                    v-for="category in errandCategories"
                    :key="category.id"
                    class="flex items-center space-x-2"
                  >
                    <Checkbox
                      :id="category.id"
                      :value="category.id"
                      @update:checked="
                        (checked) => {
                          const current = componentField.value || {};
                          if (checked) {
                            current[category.id] = true;
                          } else {
                            delete current[category.id];
                          }
                          componentField.onChange(current);
                        }
                      "
                    />
                    <label
                      :for="category.id"
                      class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {{ category.name }}
                    </label>
                    <p
                      v-if="category.description"
                      class="text-xs text-muted-foreground"
                    >
                      {{ category.description }}
                    </p>
                  </div>
                </div>
              </FormControl>
              <FormMessage>{{ errors.categories }}</FormMessage>
            </FormItem>
          </FormField>
        </div>

        <Button type="submit" class="w-full" :disabled="isSubmitting">
          {{ isSubmitting ? "Creating Account..." : "Create Account" }}
        </Button>
      </form>

      <div class="text-center text-sm">
        <p>
          Already have an account?
          <NuxtLink
            to="/auth/login"
            class="font-medium text-mashughuli-400 hover:underline"
          >
            Sign in
          </NuxtLink>
        </p>
      </div>

      <div class="relative">
        <div class="absolute inset-0 flex items-center">
          <span class="w-full border-t" />
        </div>
        <div class="relative flex justify-center text-xs uppercase">
          <span class="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <!-- <Button variant="outline" class="w-full"> -->
        <!--   <svg class="w-4 h-4 mr-2" viewBox="0 0 24 24"> -->
        <!--     <path -->
        <!--       fill="currentColor" -->
        <!--       d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" -->
        <!--     /> -->
        <!--     <path -->
        <!--       fill="currentColor" -->
        <!--       d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" -->
        <!--     /> -->
        <!--     <path -->
        <!--       fill="currentColor" -->
        <!--       d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" -->
        <!--     /> -->
        <!--     <path -->
        <!--       fill="currentColor" -->
        <!--       d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" -->
        <!--     /> -->
        <!--   </svg> -->
        <!--   Google -->
        <!-- </Button> -->
        <!-- <Button variant="outline" class="w-full"> -->
        <!--   <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24"> -->
        <!--     <path -->
        <!--       d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" -->
        <!--     /> -->
        <!--   </svg> -->
        <!--   Facebook -->
        <!-- </Button> -->
      </div>
    </div>
  </div>
</template>
