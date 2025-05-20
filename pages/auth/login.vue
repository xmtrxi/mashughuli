<script setup lang="ts">
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "vue-sonner";
import { loginSchema } from "~/shared/schemas/auth.schema";
import type { User } from "@prisma/client";
useServerSeoMeta({
  title: "Sign In to Mashughuli | Access Your Account",
  ogTitle: "Sign In to Mashughuli | Access Your Account",
  description:
    "Sign in to your Mashughuli account to post errands, apply for tasks, track progress, and manage your payments.",
  ogDescription:
    "Sign in to your Mashughuli account to post errands, apply for tasks, track progress, and manage your payments.",
  ogImage: "/images/seo/mashughuli.png",
  ogUrl: "/auth/login",
  ogType: "website",
  twitterCard: "summary_large_image",
  twitterTitle: "Sign In to Mashughuli | Access Your Account",
  twitterDescription:
    "Sign in to your Mashughuli account to post errands, apply for tasks, track progress, and manage your payments.",
  twitterImage: "/images/seo/mashughuli.png",
  twitterSite: "@mashughuli",
  robots: "noindex, nofollow", // Usually better to not index login pages
});

// Router
const router = useRouter();

// Form handling
const { handleSubmit, errors, isFieldDirty } = useForm({
  validationSchema: toTypedSchema(loginSchema),
});

// Submission state
const isSubmitting = ref(false);

// Submit handler
const onSubmit = handleSubmit(async (values) => {
  isSubmitting.value = true;
  try {
    const { data } = await useApiRequest<ApiResponse<User>>("/api/auth/login", {
      method: "POST",
      body: values,
    });
    if (data) {
      toast.success("Login Success");
      router.push("/dashboard");
    }
  } catch (error: any) {
    // Show the most relevant error message to the user
    toast.error(error.data?.message || "An unknown error occurred");

    // Log all available error details
    console.error("Auth error:", {
      statusCode: error.statusCode,
      statusMessage: error.statusMessage,
      data: error.data,
      message: error.message,
      // Sometimes, the response body is in _data
      responseData: error.response?._data,
      fullError: error,
    });
  } finally {
    isSubmitting.value = false;
  }
});

// Navigation handlers
const navigateToRegister = () => {
  router.push("/register");
};

const navigateToLogin = () => {
  router.push("/login");
};
</script>

<template>
  <div class="py-12 px-4 sm:px-6 lg:px-8">
    <div
      class="mx-auto w-full max-w-md space-y-6 rounded-lg border bg-card p-6 shadow-sm"
    >
      <div class="text-center">
        <h2 class="text-2xl font-bold">
          {{ "Sign In" }}
        </h2>
        <p class="text-muted-foreground">
          {{ "Enter your credentials to access your account" }}
        </p>
      </div>

      <form @submit.prevent="onSubmit" class="space-y-4">
        <FormField v-slot="{ componentField }" name="email">
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input
                type="email"
                placeholder="Your email address"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage>{{ errors.email }}</FormMessage>
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="password">
          <FormItem>
            <FormLabel>Password</FormLabel>
            <FormControl>
              <Input
                type="password"
                placeholder="Your password"
                v-bind="componentField"
              />
            </FormControl>

            <FormMessage>{{ errors.password }}</FormMessage>
          </FormItem>
        </FormField>

        <Button type="submit" class="w-full" :disabled="isSubmitting">
          {{ isSubmitting ? "Processing..." : "Sign In" }}
        </Button>
      </form>

      <div class="text-center text-sm">
        <p>
          Don't have an account?
          <NuxtLink
            to="/auth/register"
            class="font-medium text-primary-400 hover:underline"
          >
            Sign Up
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
        <Button variant="outline" class="w-full"> Google </Button>
        <Button variant="outline" class="w-full"> Facebook </Button>
      </div>
    </div>
  </div>
</template>
