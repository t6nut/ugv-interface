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
import { waypoints } from '../store/waypoints'; // Import waypoints store

const mapContainer = ref<HTMLElement | null>(null);
const initialCoords: [number, number] = [59.437, 24.7536]; // Tallinn or your UGV's start point
let map: L.Map | null = null;
let marker: L.Marker | null = null;
let waypointMarker: L.Marker | null = null; // Marker for the waypoint
let longPressTimeout: number | null = null;

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

function handleLongPress(e: L.LeafletMouseEvent) {
  if (longPressTimeout) {
    clearTimeout(longPressTimeout);
    longPressTimeout = null;
  }

  const { lat, lng } = e.latlng;

  // Add a waypoint marker
  if (waypointMarker) {
    map?.removeLayer(waypointMarker);
  }
  waypointMarker = L.marker([lat, lng]).addTo(map!);

  // Bind a popup with "Drive" and "Save" buttons
  waypointMarker.bindPopup(`
    <div>
      <button id="drive-btn">Drive</button>
      <button id="save-btn">Save</button>
    </div>
  `).openPopup();

  // Add event listeners for the buttons
  setTimeout(() => {
    const driveBtn = document.getElementById('drive-btn');
    const saveBtn = document.getElementById('save-btn');

    if (driveBtn) {
      driveBtn.addEventListener('click', () => driveToWaypoint(lat, lng));
    }
    if (saveBtn) {
      saveBtn.addEventListener('click', () => saveWaypoint(lat, lng));
    }
  }, 0);
}

function driveToWaypoint(lat: number, lng: number) {
  if (waypointMarker) {
    map?.removeLayer(waypointMarker);
    waypointMarker = null;
  }
  ugvLocation.value = [lat, lng]; // Update UGV location to the waypoint
}

function saveWaypoint(lat: number, lng: number) {
  waypoints.value.push([lat, lng]); // Save the waypoint to the store
  if (waypointMarker) {
    map?.removeLayer(waypointMarker);
    waypointMarker = null;
  }
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

    // Add long-press event listener
    map.on('mousedown', (e: L.LeafletMouseEvent) => {
      longPressTimeout = window.setTimeout(() => handleLongPress(e), 1000); // Trigger after 1 second
    });
    map.on('mouseup', () => {
      if (longPressTimeout) {
        clearTimeout(longPressTimeout);
        longPressTimeout = null;
      }
    });
  }
});

watch(ugvLocation, ([lat, lng], [prevLat, prevLng]) => {
  if (marker) {
    marker.setLatLng([lat, lng]); // Update marker position

    // Calculate direction based on movement
    const deltaLat = lat - prevLat;
    const deltaLng = lng - prevLng;
    if (deltaLat !== 0 || deltaLng !== 0) {
      ugvDirection.value = (Math.atan2(deltaLng, deltaLat) * 180) / Math.PI - 90; // Adjust by -90 degrees
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
