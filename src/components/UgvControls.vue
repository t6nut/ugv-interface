<script lang="ts" setup>
import { onMounted, onBeforeUnmount } from 'vue';
import { engineStarted, ugvLocation } from '../store/ugv';

import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';

const step = 0.0005;

function handleKey(e: KeyboardEvent) {
  if (!engineStarted.value) {
   	toast.warning('Please start the engine first!');
    return;
  }

  let [lat, lng] = ugvLocation.value;

  switch (e.key) {
    case 'ArrowUp': lat += step; break;
    case 'ArrowDown': lat -= step; break;
    case 'ArrowLeft': lng -= step; break;
    case 'ArrowRight': lng += step; break;
    default: return;
  }

  ugvLocation.value = [lat, lng];
}

onMounted(() => window.addEventListener('keydown', handleKey));
onBeforeUnmount(() => window.removeEventListener('keydown', handleKey));
</script>
