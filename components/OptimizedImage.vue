<script setup lang="ts">
interface Props {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  sizes?: string;
  placeholder?: string;
  loading?: 'lazy' | 'eager';
  quality?: number;
  format?: 'webp' | 'jpg' | 'png';
  class?: string;
  aspectRatio?: string;
  fallback?: string;
}

const props = withDefaults(defineProps<Props>(), {
  loading: 'lazy',
  quality: 80,
  format: 'webp',
  sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  aspectRatio: 'auto'
});

const { isIntersecting, target } = useLazyLoading(0.1);
const imageRef = ref<HTMLElement>();
const isLoaded = ref(false);
const hasError = ref(false);

// Use intersection observer ref
watchEffect(() => {
  if (imageRef.value) {
    target.value = imageRef.value;
  }
});

// Determine if image should load
const shouldLoad = computed(() => {
  return props.loading === 'eager' || isIntersecting.value;
});

// Generate srcset for responsive images
const optimizedSrcSet = computed(() => {
  if (!props.src || !shouldLoad.value) return '';
  
  const widths = [320, 640, 768, 1024, 1280, 1600];
  return widths
    .map(width => {
      const url = getOptimizedImageUrl(props.src, width, undefined, props.format);
      return `${url} ${width}w`;
    })
    .join(', ');
});

// Main image source
const optimizedSrc = computed(() => {
  if (!props.src || !shouldLoad.value) return '';
  return getOptimizedImageUrl(props.src, props.width, props.height, props.format);
});

// Handle image load
const handleLoad = () => {
  isLoaded.value = true;
};

// Handle image error
const handleError = () => {
  hasError.value = true;
  console.warn(`Failed to load image: ${props.src}`);
};

// Placeholder styles
const placeholderStyle = computed(() => ({
  aspectRatio: props.aspectRatio,
  backgroundColor: '#f3f4f6',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}));
</script>

<template>
  <div
    ref="imageRef"
    :class="[
      'relative overflow-hidden',
      props.class
    ]"
    :style="{ aspectRatio: aspectRatio }"
  >
    <!-- Placeholder -->
    <div
      v-if="!isLoaded && !hasError"
      :style="placeholderStyle"
      class="absolute inset-0 animate-pulse"
    >
      <Icon 
        v-if="!shouldLoad" 
        name="mdi:image-outline" 
        class="h-8 w-8 text-muted-foreground" 
      />
      <div 
        v-else-if="!isLoaded"
        class="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"
      />
    </div>

    <!-- Main Image -->
    <NuxtImg
      v-if="shouldLoad && !hasError"
      :src="optimizedSrc"
      :alt="alt"
      :width="width"
      :height="height"
      :sizes="sizes"
      :loading="loading"
      :quality="quality"
      :format="format"
      :class="[
        'transition-opacity duration-300',
        isLoaded ? 'opacity-100' : 'opacity-0'
      ]"
      @load="handleLoad"
      @error="handleError"
    />

    <!-- Error Fallback -->
    <div
      v-if="hasError"
      :style="placeholderStyle"
      class="absolute inset-0 bg-muted text-muted-foreground"
    >
      <div class="text-center">
        <Icon name="mdi:image-broken" class="h-8 w-8 mx-auto mb-2" />
        <p class="text-xs">Failed to load image</p>
      </div>
    </div>

    <!-- Loading Overlay -->
    <div
      v-if="shouldLoad && !isLoaded && !hasError"
      class="absolute inset-0 bg-muted/50 backdrop-blur-sm flex items-center justify-center"
    >
      <div class="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  </div>
</template>

<style scoped>
img {
  object-fit: cover;
  width: 100%;
  height: 100%;
}
</style>
