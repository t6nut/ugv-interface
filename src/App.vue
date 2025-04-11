<template>
  <MapView />
  <EngineButton />
</template>

<script lang="ts" setup>
import EngineButton from './components/EngineButton.vue';
import MapView from './components/MapView.vue';
</script>

<style>
body, html, #app {
  margin: 0;
  padding: 0;
  height: 100%;
}
</style>
