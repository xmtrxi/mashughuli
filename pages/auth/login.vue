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

// Define form schema for validation
const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

// Router
const router = useRouter();

// Form handling
const { handleSubmit, errors, isFieldDirty } = useForm({
  validationSchema: toTypedSchema(formSchema),
});

// Submission state
const isSubmitting = ref(false);

// Submit handler
const onSubmit = handleSubmit(async (values) => {
  isSubmitting.value = true;
  try {
    // This would be where you integrate with your auth backend
    console.log("Form submitted:", values);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast.success("Login successful!");
    router.push("/dashboard");
  } catch (error) {
    toast.error("An error occurred. Please try again.");
    console.error("Auth error:", error);
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

      <Form>
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
      </Form>

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
