import { type Ref } from 'vue';
import L from 'leaflet';
import { toast } from 'vue3-toastify';
import { maxSpeed, acceleration, step } from './movementConstants';
import { stopUgv } from '../store/ugv';

export function driveToWaypoint(
  map: L.Map | null,
  ugvLocation: Ref<[number, number]>,
  engineStarted: Ref<boolean>,
  targetLocation: [number, number],
  onComplete?: () => void
) {
  if (!engineStarted.value) {
    toast.warning('Please start the engine first!', { position: 'top-center' });
    return;
  }

  const [lat, lng] = targetLocation;
  const speed = { value: 0 }; // Current speed in m/s
  let waypointLine: L.Polyline | null = null;

  // Draw a line between the UGV and the waypoint
  if (map) {
    waypointLine = L.polyline([ugvLocation.value, [lat, lng]], { color: 'limegreen' }).addTo(map);
  }

  function moveStep() {
    if (!engineStarted.value) {
      stopUgv(); // Stop the UGV if the engine is turned off
      if (waypointLine && map) {
        map.removeLayer(waypointLine);
      }
      return;
    }

    const [currentLat, currentLng] = ugvLocation.value;
    const deltaLat = lat - currentLat;
    const deltaLng = lng - currentLng;
    const distance = Math.sqrt(deltaLat ** 2 + deltaLng ** 2);

    if (distance < step * speed.value) {
      // Stop when close enough to the waypoint
      ugvLocation.value = [lat, lng];
      if (waypointLine && map) {
        map.removeLayer(waypointLine);
      }
      if (onComplete) onComplete();
      return;
    }

    // Accelerate to max speed
    speed.value = Math.min(speed.value + acceleration, maxSpeed);

    // Calculate movement step
    const latStep = (deltaLat / distance) * step * speed.value;
    const lngStep = (deltaLng / distance) * step * speed.value;

    // Update UGV position
    ugvLocation.value = [
      currentLat + latStep,
      currentLng + lngStep,
    ];

    // Update the line
    if (waypointLine) {
      waypointLine.setLatLngs([ugvLocation.value, [lat, lng]]);
    }

    requestAnimationFrame(moveStep);
  }

  moveStep();
}
