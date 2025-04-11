import { ref } from 'vue';

export interface Waypoint {
  id: string;
  name: string;
  location: [number, number];
}

export const waypoints = ref<Waypoint[]>([]); // Store for waypoints
