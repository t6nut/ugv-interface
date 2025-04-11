// src/store/ugv.ts
import { ref } from 'vue';

export const engineStarted = ref(false);
export const ugvLocation = ref<[number, number]>([59.437, 24.7536]); // Starting point
