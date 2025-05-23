<script setup lang="ts">
import { computed } from "vue";

import { StarIcon } from "lucide-vue-next";
import type { Prisma } from "@prisma/client";

type BidWithRunner = Prisma.BidGetPayload<{ include: { runner: true } }>;

// Props definition
const props = defineProps<{
  bid: BidWithRunner;
  isRequester?: boolean;
}>();

// Emits definition
const emit = defineEmits<{
  (e: "accept-bid", bidId: string): void;
  (e: "reject-bid", bidId: string): void;
}>();

// Router
const router = useRouter();

// Utility functions
const formatRating = (rating: number) => {
  return rating.toFixed(1);
};

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount);
};

// Computed properties
const bidStatusVariant = computed(() => {
  switch (props.bid.status) {
    case "accepted":
      return "default";
    case "rejected":
      return "destructive";
    default:
      return "outline";
  }
});

// Event handlers
const handleAcceptBid = () => {
  console.log("Accepting bid:", props.bid.id);
  emit("accept-bid", props.bid.id);
  router.push(
    `/dashboard/errands/${props.bid.errandId}/bids/${props.bid.id}/accept`,
  );
};

const handleRejectBid = () => {
  console.log("Rejecting bid:", props.bid.id);
  emit("reject-bid", props.bid.id);
};

const handleContactBidder = () => {
  router.push(`/messages/${props.bid.runnerId}`);
};

// Computed for completed errands text
const completedErrandsText = computed(() => {
  return `1 completed`;
});
</script>

<template>
  <Card>
    <CardHeader class="flex flex-row items-start gap-4 pb-2">
      <Avatar class="h-12 w-12">
        <AvatarImage
          v-if="bid.runner.avatarUrl"
          :src="bid.runner.avatarUrl"
          :alt="bid.runner.fullName"
        />
        <AvatarFallback v-else>
          {{ bid.runner.fullName.charAt(0).toUpperCase() }}
        </AvatarFallback>
      </Avatar>

      <div class="flex-1">
        <div class="flex items-center justify-between">
          <CardTitle class="text-base">{{ bid.runner.fullName }}</CardTitle>
          <Badge :variant="bidStatusVariant">
            {{ bid.status.charAt(0).toUpperCase() + bid.status.slice(1) }}
          </Badge>
        </div>

        <div class="flex items-center mt-1">
          <StarIcon class="h-4 w-4 text-yellow-500 mr-1" />
          <span class="text-sm font-medium mr-2">
            {{ formatRating(1) }}
          </span>
          <span class="text-sm text-muted-foreground">
            {{ completedErrandsText }}
          </span>
        </div>

        <CardDescription class="mt-1 text-xs">
          Bid placed on {{ new Date(bid.createdAt).toLocaleDateString() }}
        </CardDescription>
      </div>
    </CardHeader>

    <CardContent class="pb-2">
      <div class="grid grid-cols-2 gap-4 mb-3">
        <div>
          <p class="text-sm font-medium">Bid Amount</p>
          <p class="text-base">
            {{ formatCurrency(parseFloat(bid.price.toString()), "Kes") }}
          </p>
        </div>
        <div>
          <p class="text-sm font-medium">Estimated Time</p>
          <p class="text-base">
            {{
              `${new Date(bid.estimatedCompletionTime ?? "").toDateString()} - ${new Date(bid.estimatedCompletionTime ?? "").toLocaleTimeString()}`
            }}
          </p>
        </div>
      </div>

      <div>
        <p class="text-sm font-medium mb-1">Message</p>
        <p class="text-sm text-muted-foreground">{{ bid.experienceDetails }}</p>
      </div>
      <div>
        <p class="text-sm font-medium mb-1">Notes</p>
        <p class="text-sm text-muted-foreground">{{ bid.notes }}</p>
      </div>
    </CardContent>

    <CardFooter class="pt-2">
      <template v-if="isRequester && bid.status === 'pending'">
        <div class="flex gap-2 w-full">
          <Button
            variant="default"
            size="sm"
            class="flex-1"
            @click="handleAcceptBid"
          >
            Accept
          </Button>
          <Button
            variant="outline"
            size="sm"
            class="flex-1"
            @click="handleRejectBid"
          >
            Reject
          </Button>
        </div>
      </template>
      <template v-else>
        <Button
          variant="outline"
          size="sm"
          class="w-full"
          @click="handleContactBidder"
        >
          Contact {{ isRequester ? "Bidder" : "Requester" }}
        </Button>
      </template>
    </CardFooter>
  </Card>
</template>
