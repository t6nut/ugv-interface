<template>
  <div ref="mapContainer" style="height: 100vh; width: 100vw;" />
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue';
import L from 'leaflet';
import { ugvLocation } from '../store/ugv';

const mapContainer = ref<HTMLElement | null>(null);
const initialCoords: [number, number] = [59.437, 24.7536]; // Tallinn or your UGV's start point
let marker: L.Marker | null = null;

onMounted(() => {
  if (mapContainer.value) {
    const map = L.map(mapContainer.value, {
      keyboard: false,
    }).setView(initialCoords, 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    marker = L.marker(initialCoords).addTo(map).bindPopup('UGV Location').openPopup();
  }
});

watch(ugvLocation, ([lat, lng]) => {
  if (marker) {
    marker.setLatLng([lat, lng]); // Update marker position
  }
});
</script>
