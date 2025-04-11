<template>
  <button @click="toggleEngine" class="engine-btn">
    🔧 {{ engineStarted ? 'Stop Engine' : 'Start Engine' }}
  </button>
</template>

<script lang="ts" setup>
import { engineStarted } from '../store/ugv';

function toggleEngine() {
  engineStarted.value = !engineStarted.value;
	console.log(`Engine ${engineStarted.value ? 'started' : 'stopped'}`);
	// Here you can add the logic to start/stop the engine, e.g., send a request to the backend or update the UGV state.
	// For example:
	// await fetch('/api/ugv/engine', {
	//   method: engineStarted.value ? 'POST' : 'DELETE',
	// });
	
}
</script>

<style scoped>
.engine-btn {
  position: fixed;
  top: 20px;
  right: 20px;
  background-color: rgba(128, 128, 128, 0.8);
  border: 2px solid black;
  color: white;
  padding: 10px 20px;
  font-weight: bold;
  z-index: 1000;
}
</style>
