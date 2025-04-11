<template>
  <div ref="mapContainer" style="height: 100vh; width: 100vw;" />
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import L from 'leaflet';

const mapContainer = ref<HTMLElement | null>(null);
const initialCoords: [number, number] = [59.437, 24.7536]; // Tallinn or your UGV's start point

onMounted(() => {
  if (mapContainer.value) {
    const map = L.map(mapContainer.value, {
			keyboard: false
		}).setView(initialCoords, 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    L.marker(initialCoords).addTo(map).bindPopup('UGV Start Location').openPopup();
  }
});
</script>
