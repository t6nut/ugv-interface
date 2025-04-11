<template>
  <MapView />
  <EngineButton />
	<UgvControls />
</template>

<script lang="ts" setup>
import MapView from './components/MapView.vue';
import EngineButton from './components/EngineButton.vue';
import UgvControls from './components/UgvControls.vue';
</script>

<style>
body, html, #app {
  margin: 0;
  padding: 0;
  height: 100%;
}
</style>
