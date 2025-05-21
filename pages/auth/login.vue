<script setup lang="ts">
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { loginSchema } from "~/shared/schemas/auth.schema";

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
const authStore = useAuthStore();

// Form handling
const { handleSubmit, errors, isFieldDirty } = useForm({
  validationSchema: toTypedSchema(loginSchema),
});

// Submit handler
const onSubmit = handleSubmit(async (values) => {
  await authStore.login(values);
});
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
        <FormField
          v-slot="{ componentField }"
          name="email"
          :validate-on-blur="!isFieldDirty"
        >
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
                placeholder="Your password"
                v-bind="componentField"
              />
            </FormControl>

            <FormMessage>{{ errors.password }}</FormMessage>
          </FormItem>
        </FormField>

        <Button type="submit" class="w-full" :disabled="authStore.loading">
          {{ authStore.loading ? "Processing..." : "Sign In" }}
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
