<script setup lang="ts" generic="T">
interface Props {
  items: T[];
  itemHeight: number;
  containerHeight?: number;
  overscan?: number;
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  containerHeight: 400,
  overscan: 5
});

const emit = defineEmits<{
  scroll: [scrollTop: number];
}>();

const containerRef = ref<HTMLElement>();
const scrollTop = ref(0);

// Calculate visible range with overscan
const visibleRange = computed(() => {
  const start = Math.floor(scrollTop.value / props.itemHeight);
  const visibleCount = Math.ceil(props.containerHeight / props.itemHeight);
  
  const startIndex = Math.max(0, start - props.overscan);
  const endIndex = Math.min(
    props.items.length,
    start + visibleCount + props.overscan
  );
  
  return { startIndex, endIndex };
});

// Get visible items
const visibleItems = computed(() => {
  const { startIndex, endIndex } = visibleRange.value;
  return props.items.slice(startIndex, endIndex).map((item, index) => ({
    item,
    index: startIndex + index,
    offsetY: (startIndex + index) * props.itemHeight
  }));
});

// Total height of all items
const totalHeight = computed(() => props.items.length * props.itemHeight);

// Handle scroll events
const handleScroll = throttle((event: Event) => {
  const target = event.target as HTMLElement;
  scrollTop.value = target.scrollTop;
  emit('scroll', target.scrollTop);
}, 16); // ~60fps

// Scroll to specific index
const scrollToIndex = (index: number, behavior: ScrollBehavior = 'smooth') => {
  if (containerRef.value) {
    const targetScrollTop = index * props.itemHeight;
    containerRef.value.scrollTo({
      top: targetScrollTop,
      behavior
    });
  }
};

// Scroll to top
const scrollToTop = (behavior: ScrollBehavior = 'smooth') => {
  scrollToIndex(0, behavior);
};

// Expose methods
defineExpose({
  scrollToIndex,
  scrollToTop,
  scrollTop: readonly(scrollTop)
});
</script>

<template>
  <div
    ref="containerRef"
    :class="[
      'relative overflow-auto',
      props.class
    ]"
    :style="{ height: `${containerHeight}px` }"
    @scroll="handleScroll"
  >
    <!-- Virtual spacer for total height -->
    <div :style="{ height: `${totalHeight}px`, position: 'relative' }">
      <!-- Visible items -->
      <div
        v-for="{ item, index, offsetY } in visibleItems"
        :key="index"
        :style="{
          position: 'absolute',
          top: `${offsetY}px`,
          left: 0,
          right: 0,
          height: `${itemHeight}px`
        }"
        class="flex items-center"
      >
        <slot 
          :item="item" 
          :index="index"
          :is-visible="true"
        />
      </div>
    </div>

    <!-- Loading indicator for empty state -->
    <div
      v-if="items.length === 0"
      class="absolute inset-0 flex items-center justify-center text-muted-foreground"
    >
      <slot name="empty">
        <div class="text-center">
          <Icon name="mdi:inbox-outline" class="h-12 w-12 mx-auto mb-2" />
          <p>No items to display</p>
        </div>
      </slot>
    </div>

    <!-- Scroll to top button -->
    <Transition
      enter-active-class="transition-all duration-300"
      enter-from-class="opacity-0 scale-75"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition-all duration-200"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-75"
    >
      <Button
        v-if="scrollTop > containerHeight"
        variant="secondary"
        size="icon"
        class="absolute bottom-4 right-4 shadow-lg"
        @click="scrollToTop()"
      >
        <Icon name="mdi:arrow-up" class="h-4 w-4" />
      </Button>
    </Transition>
  </div>
</template>

<style scoped>
/* Custom scrollbar styling */
.relative::-webkit-scrollbar {
  width: 8px;
}

.relative::-webkit-scrollbar-track {
  background: hsl(var(--muted));
  border-radius: 4px;
}

.relative::-webkit-scrollbar-thumb {
  background: hsl(var(--muted-foreground) / 0.3);
  border-radius: 4px;
}

.relative::-webkit-scrollbar-thumb:hover {
  background: hsl(var(--muted-foreground) / 0.5);
}
</style>
