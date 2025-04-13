<template>
  <div class="speedometer">
    Speed: {{ (ugvSpeed * 3.6).toFixed(1) }} km/h
    <br />
    Coordinates: {{ ugvLocation[0].toFixed(5) }}, {{ ugvLocation[1].toFixed(5) }}
  </div>
</template>

<script lang="ts" setup>
import { onMounted, onBeforeUnmount } from 'vue';
import { engineStarted, ugvLocation, ugvSpeed, ugvDirection } from '../store/ugv';
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';
import { maxSpeed, acceleration, brakingDeceleration, step } from '../utils/movementConstants';

let toastVisible = false; // Flag to track if a toast is already visible

function handleKeyDown(e: KeyboardEvent) {
  if (!engineStarted.value) {
    if (!toastVisible) {
      toastVisible = true;
      toast.warning('Please start the engine first!', {
        position: 'top-center',
        onClose: () => {
          toastVisible = false;
        },
      });
    }
    return;
  }

  switch (e.key) {
    case 'ArrowUp': ugvDirection.value = [1, 0]; break;
    case 'ArrowDown': ugvDirection.value = [-1, 0]; break;
    case 'ArrowLeft': ugvDirection.value = [0, -1]; break;
    case 'ArrowRight': ugvDirection.value = [0, 1]; break;
    default: return;
  }
}

function handleKeyUp(e: KeyboardEvent) {
  if (
    (e.key === 'ArrowUp' && ugvDirection.value?.[0] === 1) ||
    (e.key === 'ArrowDown' && ugvDirection.value?.[0] === -1) ||
    (e.key === 'ArrowLeft' && ugvDirection.value?.[1] === -1) ||
    (e.key === 'ArrowRight' && ugvDirection.value?.[1] === 1)
  ) {
    ugvDirection.value = null;
  }
}

function updatePosition() {
  if (ugvDirection.value && engineStarted.value) {
    // Accelerate
    ugvSpeed.value = Math.min(ugvSpeed.value + acceleration, maxSpeed);

    const [lat, lng] = ugvLocation.value;
    const [latDir, lngDir] = ugvDirection.value;

    // Normalize movement to ensure consistent speed in all directions
    const magnitude = Math.sqrt(latDir ** 2 + lngDir ** 2);
    const normalizedLatDir = latDir / magnitude;
    const normalizedLngDir = lngDir / magnitude;

    ugvLocation.value = [
      lat + normalizedLatDir * step * ugvSpeed.value,
      lng + normalizedLngDir * step * ugvSpeed.value,
    ];
  } else if (ugvSpeed.value > 0) {
    // Decelerate (braking)
    ugvSpeed.value = Math.max(ugvSpeed.value - brakingDeceleration, 0);

    const [lat, lng] = ugvLocation.value;
    const [latDir, lngDir] = ugvDirection.value || [0, 0];

    // Continue moving in the last direction while braking
    const magnitude = Math.sqrt(latDir ** 2 + lngDir ** 2) || 1; // Avoid division by zero
    const normalizedLatDir = latDir / magnitude;
    const normalizedLngDir = lngDir / magnitude;

    ugvLocation.value = [
      lat + normalizedLatDir * step * ugvSpeed.value,
      lng + normalizedLngDir * step * ugvSpeed.value,
    ];
  }

  requestAnimationFrame(updatePosition);
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);
  updatePosition();
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeyDown);
  window.removeEventListener('keyup', handleKeyUp);
});
</script>

<style scoped>
.speedometer {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  z-index: 1000;
}
</style>
