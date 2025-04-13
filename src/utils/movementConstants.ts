export const maxSpeed = 20 / 3.6; // 20 km/h converted to m/s
export const acceleration = maxSpeed / (3 * 60); // Acceleration per frame to reach max speed in 3 seconds
export const brakingDeceleration = maxSpeed / (2 * 60); // Deceleration per frame to stop in 2 seconds
export const step = 0.0000003; // Base step for movement
