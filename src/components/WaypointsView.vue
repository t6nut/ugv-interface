<template>
  <div class="waypoints-view">
    <h2>Saved Waypoints</h2>
    <ul>
      <li
        v-for="waypoint in waypoints"
        :key="waypoint.id"
        :class="{ highlighted: waypoint === hoveredWaypoint || waypoint === selectedWaypoint }"
        @mouseenter="hoveredWaypoint = waypoint"
        @mouseleave="hoveredWaypoint = null"
      >
        <span @click="openPopup(waypoint)">
          {{ waypoint.name }} ({{ waypoint.location[0].toFixed(5) }}, {{ waypoint.location[1].toFixed(5) }})
        </span>
      </li>
    </ul>

    <div v-if="selectedWaypoint" class="popup">
      <h3>{{ selectedWaypoint.name }}</h3>
      <button
        @click="driveToWaypointHandler(selectedWaypoint)"
        :disabled="!engineStarted"
      >
        Drive
      </button>
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
import { ref, defineProps, watch } from 'vue';
import { waypoints } from '../store/waypoints';
import { ugvLocation, engineStarted } from '../store/ugv';
import L from 'leaflet';
import { driveToWaypoint } from '../utils/driveToWaypoint'; // Import the utility function

// Accept the map instance as a prop
const props = defineProps<{ map: L.Map | null }>();

const selectedWaypoint = ref(null as null | typeof waypoints.value[0]);
const hoveredWaypoint = ref(null as null | typeof waypoints.value[0]);
const renaming = ref(false);
const newName = ref('');

// Watch for changes to the map instance
watch(
  () => props.map,
  (newMap) => {
    if (!newMap) {
      console.warn('Map instance is not available yet.');
    }
  }
);

function openPopup(waypoint: typeof waypoints.value[0]) {
  selectedWaypoint.value = waypoint;
  renaming.value = false;
  newName.value = '';
}

function driveToWaypointHandler(waypoint: typeof waypoints.value[0]) {
  driveToWaypoint(props.map, ugvLocation, engineStarted, waypoint.location);
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

.waypoints-view li.highlighted {
  background-color: rgba(100, 100, 255, 0.5);
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
