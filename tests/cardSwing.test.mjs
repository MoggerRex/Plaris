import test from 'node:test';
import assert from 'node:assert/strict';
import { stepCardSwing } from '../src/animations/cardSwing.js';

test('card spring leans in each direction and settles after pointer stops', () => {
  for (const target of [-14, 14]) {
    let state = { angle: 0, angularVelocity: 0 };
    for (let i = 0; i < 20; i++) state = stepCardSwing(state, target, 1 / 60);
    assert.equal(Math.sign(state.angle), Math.sign(target));
    for (let i = 0; i < 240; i++) state = stepCardSwing(state, 0, 1 / 60);
    assert.ok(Math.abs(state.angle) < 0.001);
    assert.ok(Math.abs(state.angularVelocity) < 0.001);
  }
});

test('card spring retains momentum at a direction change and remains stable after a long frame', () => {
  const initial = { angle: 5, angularVelocity: 20 };
  const reversed = stepCardSwing(initial, -14, 1 / 120);
  assert.ok(reversed.angle > 0);
  let state = initial;
  for (let i = 0; i < 300; i++) state = stepCardSwing(state, 0, 5);
  assert.ok(Number.isFinite(state.angle));
  assert.ok(Math.abs(state.angle) < 0.001);
});
