<script setup lang="ts">
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "vue-sonner";
import { createBidSchema } from "~/shared/schemas/errands.schema";
import type { ApiResponse } from "~/types";
import type { Bid } from "@prisma/client";

// Define props with TypeScript
interface BidFormProps {
  errandId: string;
  minBudget: number;
  maxBudget: number;
  currency: string;
  onBidSubmitted?: () => void;
}

const props = defineProps<BidFormProps>();
const route = useRoute();
const errandId = route.params.id;

// Emits
const emit = defineEmits<{
  (e: "bid-submitted"): void;
}>();

// State
const isSubmitting = ref(false);

// Form validation
const { handleSubmit, errors, resetForm, values } = useForm({
  validationSchema: toTypedSchema(createBidSchema),
  initialValues: {
    price: props.maxBudget,
    estimatedCompletionTime: "",
    notes: "",
    experienceDetails: "",
    errandId: errandId as string,
  },
});

// Currency formatting
const formatCurrency = (value: string | number) => {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: props.currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

// Bid info calculation
const bidInfo = computed(() => {
  const current = parseFloat((values.price ?? 0).toString());
  const min = props.minBudget;
  const max = props.maxBudget;

  if (current < min) {
    return {
      message: `Your bid is below the minimum budget of ${formatCurrency(min)}`,
      color: "text-yellow-600",
    };
  } else if (current > max) {
    return {
      message: `Your bid exceeds the maximum budget of ${formatCurrency(max)}`,
      color: "text-yellow-600",
    };
  } else {
    return {
      message: "Your bid is within the budget range",
      color: "text-green-600",
    };
  }
});

const onSubmit = handleSubmit(async (values) => {
  values.errandId = errandId as string;
  isSubmitting.value = true;
  try {
    const { data, success } = await useApiRequest<ApiResponse<Bid>>(
      "/api/errands/bids",
      {
        body: {
          ...values,
        },
        method: "POST",
      },
    );
    if (data) {
      toast.success("Your bid has been submitted!");
      resetForm();

      // Emit event or call callback
      emit("bid-submitted");
    }

    if (props.onBidSubmitted) {
      props.onBidSubmitted();
    }
  } catch (error: any) {
    console.error("Error submitting bid:", error.data);
    toast.error("Failed to submit your bid. Please try again.");
  } finally {
    isSubmitting.value = false;
  }
});
</script>

<template>
  <div class="p-6 bg-card rounded-lg border shadow-sm">
    <h3 class="text-xl font-semibold mb-4">Submit Your Bid</h3>
    <p class="mb-4 text-sm text-muted-foreground">
      Budget range: {{ formatCurrency(minBudget) }} -
      {{ formatCurrency(maxBudget) }}
    </p>

    <form @submit.prevent="onSubmit" class="space-y-4">
      <FormField v-slot="{ componentField }" name="price">
        <FormItem>
          <FormLabel>Your Bid Amount ({{ currency }})</FormLabel>
          <FormControl>
            <Input type="number" :min="0" step="0.01" v-bind="componentField" />
          </FormControl>
          <p :class="['text-xs', bidInfo.color]">
            {{ bidInfo.message }}
          </p>
          <FormMessage>{{ errors.price }}</FormMessage>
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="estimatedCompletionTime">
        <FormItem>
          <FormLabel>Estimated Completion Time</FormLabel>
          <FormControl>
            <Input
              type="datetime-local"
              placeholder="e.g., 3 hours, 2 days"
              v-bind="componentField"
            />
          </FormControl>
          <FormDescription>
            How long will it take you to complete this errand?
          </FormDescription>
          <FormMessage>{{ errors.estimatedCompletionTime }}</FormMessage>
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="experienceDetails">
        <FormItem>
          <FormLabel>Why you're the best person for this errand</FormLabel>
          <FormControl>
            <Textarea
              placeholder="Describe your experience, skills, and why you should be chosen..."
              :rows="4"
              v-bind="componentField"
            />
          </FormControl>
          <FormDescription>
            Include relevant experience and any questions you have.
          </FormDescription>
          <FormMessage>{{ errors.experienceDetails }}</FormMessage>
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="notes">
        <FormItem>
          <FormLabel>Extra Notes</FormLabel>
          <FormControl>
            <Textarea
              placeholder="Other notes to take on"
              :rows="4"
              v-bind="componentField"
            />
          </FormControl>
          <FormDescription> Other important notes </FormDescription>
          <FormMessage>{{ errors.notes }}</FormMessage>
        </FormItem>
      </FormField>

      <Button type="submit" class="w-full" :disabled="isSubmitting">
        {{ isSubmitting ? "Submitting..." : "Submit Bid" }}
      </Button>
    </form>
  </div>
</template>
