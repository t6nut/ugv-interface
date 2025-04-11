<template>
  <div class="waypoints-view">
    <h2>Saved Waypoints</h2>
    <ul>
      <li v-for="waypoint in waypoints" :key="waypoint.id">
        <span @click="openPopup(waypoint)">
          {{ waypoint.name }} ({{ waypoint.location[0].toFixed(5) }}, {{ waypoint.location[1].toFixed(5) }})
        </span>
      </li>
    </ul>

    <div v-if="selectedWaypoint" class="popup">
      <h3>{{ selectedWaypoint.name }}</h3>
      <button @click="driveToWaypoint(selectedWaypoint)">Drive</button>
      <button @click="renameWaypoint">Rename</button>
      <button @click="deleteWaypoint(selectedWaypoint)">Delete</button>
      <input
        v-if="renaming"
        v-model="newName"
        @keyup.enter="confirmRename"
        placeholder="Enter new name"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { waypoints } from '../store/waypoints';
import { ugvLocation } from '../store/ugv';

const selectedWaypoint = ref(null as null | typeof waypoints.value[0]);
const renaming = ref(false);
const newName = ref('');

function openPopup(waypoint: typeof waypoints.value[0]) {
  selectedWaypoint.value = waypoint;
  renaming.value = false;
  newName.value = '';
}

function driveToWaypoint(waypoint: typeof waypoints.value[0]) {
  const [lat, lng] = waypoint.location;

  const maxSpeed = 20 / 3.6; // 20 km/h converted to m/s
  const acceleration = maxSpeed / (3 * 60); // Acceleration per frame to reach max speed in 3 seconds
  const step = 0.0000003; // Base step for movement
  let speed = 0; // Current speed in m/s

  function moveStep() {
    const [currentLat, currentLng] = ugvLocation.value;
    const deltaLat = lat - currentLat;
    const deltaLng = lng - currentLng;
    const distance = Math.sqrt(deltaLat ** 2 + deltaLng ** 2);

    if (distance < step * speed) {
      // Stop when close enough to the waypoint
      ugvLocation.value = [lat, lng];
      return;
    }

    // Accelerate to max speed
    speed = Math.min(speed + acceleration, maxSpeed);

    // Calculate movement step
    const latStep = (deltaLat / distance) * step * speed;
    const lngStep = (deltaLng / distance) * step * speed;

    // Update UGV position
    ugvLocation.value = [
      currentLat + latStep,
      currentLng + lngStep,
    ];

    requestAnimationFrame(moveStep);
  }

  moveStep();
}

function renameWaypoint() {
  renaming.value = true;
}

function confirmRename() {
  if (selectedWaypoint.value && newName.value.trim()) {
    selectedWaypoint.value.name = newName.value.trim();
    renaming.value = false;
    newName.value = '';
  }
}

function deleteWaypoint(waypoint: typeof waypoints.value[0]) {
  waypoints.value = waypoints.value.filter((w) => w.id !== waypoint.id);
  selectedWaypoint.value = null;
}
</script>

<style scoped>
.waypoints-view {
  position: fixed;
  top: 20px;
  left: 20px;
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 10px;
  border-radius: 8px;
  z-index: 1000;
}

.waypoints-view ul {
  list-style: none;
  padding: 0;
}

.waypoints-view li {
  cursor: pointer;
  margin: 5px 0;
}

.popup {
  margin-top: 10px;
  background-color: rgba(50, 50, 50, 0.9);
  padding: 10px;
  border-radius: 8px;
}

.popup button {
  margin-right: 5px;
}

.popup input {
  margin-top: 5px;
  padding: 5px;
  border-radius: 4px;
  border: 1px solid #ccc;
}
</style>
