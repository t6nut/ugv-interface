<template>
  <div ref="mapContainer" style="height: 100vh; width: 100vw;" />
  <button @click="toggleLock" class="lock-btn">
    {{ lockOnUgv ? 'Unlock View' : 'Lock View' }}
  </button>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue';
import L from 'leaflet';
import { ugvLocation } from '../store/ugv';

const mapContainer = ref<HTMLElement | null>(null);
const initialCoords: [number, number] = [59.437, 24.7536]; // Tallinn or your UGV's start point
let map: L.Map | null = null;
let marker: L.Marker | null = null;

const lockOnUgv = ref(true); // State to lock/unlock map view

function toggleLock() {
  lockOnUgv.value = !lockOnUgv.value;
}

onMounted(() => {
  if (mapContainer.value) {
    map = L.map(mapContainer.value, {
      keyboard: false,
    }).setView(initialCoords, 20);

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
  if (lockOnUgv.value && map) {
    map.setView([lat, lng]); // Center map on UGV if locked
  }
});
</script>

<style scoped>
.lock-btn {
  position: fixed;
  bottom: 20px;
  left: 20px;
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  border: none;
  padding: 10px 20px;
  font-size: 14px;
  cursor: pointer;
  z-index: 1000;
}
.lock-btn:hover {
  background-color: rgba(50, 50, 50, 0.8);
}
</style>
