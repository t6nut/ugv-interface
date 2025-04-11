<script lang="ts" setup>
import { onMounted, onBeforeUnmount, ref } from 'vue';
import { engineStarted, ugvLocation } from '../store/ugv';

import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';

const maxSpeed = 20 / 3.6; // 20 km/h converted to m/s
const acceleration = maxSpeed / 3; // Acceleration to reach max speed in 3 seconds
const step = 0.0000003; // Base step for movement
const speed = ref(0); // Current speed in m/s
const direction = ref<[number, number] | null>(null); // Current movement direction

function handleKeyDown(e: KeyboardEvent) {
  if (!engineStarted.value) {
    toast.warning('Please start the engine first!');
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
    speed.value = Math.min(speed.value + acceleration * 0.1, maxSpeed);

    const [lat, lng] = ugvLocation.value;
    const [latDir, lngDir] = direction.value;

    ugvLocation.value = [
      lat + latDir * step * speed.value,
      lng + lngDir * step * speed.value,
    ];
  } else {
    // Decelerate
    speed.value = Math.max(speed.value - acceleration * 0.1, 0);
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
