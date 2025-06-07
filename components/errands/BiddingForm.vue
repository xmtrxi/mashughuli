<script setup lang="ts">
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { toast } from "vue-sonner";
import { createBidSchema } from "~/shared/schemas/errands.schema";
import type { ApiResponse } from "~/types";
import type { Bid } from "@prisma/client";

// Define props with TypeScript
interface BidFormProps {
  errandId: string;
  minBudget: number | null;
  maxBudget: number | null;
  currency?: string;
  onBidSubmitted?: () => void;
}

const props = withDefaults(defineProps<BidFormProps>(), {
  currency: "KES",
});
const route = useRoute();

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
    price: props.maxBudget ?? 0,
    estimatedCompletionTime: "",
    notes: "",
    experienceDetails: "",
    errandId: props.errandId,
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
  const min = props.minBudget ?? 0;
  const max = props.maxBudget ?? Infinity;

  if (current < min && props.minBudget) {
    return {
      message: `Your bid is below the minimum budget of ${formatCurrency(min)}`,
      color: "text-yellow-600",
    };
  } else if (current > max && props.maxBudget) {
    return {
      message: `Your bid exceeds the maximum budget of ${formatCurrency(max)}`,
      color: "text-yellow-600",
    };
  } else {
    return {
      message: "Your bid seems reasonable.",
      color: "text-green-600",
    };
  }
});

const onSubmit = handleSubmit(async (formValues) => {
  isSubmitting.value = true;
  try {
    const { data } = await useApiRequest<ApiResponse<Bid>>(
      "/api/errands/bids",
      {
        body: {
          ...formValues,
        },
        method: "POST",
      },
    );
    if (data) {
      toast.success("Your bid has been submitted!");
      resetForm();

      // Emit event or call callback
      emit("bid-submitted");
      if (props.onBidSubmitted) {
        props.onBidSubmitted();
      }
    }
  } catch (error: any) {
    console.error("Error submitting bid:", error.data);
    toast.error(
      error.data?.message || "Failed to submit your bid. Please try again.",
    );
  } finally {
    isSubmitting.value = false;
  }
});
</script>

<template>
  <div class="p-6 bg-card rounded-lg border shadow-sm">
    <h3 class="text-xl font-semibold mb-4">Submit Your Bid</h3>
    <p v-if="minBudget || maxBudget" class="mb-4 text-sm text-muted-foreground">
      Budget range:
      {{ minBudget ? formatCurrency(minBudget) : "N/A" }} -
      {{ maxBudget ? formatCurrency(maxBudget) : "N/A" }}
    </p>

    <form @submit.prevent="onSubmit" class="space-y-4">
      <FormField v-slot="{ componentField }" name="price">
        <FormItem>
          <FormLabel>Your Bid Amount ({{ currency }})</FormLabel>
          <FormControl>
            <Input type="number" :min="0" step="0.01" v-bind="componentField" />
          </FormControl>
          <p v-if="values.price" :class="['text-xs', bidInfo.color]">
            {{ bidInfo.message }}
          </p>
          <FormMessage />
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
            When do you estimate you will complete this errand?
          </FormDescription>
          <FormMessage />
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
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="notes">
        <FormItem>
          <FormLabel>Extra Notes</FormLabel>
          <FormControl>
            <Textarea
              placeholder="Any other important notes for the requester."
              :rows="4"
              v-bind="componentField"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <Button type="submit" class="w-full" :disabled="isSubmitting">
        <span v-if="isSubmitting" class="flex items-center">
          <Icon name="mdi:loading" class="animate-spin mr-2" />
          Submitting...
        </span>
        <span v-else>Submit Bid</span>
      </Button>
    </form>
  </div>
</template>
