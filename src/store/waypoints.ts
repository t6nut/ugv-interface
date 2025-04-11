import { ref, watch } from 'vue';

export interface Waypoint {
  id: string;
  name: string;
  location: [number, number];
}

// Load waypoints from local storage or initialize with an empty array
const savedWaypoints = localStorage.getItem('waypoints');
export const waypoints = ref<Waypoint[]>(savedWaypoints ? JSON.parse(savedWaypoints) : []);

// Watch for changes to waypoints and save them to local storage
watch(waypoints, (newWaypoints) => {
  localStorage.setItem('waypoints', JSON.stringify(newWaypoints));
});
