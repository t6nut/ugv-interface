<template>
  <MapView v-slot="{ mapInstance }">
    <EngineButton />
    <UgvControls />
    <WaypointsView :map="mapInstance" />
  </MapView>
</template>

<script lang="ts" setup>
import MapView from './components/MapView.vue';
import EngineButton from './components/EngineButton.vue';
import UgvControls from './components/UgvControls.vue';
import WaypointsView from './components/WaypointsView.vue';
</script>

<style>
body, html, #app {
  margin: 0;
  padding: 0;
  height: 100%;
}
</style>
