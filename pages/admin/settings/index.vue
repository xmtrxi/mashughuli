<script setup lang="ts">
import { toast } from "vue-sonner";
import type { ApiResponse } from "~/types";

definePageMeta({ layout: "admin" });

const {
  data: settingsResponse,
  pending,
  refresh,
} = await useApiFetch<ApiResponse<Record<string, string>>>(
  "/api/admin/settings",
);

const settings = ref<Record<string, string>>({});
const isSaving = ref(false);

watch(
  settingsResponse,
  (newVal) => {
    if (newVal?.data) {
      settings.value = { ...newVal.data };
    }
  },
  { immediate: true },
);

async function saveSettings() {
  isSaving.value = true;
  try {
    await useApiRequest("/api/admin/settings", {
      method: "PUT",
      body: settings.value,
    });
    toast.success("System settings have been updated.");
    refresh();
  } catch (error: any) {
    toast.error(error.data?.message || "Failed to save settings.");
  } finally {
    isSaving.value = false;
  }
}
</script>

<template>
  <div class="space-y-8">
    <h2 class="text-3xl font-bold tracking-tight">System Settings</h2>

    <Card>
      <CardHeader>
        <CardTitle>Platform Configuration</CardTitle>
        <CardDescription>
          Adjust core platform parameters. Changes will take effect immediately.
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <div v-if="pending" class="text-center py-8">
          <Icon name="mdi:loading" class="h-8 w-8 animate-spin" />
        </div>
        <div v-else class="space-y-4">
          <div class="space-y-2">
            <Label for="platformFee">Platform Fee (%)</Label>
            <Input
              id="platformFee"
              type="number"
              v-model="settings.platformFee"
              placeholder="e.g., 10"
            />
            <p class="text-sm text-muted-foreground">
              The percentage fee charged on each completed errand. Enter a
              number like 10 for 10%.
            </p>
          </div>

          <div class="space-y-2">
            <Label for="minPayout">Minimum Payout Amount (KES)</Label>
            <Input
              id="minPayout"
              type="number"
              v-model="settings.minPayout"
              placeholder="e.g., 500"
            />
            <p class="text-sm text-muted-foreground">
              The minimum balance a runner must have to request a payout.
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button @click="saveSettings" :disabled="isSaving || pending">
          <Icon v-if="isSaving" name="mdi:loading" class="animate-spin mr-2" />
          Save Settings
        </Button>
      </CardFooter>
    </Card>
  </div>
</template>
