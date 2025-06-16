<script setup lang="ts" generic="T">
import { computed } from "vue";
import {
  VisAxis,
  VisCrosshair,
  VisLine,
  VisTooltip,
  VisXYContainer,
} from "@unovis/vue";

const props = defineProps<{
  data: T[];
  x: (d: T, i: number) => number | Date | string;
  y: (d: T, i: number) => number;
  title?: string;
  colors?: {
    line: string;
    area?: string;
  };
}>();

// A unique ID for the gradient definition for this specific chart instance
const gradientId = `area-gradient-${Math.random().toString(36).substring(2, 9)}`;

const chartColors = computed(() => {
  return {
    line: props.colors?.line ?? "hsl(var(--primary))",
    area: props.colors?.area ?? props.colors?.line ?? "hsl(var(--primary))",
  };
});
</script>

<template>
  <VisXYContainer
    :data="data"
    class="h-full w-full"
    :style="{ '--vis-area-color': chartColors.area } as any"
  >
    <VisLine :x="x" :y="y" :color="chartColors.line" />
    <VisAxis type="x" :tick-format="(val: any) => val" :grid-line="false" />
    <VisAxis type="y" :grid-line="true" />
    <VisTooltip />
    <VisCrosshair :color="chartColors.line" />

    <defs>
      <linearGradient :id="gradientId" x1="0" y1="0" x2="0" y2="1">
        <stop
          offset="0%"
          stop-color="var(--vis-area-color)"
          stop-opacity="0.2"
        />
        <stop
          offset="100%"
          stop-color="var(--vis-area-color)"
          stop-opacity="0"
        />
      </linearGradient>
    </defs>
  </VisXYContainer>
</template>
