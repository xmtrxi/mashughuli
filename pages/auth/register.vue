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

// Form handling
const { handleSubmit, errors, isFieldDirty } = useForm({
  validationSchema: toTypedSchema(userSchema),
  initialValues: {
    primaryRole: "requester",
  },
});

// Submission state
const isSubmitting = ref(false);

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
      class="mx-auto w-full max-w-md space-y-6 rounded-lg border bg-card p-6 shadow-sm"
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
                placeholder="Your Full Name"
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
          name="phoneNumber"
          :validate-on-blur="!isFieldDirty"
        >
          <FormItem>
            <FormLabel>Phone Number</FormLabel>
            <FormControl>
              <Input
                type="text"
                placeholder="Your phone Number"
                v-bind="componentField"
              />
            </FormControl>
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
                placeholder="Your password"
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

        <FormField
          name="userType"
          v-slot="{ componentField }"
          :validate-on-blur="!isFieldDirty"
        >
          <FormItem class="space-y-3">
            <FormLabel>I want to:</FormLabel>
            <FormControl>
              <RadioGroup
                v-bind="componentField"
                class="flex flex-col space-y-1"
              >
                <FormItem class="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="requester" />
                  </FormControl>
                  <FormLabel class="font-normal">
                    Post errands (Requester)
                  </FormLabel>
                </FormItem>
                <FormItem class="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="runner" />
                  </FormControl>
                  <FormLabel class="font-normal">
                    Complete errands (Runner)
                  </FormLabel>
                </FormItem>
              </RadioGroup>
            </FormControl>
            <FormMessage>{{ errors.primaryRole }}</FormMessage>
          </FormItem>
        </FormField>

        <Button type="submit" class="w-full" :disabled="isSubmitting">
          {{ isSubmitting ? "Processing..." : "Create Account" }}
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
        <Button variant="outline" class="w-full"> Google </Button>
        <Button variant="outline" class="w-full"> Facebook </Button>
      </div>
    </div>
  </div>
</template>
