<script setup lang="ts">
import { ref, watch } from "vue";
import { toast } from "vue-sonner";
import type { NotificationSettings } from "@prisma/client";
import type { ApiResponse } from "~/types";
import { buttonVariants } from "~/components/ui/button";

definePageMeta({ layout: "dashboard" });

const {
  data: settingsResponse,
  pending,
  refresh,
} = await useApiFetch<ApiResponse<NotificationSettings>>("/api/users/settings");

const settings = ref<Partial<NotificationSettings>>({});
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

const saveSettings = async () => {
  isSaving.value = true;
  try {
    await useApiRequest("/api/users/settings", {
      method: "PUT",
      body: settings.value,
    });
    toast.success("Settings updated successfully!");
    refresh();
  } catch (error: any) {
    toast.error(error.data?.message || "Failed to save settings.");
  } finally {
    isSaving.value = false;
  }
};

const settingItems = computed(() => [
  {
    key: "emailNotifications",
    label: "Email Notifications",
    description: "Receive important notifications via email.",
  },
  {
    key: "pushNotifications",
    label: "Push Notifications",
    description: "Get real-time alerts on your device (coming soon).",
    disabled: true,
  },
  {
    key: "newBidAlert",
    label: "New Bid Alerts",
    description: "Notify me when a new bid is placed on my errand.",
  },
  {
    key: "messageAlert",
    label: "New Message Alerts",
    description: "Notify me when I receive a new message.",
  },
  {
    key: "errandUpdateAlert",
    label: "Errand Status Updates",
    description: "Get alerts for changes in your errand status.",
  },
  {
    key: "paymentAlert",
    label: "Payment Notifications",
    description: "Receive alerts for payments and payouts.",
  },
  {
    key: "marketingCommunications",
    label: "Promotions & Updates",
    description: "Receive marketing news and special offers from Mashughuli.",
  },
]);
</script>

<template>
  <div class="space-y-8">
    <h2 class="text-3xl font-bold tracking-tight">Settings</h2>

    <Tabs default-value="profile" class="w-full">
      <TabsList class="grid w-full grid-cols-2">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
      </TabsList>

      <TabsContent value="profile" class="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
            <CardDescription
              >Manage your public profile and account details.</CardDescription
            >
          </CardHeader>
          <CardContent>
            <p>
              Profile editing has been moved to its own page for a better
              experience.
            </p>
          </CardContent>
          <CardFooter>
            <NuxtLink
              :to="'/dashboard/profile/edit'"
              :class="buttonVariants({ variant: 'default' })"
            >
              Go to Edit Profile
            </NuxtLink>
          </CardFooter>
        </Card>
      </TabsContent>

      <TabsContent value="notifications" class="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription
              >Choose how you want to be notified.</CardDescription
            >
          </CardHeader>
          <CardContent class="space-y-6">
            <div v-if="pending" class="flex justify-center py-8">
              <Icon name="mdi:loading" class="h-8 w-8 animate-spin" />
            </div>
            <template v-else>
              <div
                v-for="item in settingItems"
                :key="item.key"
                class="flex items-center justify-between p-3 rounded-lg border"
              >
                <div class="space-y-0.5">
                  <Label :for="item.key" class="text-base">{{
                    item.label
                  }}</Label>
                  <p class="text-sm text-muted-foreground">
                    {{ item.description }}
                  </p>
                </div>
                <Switch
                  :id="item.key"
                  :disabled="item.disabled"
                  v-model:checked="
                    settings[item.key as keyof NotificationSettings]
                  "
                />
              </div>
            </template>
          </CardContent>
          <CardFooter>
            <Button @click="saveSettings" :disabled="isSaving">
              <Icon
                v-if="isSaving"
                name="mdi:loading"
                class="animate-spin mr-2"
              />
              Save Changes
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  </div>
</template>
