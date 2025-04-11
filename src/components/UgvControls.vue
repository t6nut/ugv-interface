<template>
  <div class="speedometer">
    Speed: {{ (speed * 3.6).toFixed(1) }} km/h
  </div>
</template>

<script lang="ts" setup>
import { onMounted, onBeforeUnmount, ref } from 'vue';
import { engineStarted, ugvLocation } from '../store/ugv';

import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';

const maxSpeed = 20 / 3.6; // 20 km/h converted to m/s
const acceleration = maxSpeed / (3 * 60); // Acceleration per frame to reach max speed in 3 seconds
const brakingDeceleration = maxSpeed / (2 * 60); // Deceleration per frame to stop in 2 seconds
const step = 0.0000003; // Base step for movement
const speed = ref(0); // Current speed in m/s
const direction = ref<[number, number] | null>(null); // Current movement direction
let toastVisible = false; // Flag to track if a toast is already visible

function handleKeyDown(e: KeyboardEvent) {
  if (!engineStarted.value) {
    if (!toastVisible) {
      toastVisible = true; // Set the flag to true
      toast.warning('Please start the engine first!', {
        position: 'bottom-right',
        onClose: () => {
          toastVisible = false; // Reset the flag when the toast is closed
        },
      });
    }
    return;
  }

  switch (e.key) {
    case 'ArrowUp': direction.value = [1, 0]; break;
    case 'ArrowDown': direction.value = [-1, 0]; break;
    case 'ArrowLeft': direction.value = [0, -1]; break;
    case 'ArrowRight': direction.value = [0, 1]; break;
    default: return;
  }
}

function handleKeyUp(e: KeyboardEvent) {
  if (
    (e.key === 'ArrowUp' && direction.value?.[0] === 1) ||
    (e.key === 'ArrowDown' && direction.value?.[0] === -1) ||
    (e.key === 'ArrowLeft' && direction.value?.[1] === -1) ||
    (e.key === 'ArrowRight' && direction.value?.[1] === 1)
  ) {
    direction.value = null;
  }
}

function updatePosition() {
  if (direction.value) {
    // Accelerate
    speed.value = Math.min(speed.value + acceleration, maxSpeed);

    const [lat, lng] = ugvLocation.value;
    const [latDir, lngDir] = direction.value;

    // Normalize movement to ensure consistent speed in all directions
    const magnitude = Math.sqrt(latDir ** 2 + lngDir ** 2);
    const normalizedLatDir = latDir / magnitude;
    const normalizedLngDir = lngDir / magnitude;

    ugvLocation.value = [
      lat + normalizedLatDir * step * speed.value,
      lng + normalizedLngDir * step * speed.value,
    ];
  } else if (speed.value > 0) {
    // Decelerate (braking)
    speed.value = Math.max(speed.value - brakingDeceleration, 0);

    const [lat, lng] = ugvLocation.value;
    const [latDir, lngDir] = direction.value || [0, 0];

    // Continue moving in the last direction while braking
    const magnitude = Math.sqrt(latDir ** 2 + lngDir ** 2) || 1; // Avoid division by zero
    const normalizedLatDir = latDir / magnitude;
    const normalizedLngDir = lngDir / magnitude;

    ugvLocation.value = [
      lat + normalizedLatDir * step * speed.value,
      lng + normalizedLngDir * step * speed.value,
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
