// src/store/ugv.ts
import { ref } from 'vue';

export const engineStarted = ref(false);
export const ugvLocation = ref<[number, number]>([59.437, 24.7536]); // Starting point
export const ugvSpeed = ref(0); // Current speed in m/s
export const ugvDirection = ref<[number, number] | null>(null); // Current movement direction

export function stopUgv() {
  ugvSpeed.value = 0;
  ugvDirection.value = null;
}
