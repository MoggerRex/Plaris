// Damped angular spring: pointer velocity drives tilt, then inertia settles at rest.
export function stepCardSwing({ angle, angularVelocity }, target, elapsed) {
  const dt = Math.min(Math.max(elapsed, 0), 1 / 30);
  const force = 150 * (target - angle) - 15 * angularVelocity;
  const velocity = angularVelocity + force * dt;
  return { angle: angle + velocity * dt, angularVelocity: velocity };
}
