<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue";
import L, { type LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";

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
let map: L.Map | null = null;
let marker: L.Marker | null = null;

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
});
</script>

<template>
  <div ref="mapContainer" class="w-full h-64 rounded-lg border z-0"></div>
</template>
