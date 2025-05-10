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
import { formatDate } from "@vueuse/core";
const formSchema = toTypedSchema(
  z.object({
    title: z.string().min(5).max(100),
    description: z.string().min(20).max(1000),
    location: z.string().min(5),
    category: z.string(),
    priority: z.enum(["low", "medium", "high"]),
    budgetMin: z.number().min(5),
    budgetMax: z.number().min(5),
    dueDate: z.date(),
  }),
);

const { handleSubmit, isFieldDirty, setErrors, values, setFieldValue } =
  useForm({
    validationSchema: formSchema,
  });

const dueDate = computed({
  get: () => (values.dueDate ? values.dueDate : undefined),
  set: (val) => val,
});
const isSubmitting = ref(false);

const onSubmit = handleSubmit((values) => {
  toast({
    title: "You submitted the following values:",
    description: h(
      "pre",
      { class: "mt-2 w-[340px] rounded-md bg-slate-950 p-4" },
      h("code", { class: "text-white" }, JSON.stringify(values, null, 2)),
    ),
  });
});
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
          name="title"
          v-slot="{ componentField }"
          :validate-on-blur="!isFieldDirty"
        >
          <FormItem>
            <FormLabel class="block">Title</FormLabel>
            <FormControl>
              <Input
                type="text"
                v-bind="componentField"
                placeholder="Errand title"
              />
            </FormControl>
            <FormDescription
              >A clear, concise title for your errand.</FormDescription
            >
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
            <FormDescription
              >Be specific about what the task involves.</FormDescription
            >
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
            <FormDescription
              >Enter a specific address or general area.</FormDescription
            >
            <FormMessage />
          </FormItem>
        </FormField>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            v-slot="{ componentField }"
            :validate-on-blur="!isFieldDirty"
            name="priority"
          >
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <Select v-bind="componentField">
                  <SelectTrigger class="w-full">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="shopping">Shopping</SelectItem>
                    <SelectItem value="delivery">Delivery</SelectItem>
                    <SelectItem value="home-services">Home Services</SelectItem>
                    <SelectItem value="administrative"
                      >Administrative</SelectItem
                    >
                    <SelectItem value="pet-care">Pet Care</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
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
                    <SelectItem value="low">Low Priority</SelectItem>
                    <SelectItem value="medium">Medium Priority</SelectItem>
                    <SelectItem value="high">High Priority</SelectItem>
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
              <Popover>
                <PopoverTrigger as-child>
                  <Button variant="outline" class="w-full text-left">
                    {{ dueDate ? dueDate : "Pick a date" }}
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <Calendar
                    v-model="dueDate"
                    @update:model-value="
                      (v) => {
                        if (v) {
                          setFieldValue('dueDate', v.toString());
                        } else {
                          setFieldValue('dueDate', undefined);
                        }
                      }
                    "
                  />
                </PopoverContent>
              </Popover>
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
