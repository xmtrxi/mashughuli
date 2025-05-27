<script setup lang="ts">
import { Form, useForm } from "vee-validate";
import * as z from "zod";
import { toast } from "vue-sonner";
import { toTypedSchema } from "@vee-validate/zod";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { createErrandSchema } from "~/shared/schemas/errands.schema";
import type { Errand, ErrandCategory } from "@prisma/client";
import type { ApiResponse } from "~/types";

const { handleSubmit, isFieldDirty } = useForm({
  validationSchema: toTypedSchema(createErrandSchema),
});

const isSubmitting = ref(false);

const onSubmit = handleSubmit(async (values) => {
  isSubmitting.value = true;
  try {
    const { data } = await useApiRequest<ApiResponse<Errand>>("/api/errands", {
      body: values,
      method: "post",
    });
    if (data) {
      toast.success("Errand created successfully");
      await navigateTo("/errands");
    }
  } catch (error: any) {
    toast.error(error.data.message);
  } finally {
    isSubmitting.value = false;
  }
});
const { data: categories, error } =
  await useApiFetch<ApiResponse<ErrandCategory[]>>("/api/categories");
</script>

<template>
  <div class="container mx-auto px-4 py-12">
    <div class="mb-8 text-center">
      <h1 class="text-3xl font-bold">Post a new Errands</h1>
      <p class="text-muted-foreground mt-2 max-w-2xl mx-auto">
        Fill out the form below with details about your errand to connect with
        runners who can help you get it done.
      </p>
    </div>
    <div class="mx-auto max-w-2xl p-6 bg-card rounded-lg border shadow-sm">
      <h2 class="text-2xl font-bold mb-6">Post a New Errand</h2>

      <form class="grid grid-cols-1 gap-3" @submit.prevent="onSubmit">
        <FormField
          v-slot="{ componentField }"
          name="title"
          :validate-on-blur="!isFieldDirty"
        >
          <FormItem>
            <FormLabel class="block"> Title </FormLabel>
            <FormControl>
              <Input
                type="text"
                v-bind="componentField"
                placeholder="Errand title"
              />
            </FormControl>
            <FormDescription>
              A clear, concise title for your errand.
            </FormDescription>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField
          v-slot="{ componentField }"
          :validate-on-blur="!isFieldDirty"
          name="description"
        >
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea
                v-bind="componentField"
                placeholder="Detailed description of what needs to be done"
                rows="5"
              />
            </FormControl>
            <FormDescription>
              Be specific about what the task involves.
            </FormDescription>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField
          v-slot="{ componentField }"
          :validate-on-blur="!isFieldDirty"
          name="location"
        >
          <FormItem>
            <FormLabel>Location</FormLabel>
            <FormControl>
              <Input
                v-bind="componentField"
                placeholder="Where is this errand located?"
              />
            </FormControl>
            <FormDescription>
              Enter a specific address or general area.
            </FormDescription>
            <FormMessage />
          </FormItem>
        </FormField>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            v-slot="{ componentField }"
            :validate-on-blur="!isFieldDirty"
            name="categoryId"
          >
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <Select v-bind="componentField">
                  <SelectTrigger class="w-full">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      v-for="category in categories?.data"
                      :key="category.id"
                      :value="category.id"
                    >
                      {{ category.name }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField
            v-slot="{ componentField }"
            :validate-on-blur="!isFieldDirty"
            name="priority"
          >
            <FormItem>
              <FormLabel>Priority</FormLabel>
              <FormControl>
                <Select v-bind="componentField">
                  <SelectTrigger class="w-full">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low"> Low Priority </SelectItem>
                    <SelectItem value="medium"> Medium Priority </SelectItem>
                    <SelectItem value="high"> High Priority </SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField
            v-slot="{ componentField }"
            :validate-on-blur="!isFieldDirty"
            name="budgetMin"
          >
            <FormItem>
              <FormLabel>Minimum Budget</FormLabel>
              <FormControl>
                <Input
                  v-bind="componentField"
                  type="number"
                  min="1"
                  placeholder="Min"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField
            v-slot="{ componentField }"
            :validate-on-blur="!isFieldDirty"
            name="budgetMax"
          >
            <FormItem>
              <FormLabel>Maximum Budget</FormLabel>
              <FormControl>
                <Input
                  v-bind="componentField"
                  type="number"
                  min="1"
                  placeholder="Max"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
        </div>

        <FormField
          v-slot="{ componentField }"
          :validate-on-blur="!isFieldDirty"
          name="dueDate"
        >
          <FormItem>
            <FormLabel>Due Date</FormLabel>
            <FormControl>
              <Input type="date" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <Button type="submit" :disabled="isSubmitting">
          {{ isSubmitting ? "Posting..." : "Post Errand" }}
        </Button>
      </form>
    </div>
  </div>
</template>
