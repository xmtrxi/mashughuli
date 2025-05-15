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
</script>
<template>
  <div class="py-6 space-y-6">
    <div class="px-6 flex flex-col items-center text-center space-y-3">
      <div
        class="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center"
      >
        <span class="text-2xl font-medium text-primary-400">JD</span>
      </div>
      <div>
        <h3 class="font-medium">John Doe</h3>
        <p class="text-sm text-muted-foreground capitalize">Runners</p>
      </div>
    </div>

    <Separator />

    <div class="space-y-1 px-3">
      <NuxtLink
        v-for="link in links"
        :key="link.href"
        :to="link.href"
        active-class="bg-primary-100 text-primary-600 font-medium"
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
        active-class="bg-primary-100 text-primary-600 font-medium"
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
