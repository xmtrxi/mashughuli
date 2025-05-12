<script setup lang="ts">
import { useForm } from "vee-validate";
import * as z from "zod";
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
import { toast } from "vue-sonner";

// Define the form schema
const formSchema = z.object({
  amount: z.string().refine(
    (val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0;
    },
    { message: "Please enter a valid bid amount" },
  ),
  estimatedTime: z
    .string()
    .min(1, "Please provide an estimated completion time"),
  coverLetter: z
    .string()
    .min(20, "Please provide more details about your bid")
    .max(500, "Keep your message under 500 characters"),
});

// Define props with TypeScript
interface BidFormProps {
  errandId: string;
  minBudget: number;
  maxBudget: number;
  currency: string;
  onBidSubmitted?: () => void;
}

const props = defineProps<BidFormProps>();

// Emits
const emit = defineEmits<{
  (e: "bid-submitted"): void;
}>();

// State
const isSubmitting = ref(false);

// Form validation
const { handleSubmit, defineField, errors, resetForm } = useForm({
  validationSchema: toTypedSchema(formSchema),
  initialValues: {
    amount: props.maxBudget.toString(),
    estimatedTime: "",
    coverLetter: "",
  },
});

// Fields
const [amount, amountProps] = defineField("amount");
const [estimatedTime, estimatedTimeProps] = defineField("estimatedTime");
const [coverLetter, coverLetterProps] = defineField("coverLetter");

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
  const current = parseFloat(amount.value || "0");
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

// Submit handler
const onSubmit = handleSubmit(async (values) => {
  isSubmitting.value = true;
  try {
    const bidAmount = parseFloat(values.amount);

    // This would connect to your API
    console.log("Bid submitted:", {
      errandId: props.errandId,
      ...values,
      amount: bidAmount,
    });

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast.success("Your bid has been submitted!");
    resetForm();

    // Emit event or call callback
    emit("bid-submitted");
    if (props.onBidSubmitted) {
      props.onBidSubmitted();
    }
  } catch (error) {
    console.error("Error submitting bid:", error);
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

    <Form>
      <form @submit.prevent="onSubmit" class="space-y-4">
        <FormField>
          <FormItem>
            <FormLabel>Your Bid Amount ({{ currency }})</FormLabel>
            <FormControl>
              <Input
                type="number"
                :min="0"
                step="0.01"
                v-model="amount"
                v-bind="amountProps"
              />
            </FormControl>
            <p :class="['text-xs', bidInfo.color]">
              {{ bidInfo.message }}
            </p>
            <FormMessage>{{ errors.amount }}</FormMessage>
          </FormItem>
        </FormField>

        <FormField>
          <FormItem>
            <FormLabel>Estimated Completion Time</FormLabel>
            <FormControl>
              <Input
                placeholder="e.g., 3 hours, 2 days"
                v-model="estimatedTime"
                v-bind="estimatedTimeProps"
              />
            </FormControl>
            <FormDescription>
              How long will it take you to complete this errand?
            </FormDescription>
            <FormMessage>{{ errors.estimatedTime }}</FormMessage>
          </FormItem>
        </FormField>

        <FormField>
          <FormItem>
            <FormLabel>Why you're the best person for this errand</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Describe your experience, skills, and why you should be chosen..."
                :rows="4"
                v-model="coverLetter"
                v-bind="coverLetterProps"
              />
            </FormControl>
            <FormDescription>
              Include relevant experience and any questions you have.
            </FormDescription>
            <FormMessage>{{ errors.coverLetter }}</FormMessage>
          </FormItem>
        </FormField>

        <Button type="submit" class="w-full" :disabled="isSubmitting">
          {{ isSubmitting ? "Submitting..." : "Submit Bid" }}
        </Button>
      </form>
    </Form>
  </div>
</template>
