<template>
  <div ref="mapContainer" style="height: 100vh; width: 100vw;" />
  <button @click="toggleLock" class="lock-btn">
    {{ lockOnUgv ? 'Unlock View' : 'Lock View' }}
  </button>

  <!-- Centralized popup for waypoint actions -->
  <div v-if="showWaypointPopup" class="waypoint-popup">
    <h3>Waypoint Actions</h3>
    <p>Latitude: {{ selectedWaypoint?.lat }}, Longitude: {{ selectedWaypoint?.lng }}</p>
    <button @click="driveToWaypoint(selectedWaypoint.lat, selectedWaypoint.lng)">Drive</button>
    <button @click="saveWaypoint(selectedWaypoint.lat, selectedWaypoint.lng)">Save</button>
    <button @click="closeWaypointPopup">Cancel</button>
  </div>
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
let longPressTimeout: number | null = null;

const lockOnUgv = ref(true); // State to lock/unlock map view
const ugvDirection = ref(0); // Direction of the UGV in degrees

const showWaypointPopup = ref(false); // Controls visibility of the waypoint popup
const selectedWaypoint = ref<{ lat: number; lng: number } | null>(null); // Stores the selected waypoint

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

  // Show the centralized popup with waypoint options
  selectedWaypoint.value = { lat, lng };
  showWaypointPopup.value = true;
}

function driveToWaypoint(lat: number, lng: number) {
  showWaypointPopup.value = false;

  // Move the UGV to the waypoint at realistic speed
  const [currentLat, currentLng] = ugvLocation.value;
  const distance = Math.sqrt((lat - currentLat) ** 2 + (lng - currentLng) ** 2);
  const speed = 20 / 3.6; // 20 km/h converted to m/s
  const duration = distance / speed; // Time in seconds to reach the waypoint
  const steps = Math.ceil(duration * 60); // Assuming 60 updates per second
  const latStep = (lat - currentLat) / steps;
  const lngStep = (lng - currentLng) / steps;

  let stepCount = 0;
  function moveStep() {
    if (stepCount < steps) {
      ugvLocation.value = [
        ugvLocation.value[0] + latStep,
        ugvLocation.value[1] + lngStep,
      ];
      stepCount++;
      requestAnimationFrame(moveStep);
    } else {
      ugvLocation.value = [lat, lng]; // Ensure final position is exact
    }
  }
  moveStep();
}

function saveWaypoint(lat: number, lng: number) {
  waypoints.value.push({ id: Date.now().toString(), name: `Waypoint ${waypoints.value.length + 1}`, location: [lat, lng] });
  showWaypointPopup.value = false;
}

function closeWaypointPopup() {
  showWaypointPopup.value = false;
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

.waypoint-popup {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 20px;
  border-radius: 8px;
  z-index: 2000;
  text-align: center;
}

.waypoint-popup button {
  margin: 5px;
  padding: 10px 20px;
  border: none;
  background-color: rgba(128, 128, 128, 0.8);
  color: white;
  font-weight: bold;
  cursor: pointer;
  border-radius: 4px;
}

.waypoint-popup button:hover {
  background-color: rgba(100, 100, 100, 0.8);
}
</style>
