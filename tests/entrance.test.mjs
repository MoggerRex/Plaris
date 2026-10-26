import test from 'node:test';
import assert from 'node:assert/strict';
import { playEntrance, brandEntrance, entranceMotion } from '../src/animations/entrance.js';

function fixture(reduced = false) {
  const listeners = new Map();
  const preferenceListeners = new Map();
  const animations = [];
  const field = { value: '1234.50' };
  const root = {
    focusedElement: field,
    querySelectorAll: () => [
      {
        animate(frames, timing) {
          const animation = {
            frames,
            timing,
            cancelled: false,
            cancel() {
              this.cancelled = true;
            },
          };
          animations.push(animation);
          return animation;
        },
      },
    ],
    addEventListener: (name, callback) => listeners.set(name, callback),
    removeEventListener: (name) => listeners.delete(name),
  };
  const preference = {
    matches: reduced,
    addEventListener: (name, callback) => preferenceListeners.set(name, callback),
    removeEventListener: (name) => preferenceListeners.delete(name),
  };
  return { root, field, preference, listeners, preferenceListeners, animations };
}

test('entrance staggers the brand without zoom and preserves the form node and value', () => {
  const f = fixture();
  const cleanup = playEntrance(f.root, brandEntrance, f.preference);
  assert.equal(f.animations.length, brandEntrance.length);
  assert.ok(f.animations[1].timing.delay > f.animations[0].timing.delay);
  assert.equal(f.animations[0].timing.duration, entranceMotion.duration);
  assert.equal(f.animations[0].timing.fill, 'backwards');
  assert.equal(
    f.animations[0].frames.some((frame) => frame.transform.includes('scale')),
    false,
  );
  f.listeners.get('focusin')();
  assert.ok(f.animations.every((animation) => animation.cancelled));
  assert.equal(f.root.focusedElement, f.field);
  assert.equal(f.field.value, '1234.50');
  cleanup();
  assert.equal(f.listeners.size, 0);
  assert.equal(f.preferenceListeners.size, 0);
});

test('reduced motion starts immediately without animations or listeners', () => {
  const f = fixture(true);
  const cleanup = playEntrance(f.root, brandEntrance, f.preference);
  assert.equal(f.animations.length, 0);
  assert.equal(f.listeners.size, 0);
  cleanup();
});

test('a preference change cancels active animations and unmount cleans everything', () => {
  const f = fixture();
  const cleanup = playEntrance(f.root, brandEntrance, f.preference);
  f.preferenceListeners.get('change')({ matches: true });
  assert.ok(f.animations.every((animation) => animation.cancelled));
  cleanup();
  assert.equal(f.listeners.size, 0);
  assert.equal(f.preferenceListeners.size, 0);
});
