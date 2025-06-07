<script setup lang="ts">
import type { ErrandWithRelationships } from "~/types";
import { toast } from "vue-sonner";

const props = defineProps<{
  errand: ErrandWithRelationships;
  showBidForm: boolean;
}>();

const router = useRouter();

const priorityColors = {
  low: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-red-100 text-red-800",
  urgent: "bg-orange-100 text-orange-800",
};

const statusColors = {
  draft: "bg-gray-100 text-gray-800",
  open: "bg-blue-100 text-blue-800",
  in_progress: "bg-purple-100 text-purple-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-gray-100 text-gray-800",
  disputed: "bg-red-100 text-red-800",
};

const authStore = useAuthStore();
const disputeReason = ref("");
const disputeDetails = ref("");
const isFilingDispute = ref(false);

const isPartyToErrand = computed(() => {
  if (!authStore.user) return false;
  return (
    authStore.user.id === props.errand.requesterId ||
    authStore.user.id === props.errand.runnerId
  );
});

const canFileDispute = computed(() => {
  return (
    isPartyToErrand.value &&
    (props.errand.status === "in_progress" ||
      props.errand.status === "completed")
  );
});

const isRequester = computed(() => {
  if (!authStore.user) {
    return false;
  }
  return authStore.user.id === props.errand.requesterId;
});

const formattedBudget = `${formatCurrency(
  parseFloat(props.errand.budgetMin?.toString() ?? "0"),
  "Kes",
)} - ${formatCurrency(
  parseFloat(props.errand.budgetMax?.toString() ?? "0"),
  "Kes",
)}`;

function getConversationPartnerId() {
  if (!authStore.user) return null;
  if (isRequester.value) {
    return props.errand.runnerId; // Message the runner
  }
  return props.errand.requesterId; // Message the requester
}

function handleMessage() {
  const partnerId = getConversationPartnerId();
  if (!partnerId) {
    toast.info("A runner must be assigned before you can message.");
    return;
  }
  const conversationId = `${props.errand.id}:${[authStore.user!.id, partnerId].sort().join(":")}`;
  router.push(`/dashboard/messages/${conversationId}`);
}

