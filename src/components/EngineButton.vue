<template>
  <button @click="toggleEngine" class="engine-btn">
    🔧 {{ engineStarted ? 'Stop Engine' : 'Start Engine' }}
  </button>
</template>

<script lang="ts" setup>
import { engineStarted, stopUgv } from '../store/ugv';

function toggleEngine() {
  engineStarted.value = !engineStarted.value;
  console.log(`Engine ${engineStarted.value ? 'started' : 'stopped'}`);
  
  if (!engineStarted.value) {
    stopUgv(); // Stop the UGV when the engine is stopped
  }
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
