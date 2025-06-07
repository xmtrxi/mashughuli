<script setup lang="ts">
import { Form, useForm } from "vee-validate";
import * as z from "zod";
import { toast } from "vue-sonner";
import { toTypedSchema } from "@vee-validate/zod";
import type { Errand, ErrandCategory } from "@prisma/client";
import type { ApiResponse } from "~/types";
import { createErrandSchema } from "~/shared/schemas/errands.schema";

const { handleSubmit, isFieldDirty, setFieldValue, values } = useForm({
  validationSchema: toTypedSchema(createErrandSchema),
  initialValues: {
    priority: "medium",
    status: "open",
  },
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

const { data: categories } =
  await useApiFetch<ApiResponse<ErrandCategory[]>>("/api/categories");

function handleLocationUpdate(location: { lat: number; lng: number }) {
  setFieldValue("latitude", location.lat);
  setFieldValue("longitude", location.lng);
}
</script>

<template>
  <div class="container mx-auto px-4 py-12">
    <div class="mb-8 text-center">
      <h1 class="text-3xl font-bold">Post a New Errand</h1>
      <p class="text-muted-foreground mt-2 max-w-2xl mx-auto">
        Fill out the form below with details about your errand to connect with
        runners who can help you get it done.
      </p>
    </div>
    <div class="mx-auto max-w-2xl p-6 bg-card rounded-lg border shadow-sm">
      <h2 class="text-2xl font-bold mb-6">Errand Details</h2>

      <form class="grid grid-cols-1 gap-6" @submit.prevent="onSubmit">
        <FormField
          v-slot="{ componentField }"
          name="title"
          :validate-on-blur="!isFieldDirty"
        >
          <FormItem>
            <FormLabel>Title</FormLabel>
            <FormControl>
              <Input
                type="text"
                v-bind="componentField"
                placeholder="e.g., Pick up groceries from the supermarket"
              />
            </FormControl>
            <FormDescription>
              A clear, concise title for your errand.
            </FormDescription>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="description">
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
              Be specific about the task, including any lists, sizes, or special
              instructions.
            </FormDescription>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="customLocation">
          <FormItem>
            <FormLabel>Location Description</FormLabel>
            <FormControl>
              <Input
                v-bind="componentField"
                placeholder="e.g., Naivas, Westlands"
              />
            </FormControl>
            <FormDescription>
              Enter a specific address or general area. Then, select the exact
              point on the map below.
            </FormDescription>
            <FormMessage />
          </FormItem>
        </FormField>

        <div>
          <Label>Pin Location on Map</Label>
          <ClientOnly>
            <MapSelector @update:location="handleLocationUpdate" />
            <template #fallback>
              <div
                class="w-full h-64 bg-muted rounded-lg flex items-center justify-center"
              >
                <p>Loading Map...</p>
              </div>
            </template>
          </ClientOnly>
          <FormField v-slot="{ componentField }" name="latitude"
            ><input type="hidden" v-bind="componentField"
          /></FormField>
          <FormField v-slot="{ componentField }" name="longitude"
            ><input type="hidden" v-bind="componentField"
          /></FormField>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField v-slot="{ componentField }" name="categoryId">
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select v-bind="componentField">
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
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
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="priority">
            <FormItem>
              <FormLabel>Priority</FormLabel>
              <Select v-bind="componentField">
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a priority" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="low"> Low Priority </SelectItem>
                  <SelectItem value="medium"> Medium Priority </SelectItem>
                  <SelectItem value="high"> High Priority </SelectItem>
                  <SelectItem value="urgent"> Urgent </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="budgetMin">
            <FormItem>
              <FormLabel>Minimum Budget (KES)</FormLabel>
              <FormControl>
                <Input
                  v-bind="componentField"
                  type="number"
                  min="1"
                  placeholder="e.g., 500"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="budgetMax">
            <FormItem>
              <FormLabel>Maximum Budget (KES)</FormLabel>
              <FormControl>
                <Input
                  v-bind="componentField"
                  type="number"
                  min="1"
                  placeholder="e.g., 1500"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
        </div>

        <FormField v-slot="{ componentField }" name="deadline">
          <FormItem>
            <FormLabel>Deadline</FormLabel>
            <FormControl>
              <Input type="datetime-local" v-bind="componentField" />
            </FormControl>
            <FormDescription
              >When does this errand need to be completed by?</FormDescription
            >
            <FormMessage />
          </FormItem>
        </FormField>

        <Button type="submit" :disabled="isSubmitting" class="w-full">
          <Icon
            v-if="isSubmitting"
            name="mdi:loading"
            class="animate-spin mr-2"
          />
          {{ isSubmitting ? "Posting..." : "Post Errand" }}
        </Button>
      </form>
    </div>
  </div>
</template>
