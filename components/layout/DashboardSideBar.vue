<script setup lang="ts">
import { cn } from "~/lib/utils";

type Link = {
  name: string;
  icon: string;
  href: string;
};
const props = defineProps<{
  links: Link[];
  settingsLinks: Link[];
}>();

const authStore = useAuthStore();
const user = computed(() => authStore.user);
</script>
<template>
  <div v-if="user" class="py-6 space-y-6">
    <div class="px-6 flex flex-col items-center text-center space-y-3">
      <Avatar class="w-20 h-20 text-3xl">
        <AvatarImage
          v-if="user.avatarUrl"
          :src="user.avatarUrl"
          :alt="user.fullName"
        />
        <AvatarFallback>
          {{ user.fullName.charAt(0).toUpperCase() }}
        </AvatarFallback>
      </Avatar>
      <div>
        <h3 class="font-medium">{{ user.fullName }}</h3>
        <p class="text-sm text-muted-foreground capitalize">
          {{ user.primaryRole }}
        </p>
      </div>
    </div>

    <Separator />

    <div class="space-y-1 px-3">
      <NuxtLink
        v-for="link in links"
        :key="link.href"
        :to="link.href"
        active-class="bg-primary text-primary-foreground font-medium hover:bg-primary/90 hover:text-primary-foreground"
        :class="
          cn(
            'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors text-muted-foreground hover:text-foreground hover:bg-accent',
          )
        "
      >
        <Icon :name="link.icon" class="h-4 w-4" />
        <span>{{ link.name }}</span>
      </NuxtLink>
    </div>
    <Separator />
    <div class="space-y-1 px-3">
      <NuxtLink
        v-for="link in settingsLinks"
        :key="link.href"
        :to="link.href"
        active-class="bg-primary text-primary-foreground font-medium hover:bg-primary/90 hover:text-primary-foreground"
        :class="
          cn(
            'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors text-muted-foreground hover:text-foreground hover:bg-accent',
          )
        "
      >
        <Icon :name="link.icon" class="h-4 w-4" />
        <span>{{ link.name }}</span>
      </NuxtLink>
    </div>
  </div>
</template>
