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
const ugvDirection = ref(0); // Direction of the UGV in degrees

const tankIcon = L.divIcon({
  className: 'tank-icon',
  html: `<div class="tank">
           <div class="barrel"></div>
         </div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

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

    marker = L.marker(initialCoords, { icon: tankIcon }).addTo(map);
  }
});

watch(ugvLocation, ([lat, lng], [prevLat, prevLng]) => {
  if (marker) {
    marker.setLatLng([lat, lng]); // Update marker position

    // Calculate direction based on movement
    const deltaLat = lat - prevLat;
    const deltaLng = lng - prevLng;
    if (deltaLat !== 0 || deltaLng !== 0) {
      ugvDirection.value = (Math.atan2(deltaLng, deltaLat) * 180) / Math.PI;
    }

    // Rotate the barrel without affecting the marker's position
    const tankElement = marker.getElement();
    if (tankElement) {
      const barrel = tankElement.querySelector('.barrel') as HTMLElement;
      if (barrel) {
        barrel.style.transform = `rotate(${ugvDirection.value}deg)`;
      }
    }
  }

  if (lockOnUgv.value && map) {
    map.setView([lat, lng]); // Center map on UGV if locked
  }
});
</script>

<style>
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

.tank-icon .tank {
  width: 40px;
  height: 40px;
  background-color: green; /* Ensure the tank is green */
  border-radius: 50%; /* Make the tank circular */
  border: 2px solid black; /* Add a border for better visibility */
  position: relative;
  display: flex; /* Center the barrel inside the tank */
  justify-content: center;
  align-items: center;
}

.tank-icon .barrel {
  width: 20px;
  height: 5px;
  background-color: black; /* Barrel color */
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%); /* Center the barrel */
  transform-origin: left center; /* Rotate around the left side */
}
</style>
