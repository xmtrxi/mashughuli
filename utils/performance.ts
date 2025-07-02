// Performance optimization utilities

// Debounce function for search inputs
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// Throttle function for scroll events
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Lazy loading intersection observer
export function useLazyLoading(threshold = 0.1) {
  const isIntersecting = ref(false);
  const target = ref<HTMLElement>();

  let observer: IntersectionObserver;

  onMounted(() => {
    observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          isIntersecting.value = true;
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (target.value) {
      observer.observe(target.value);
    }
  });

  onUnmounted(() => {
    if (observer) {
      observer.disconnect();
    }
  });

  return { isIntersecting, target };
}

// Format currency with caching
const currencyFormatters = new Map<string, Intl.NumberFormat>();

export function formatCurrency(amount: number, currency = 'KES'): string {
  if (!currencyFormatters.has(currency)) {
    currencyFormatters.set(
      currency,
      new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      })
    );
  }
  
  return currencyFormatters.get(currency)!.format(amount);
}

// Format relative time with caching
const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const target = new Date(date);
  const diffInSeconds = Math.floor((target.getTime() - now.getTime()) / 1000);
  
  const units: [string, number][] = [
    ['year', 31536000],
    ['month', 2592000],
    ['week', 604800],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
    ['second', 1]
  ];
  
  for (const [unit, secondsInUnit] of units) {
    if (Math.abs(diffInSeconds) >= secondsInUnit) {
      const value = Math.floor(diffInSeconds / secondsInUnit);
      return rtf.format(value, unit as Intl.RelativeTimeFormatUnit);
    }
  }
  
  return 'just now';
}

// Image optimization helper
export function getOptimizedImageUrl(
  src: string,
  width?: number,
  height?: number,
  format?: 'webp' | 'jpg' | 'png'
): string {
  if (!src) return '';
  
  // If using Nuxt Image, construct optimized URL
  const params = new URLSearchParams();
  if (width) params.append('w', width.toString());
  if (height) params.append('h', height.toString());
  if (format) params.append('f', format);
  
  const query = params.toString();
  return query ? `${src}?${query}` : src;
}

// Virtual scrolling helper for large lists
export function useVirtualScrolling<T>(
  items: Ref<T[]>,
  itemHeight: number,
  containerHeight: number
) {
  const scrollTop = ref(0);
  const startIndex = computed(() => Math.floor(scrollTop.value / itemHeight));
  const endIndex = computed(() => 
    Math.min(
      startIndex.value + Math.ceil(containerHeight / itemHeight) + 1,
      items.value.length
    )
  );
  
  const visibleItems = computed(() => 
    items.value.slice(startIndex.value, endIndex.value)
  );
  
  const totalHeight = computed(() => items.value.length * itemHeight);
  const offsetY = computed(() => startIndex.value * itemHeight);
  
  return {
    visibleItems,
    totalHeight,
    offsetY,
    scrollTop
  };
}

// Preload route data
export function preloadRoute(to: string) {
  if (process.client) {
    const router = useRouter();
    router.prefetch(to);
  }
}

// Memory efficient cache with LRU eviction
class LRUCache<K, V> {
  private cache = new Map<K, V>();
  private maxSize: number;

  constructor(maxSize = 100) {
    this.maxSize = maxSize;
  }

  get(key: K): V | undefined {
    if (this.cache.has(key)) {
      // Move to end (most recently used)
      const value = this.cache.get(key)!;
      this.cache.delete(key);
      this.cache.set(key, value);
      return value;
    }
    return undefined;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // Remove least recently used item
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  clear(): void {
    this.cache.clear();
  }
}

export const apiCache = new LRUCache<string, any>(50);

// Optimized API fetching with caching
export async function fetchWithCache<T>(
  url: string,
  options: any = {},
  ttl = 5 * 60 * 1000 // 5 minutes
): Promise<T> {
  const cacheKey = `${url}:${JSON.stringify(options)}`;
  const cached = apiCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data;
  }
  
  try {
    const data = await $fetch<T>(url, options);
    apiCache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  } catch (error) {
    // Return cached data if available, even if expired
    if (cached) {
      return cached.data;
    }
    throw error;
  }
}
