<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from "vue";
import L, { type LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import { toast } from "vue-sonner";

// Props and Emits
const props = withDefaults(
  defineProps<{
    initialPosition?: LatLngExpression;
  }>(),
  {
    initialPosition: () => [-1.286389, 36.817223], // Default to Nairobi
  },
);

const emit = defineEmits<{
  (e: "update:location", value: { lat: number; lng: number }): void;
}>();

// Refs
const mapContainer = ref<HTMLElement | null>(null);
const searchQuery = ref('');
const searchResults = ref<any[]>([]);
const isSearching = ref(false);
const showResults = ref(false);
const selectedLocation = ref<{lat: number, lng: number, display_name: string} | null>(null);
let map: L.Map | null = null;
let marker: L.Marker | null = null;
let searchTimeout: NodeJS.Timeout | null = null;

// Fix for default marker icon in build systems
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Lifecycle Hooks
onMounted(() => {
  if (mapContainer.value && !map) {
    map = L.map(mapContainer.value).setView(props.initialPosition, 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Initialize marker
    marker = L.marker(props.initialPosition, {
      draggable: true,
      icon: defaultIcon,
    }).addTo(map);

    // Event listeners
    marker.on("dragend", (event) => {
      const latlng = event.target.getLatLng();
      emit("update:location", { lat: latlng.lat, lng: latlng.lng });
    });

    map.on("click", (e) => {
      if (marker) {
        marker.setLatLng(e.latlng);
        emit("update:location", { lat: e.latlng.lat, lng: e.latlng.lng });
      }
    });
  }
});

watch(
  () => props.initialPosition,
  (newPos) => {
    if (map && marker) {
      map.setView(newPos, 13);
      marker.setLatLng(newPos);
    }
  },
);

onUnmounted(() => {
  if (map) {
    map.remove();
    map = null;
  }
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
});

// Search functionality
const searchLocation = async (query: string) => {
  if (!query.trim() || query.length < 3) {
    searchResults.value = [];
    showResults.value = false;
    return;
  }

  isSearching.value = true;
  try {
    // Use Nominatim API for location search (free OpenStreetMap service)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=ke&addressdetails=1`
    );
    const data = await response.json();
    
    searchResults.value = data.map((item: any) => ({
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      display_name: item.display_name,
      place_id: item.place_id
    }));
    showResults.value = true;
  } catch (error) {
    console.error('Search error:', error);
    toast.error('Failed to search location. Please try again.');
  } finally {
    isSearching.value = false;
  }
};

// Debounced search
const handleSearchInput = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
  searchTimeout = setTimeout(() => {
    searchLocation(searchQuery.value);
  }, 500);
};

// Select location from search results
const selectLocation = (location: any) => {
  selectedLocation.value = location;
  searchQuery.value = location.display_name;
  showResults.value = false;
  
  if (map && marker) {
    const latLng = L.latLng(location.lat, location.lng);
    map.setView(latLng, 15);
    marker.setLatLng(latLng);
    emit("update:location", { lat: location.lat, lng: location.lng });
  }
};

// Get current location
const getCurrentLocation = () => {
  if (navigator.geolocation) {
    isSearching.value = true;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        if (map && marker) {
          const latLng = L.latLng(lat, lng);
          map.setView(latLng, 15);
          marker.setLatLng(latLng);
          emit("update:location", { lat, lng });
        }
        
        // Reverse geocode to get address
        reverseGeocode(lat, lng);
        isSearching.value = false;
        toast.success('Location found!');
      },
      (error) => {
        console.error('Geolocation error:', error);
        toast.error('Could not get your location. Please enable location services.');
        isSearching.value = false;
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  } else {
    toast.error('Geolocation is not supported by this browser.');
  }
};

// Reverse geocode to get address from coordinates
const reverseGeocode = async (lat: number, lng: number) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
    );
    const data = await response.json();
    if (data.display_name) {
      searchQuery.value = data.display_name;
    }
  } catch (error) {
    console.error('Reverse geocoding error:', error);
  }
};

// Clear search
const clearSearch = () => {
  searchQuery.value = '';
  searchResults.value = [];
  showResults.value = false;
  selectedLocation.value = null;
};
</script>

<template>
  <div class="w-full space-y-4">
    <!-- Search Box -->
    <div class="relative">
      <div class="flex gap-2">
        <div class="relative flex-1">
          <Input
            v-model="searchQuery"
            @input="handleSearchInput"
            type="text"
            placeholder="Search for a location... (e.g., Westlands, Nairobi)"
            class="w-full"
          />
          <Icon
            v-if="isSearching"
            name="mdi:loading"
            class="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground"
          />
          <Button
            v-else-if="searchQuery"
            variant="ghost"
            size="sm"
            @click="clearSearch"
            class="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
          >
            <Icon name="mdi:close" class="h-3 w-3" />
          </Button>
        </div>
        <Button
          variant="outline"
          size="sm"
          @click="getCurrentLocation"
          :disabled="isSearching"
          class="shrink-0"
        >
          <Icon
            :name="isSearching ? 'mdi:loading' : 'mdi:crosshairs-gps'"
            :class="isSearching ? 'animate-spin' : ''"
            class="h-4 w-4 mr-1"
          />
          Current
        </Button>
      </div>
      
      <!-- Search Results -->
      <div
        v-if="showResults && searchResults.length > 0"
        class="absolute w-full mt-1 bg-background border rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto"
      >
        <div
          v-for="result in searchResults"
          :key="result.place_id"
          @click="selectLocation(result)"
          class="p-3 cursor-pointer hover:bg-muted transition-colors border-b last:border-b-0"
        >
          <div class="flex items-start gap-2">
            <Icon name="mdi:map-marker" class="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <p class="text-sm text-foreground line-clamp-2">{{ result.display_name }}</p>
          </div>
        </div>
      </div>
      
      <!-- No Results -->
      <div
        v-else-if="showResults && searchResults.length === 0 && !isSearching && searchQuery.length >= 3"
        class="absolute w-full mt-1 bg-background border rounded-lg shadow-lg z-20 p-3"
      >
        <p class="text-sm text-muted-foreground text-center">No locations found. Try a different search term.</p>
      </div>
    </div>
    
    <!-- Map Container -->
    <div class="relative">
      <div ref="mapContainer" class="w-full h-64 sm:h-80 lg:h-96 rounded-lg border z-0"></div>
      <div class="absolute top-2 right-2 bg-background/90 backdrop-blur-sm rounded-lg p-2 text-xs text-muted-foreground z-10">
        Click on map or drag marker to set location
      </div>
    </div>
  </div>
</template>