async function handleFileDispute() {
  if (!disputeReason.value || !disputeDetails.value) {
    toast.error("Please provide a reason and details for the dispute.");
    return;
  }
  isFilingDispute.value = true;
  try {
    await useApiRequest("/api/disputes", {
      method: "POST",
      body: {
        errandId: props.errand.id,
        reason: disputeReason.value,
        details: disputeDetails.value,
      },
    });
    toast.success(
      "Dispute filed successfully. Our team will review it shortly.",
    );
    // Optionally refresh the errand data
  } catch (error: any) {
    toast.error(error.data?.message || "Failed to file dispute.");
  } finally {
    isFilingDispute.value = false;
  }
}
</script>
<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex items-center mb-6">
      <NuxtLink
        :to="isRequester ? '/dashboard/errands' : '/errands'"
        class="flex items-center text-muted-foreground hover:text-foreground"
      >
        <Icon name="mdi:arrow-left" class="h-4 w-4 mr-1" />
        Back to Errands
      </NuxtLink>
    </div>

    <div class="mb-6">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <h1 class="text-3xl font-bold">{{ errand.title }}</h1>
        <div class="flex gap-2">
          <Badge :class="statusColors[errand.status]">
            {{
              errand.status.charAt(0).toUpperCase() +
              errand.status.slice(1).replace("_", " ")
            }}
          </Badge>
          <Badge :class="priorityColors[errand.priority]">
            {{
              errand.priority.charAt(0).toUpperCase() + errand.priority.slice(1)
            }}
            Priority
          </Badge>
        </div>
      </div>
      <div class="flex flex-wrap gap-4 mt-4 text-sm">
        <div class="flex items-center gap-1 text-muted-foreground">
          <Icon name="mdi:calendar" class="h-4 w-4" />
          <span
            >Posted on
            {{ new Date(errand.createdAt).toLocaleDateString() }}</span
          >
        </div>
        <div class="flex items-center gap-1 text-muted-foreground">
          <Icon name="mdi:clock" class="h-4 w-4" />
          <span
            >Due by
            {{ new Date(errand.deadline ?? "").toLocaleDateString() }}</span
          >
        </div>
        <div class="flex items-center gap-1 text-muted-foreground">
          <Icon name="mdi:map-marker" class="h-4 w-4" />
          <span>{{ errand.customLocation }}</span>
        </div>
        <div class="flex items-center gap-1 text-muted-foreground">
          <Icon name="mdi:flag" class="h-4 w-4" />
          <span>{{ errand.category.name }}</span>
        </div>
        <div class="flex items-center gap-1">
          <Icon name="mdi:dollar" class="h-4 w-4" />
          <span class="font-medium">{{ formattedBudget }}</span>
        </div>
      </div>
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2">
        <Card>
          <CardContent class="pt-6">
            <Tabs default-value="details">
              <TabsList class="grid w-full grid-cols-3">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger
                  v-if="isRequester"
                  value="bids"
                  class="flex items-center gap-1"
                >
                  Bids
                  <span
                    class="inline-flex items-center justify-center w-5 h-5 text-xs bg-muted rounded-full"
                  >
                    {{ errand.bids.length }}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="actions">Actions</TabsTrigger>
              </TabsList>
              <TabsContent value="details" class="mt-4 space-y-6">
                <div>
                  <h3 class="text-lg font-medium mb-2">Description</h3>
                  <p class="text-muted-foreground whitespace-pre-line">
                    {{ errand.description }}
                  </p>
                </div>
                <div>
                  <h3 class="text-lg font-medium mb-2">About Requester</h3>
                  <div class="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage
                        v-if="errand.requester.avatarUrl"
                        :src="errand.requester.avatarUrl"
                        :alt="errand.requester.fullName"
                      />
                      <AvatarFallback>{{
                        errand.requester.fullName.charAt(0).toUpperCase()
                      }}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div class="font-medium">
                        {{ errand.requester.fullName }}
                      </div>
                      <div
                        class="flex items-center text-sm text-muted-foreground"
                      >
                        <span class="flex items-center">
                          <Icon
                            v-for="i in 5"
                            :key="i"
                            name="mdi:star"
                            :class="i < 4 ? 'text-yellow-400' : 'text-gray-300'"
                          />
                          <span class="ml-1">4.0</span>
                        </span>
                        <span class="mx-2">·</span>
                        <span>4 Errands Posted</span>
                      </div>
                    </div>
                  </div>
                  <div class="mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      @click="handleMessage"
                      v-if="isPartyToErrand && errand.runnerId"
                    >
                      <Icon
                        name="mdi:message-text-outline"
                        class="mr-2 h-4 w-4"
                      />
                      Message {{ isRequester ? "Runner" : "Requester" }}
                    </Button>
                  </div>
                </div>
              </TabsContent>
              <TabsContent
                v-if="isRequester"
                value="bids"
                :class="`mt-4 space-y-4`"
              >
                <p
                  v-if="!errand.bids.length"
                  class="text-muted-foreground text-center py-4"
                >
                  No bids have been placed on this errand yet.
                </p>
                <ErrandsBidderCard
                  v-for="bid in errand.bids"
                  :key="bid.id"
                  :bid="bid"
                  :is-requester="isRequester"
                />
              </TabsContent>
              <TabsContent value="actions" class="mt-4">
                <h3 class="text-lg font-semibold mb-4">Errand Actions</h3>
                <div v-if="canFileDispute">
                  <Dialog>
                    <DialogTrigger as-child>
                      <Button variant="destructive">
                        <Icon name="mdi:gavel" class="mr-2" />
                        File a Dispute
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle
                          >File a Dispute for: {{ errand.title }}</DialogTitle
                        >
                        <DialogDescription>
                          If you have an issue with this errand that you cannot
                          resolve with the other party, please describe it
                          below. Our support team will mediate.
                        </DialogDescription>
                      </DialogHeader>
                      <div class="py-4 space-y-4">
                        <div>
                          <Label for="dispute-reason">Reason for Dispute</Label>
                          <Input
                            id="dispute-reason"
                            v-model="disputeReason"
                            placeholder="e.g., Item not delivered, Task incomplete"
                          />
                        </div>
                        <div>
                          <Label for="dispute-details">Details</Label>
                          <Textarea
                            id="dispute-details"
                            v-model="disputeDetails"
                            placeholder="Please provide a detailed explanation of the issue."
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <DialogClose as-child>
                          <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button
                          @click="handleFileDispute"
                          :disabled="isFilingDispute"
                        >
                          <Icon
                            v-if="isFilingDispute"
                            name="mdi:loading"
                            class="animate-spin mr-2"
                          />
                          Submit Dispute
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                <p v-else class="text-muted-foreground">
                  No actions are available at this stage.
                </p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      <div v-if="showBidForm && !isRequester">
        <ErrandsBiddingForm
          :errand-id="errand.id"
          :max-budget="parseFloat(errand.budgetMax?.toString() ?? '0')"
          :min-budget="parseFloat(errand.budgetMin?.toString() ?? '0')"
          currency="KES"
        />
      </div>
    </div>
  </div>
</template>
