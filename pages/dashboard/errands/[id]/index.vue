<script setup lang="ts">
import type { ApiResponse, ErrandWithRelationships } from "~/types";
import { toast } from "vue-sonner";

const route = useRoute();
const authStore = useAuthStore();
const { data, pending, error, refresh } = await useApiFetch<
  ApiResponse<ErrandWithRelationships>
>(`/api/errands/${route.params.id}`);
const errand = computed(() => data.value?.data);

const isRunner = computed(() => authStore.user?.id === errand.value?.runnerId);
const canComplete = computed(
  () => isRunner.value && errand.value?.status === "in_progress",
);

const isRequester = computed(
  () => authStore.user?.id === errand.value?.requesterId,
);
const canApprove = computed(
  () => isRequester.value && errand.value?.status === "in_progress",
);

const isApproving = ref(false);
const completionFiles = ref<File[]>([]);
const isSubmittingCompletion = ref(false);

function onFileSelect(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    completionFiles.value = Array.from(target.files);
  }
}

async function submitCompletion() {
  if (completionFiles.value.length === 0) {
    toast.error("Please upload at least one file as proof of completion.");
    return;
  }

  isSubmittingCompletion.value = true;
  const formData = new FormData();
  completionFiles.value.forEach((file) => {
    formData.append("files", file);
  });

  try {
    await useApiRequest(`/api/errands/${errand.value!.id}/complete`, {
      method: "POST",
      body: formData,
    });
    toast.success(
      "Completion evidence submitted! Awaiting requester approval.",
    );
    refresh(); // Refresh errand data
  } catch (err: any) {
    toast.error(err.data?.message || "Failed to submit completion.");
  } finally {
    isSubmittingCompletion.value = false;
  }
}

async function approveCompletion() {
  isApproving.value = true;
  try {
    await useApiRequest(`/api/errands/${errand.value!.id}/approve`, {
      method: "POST",
    });
    toast.success("Errand approved and runner payout initiated!");
    refresh();
  } catch (err: any) {
    toast.error(err.data?.message || "Failed to approve errand.");
  } finally {
    isApproving.value = false;
  }
}
</script>
<template>
  <div v-if="pending">Loading...</div>
  <div v-else-if="error || !errand">Errand not found.</div>
  <div v-else class="space-y-6">
    <ErrandsErrandViewer :errand="errand" :show-bid-form="false" />

    <!-- Runner's Action Panel -->
    <Card v-if="canComplete">
      <CardHeader>
        <CardTitle>Mark as Complete</CardTitle>
        <CardDescription
          >Upload evidence that you have completed the errand. The requester
          will review and approve to release your payment.</CardDescription
        >
      </CardHeader>
      <CardContent class="space-y-4">
        <div>
          <Label for="completion-files"
            >Proof of Completion (Images, PDFs)</Label
          >
          <Input
            id="completion-files"
            type="file"
            multiple
            @change="onFileSelect"
          />
        </div>
        <div v-if="completionFiles.length > 0" class="space-y-2">
          <p class="text-sm font-medium">Selected files:</p>
          <ul class="list-disc list-inside text-sm text-muted-foreground">
            <li v-for="file in completionFiles" :key="file.name">
              {{ file.name }}
            </li>
          </ul>
        </div>
      </CardContent>
      <CardFooter>
        <Button @click="submitCompletion" :disabled="isSubmittingCompletion">
          <Icon
            v-if="isSubmittingCompletion"
            name="mdi:loading"
            class="animate-spin mr-2"
          />
          Submit for Approval
        </Button>
      </CardFooter>
    </Card>

    <!-- Requester's Action Panel -->
    <Card v-if="canApprove">
      <CardHeader>
        <CardTitle>Approve Completion</CardTitle>
        <CardDescription
          >The runner has marked this errand as complete. Please review the
          evidence and approve to release payment.</CardDescription
        >
      </CardHeader>
      <CardContent>
        <!-- We need to fetch and display the files here -->
        <p class="font-semibold">Completion Evidence:</p>
        <p class="text-muted-foreground">Evidence display coming soon...</p>
      </CardContent>
      <CardFooter>
        <Button @click="approveCompletion" :disabled="isApproving">
          <Icon
            v-if="isApproving"
            name="mdi:loading"
            class="animate-spin mr-2"
          />
          Approve and Release Payment
        </Button>
      </CardFooter>
    </Card>
  </div>
</template>
