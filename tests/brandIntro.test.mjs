import test from 'node:test';
import assert from 'node:assert/strict';
import { playBrandIntro, brandIntroTiming } from '../src/animations/brandIntro.js';

const tick = () => new Promise((resolve) => setImmediate(resolve));
function fixture(reduced = false) {
  const animations = [];
  const listeners = new Map();
  let preferenceChanged;
  let finished = 0;
  let rect = { left: 20, top: 12, width: 44, height: 44 };
  const animate = (frames, options) => {
    let resolve;
    const finished = new Promise((done) => {
      resolve = done;
    });
    const animation = {
      frames,
      options,
      finished,
      resolve,
      cancelled: false,
      cancel() {
        this.cancelled = true;
      },
    };
    animations.push(animation);
    return animation;
  };
  const preference = {
    matches: reduced,
    addEventListener: (_, fn) => {
      preferenceChanged = fn;
    },
    removeEventListener: () => {
      preferenceChanged = undefined;
    },
  };
  const target = {
    style: { visibility: '' },
    decode: async () => {},
    getBoundingClientRect: () => rect,
  };
  const logo = { style: {}, naturalWidth: 64, naturalHeight: 64, decode: async () => {}, animate };
  const backdrop = { animate };
  const overlay = { style: {} };
  const viewport = {
    innerWidth: 400,
    innerHeight: 800,
    matchMedia: () => preference,
    addEventListener: (name, fn) => listeners.set(name, fn),
    removeEventListener: (name) => listeners.delete(name),
  };
  return {
    target,
    logo,
    backdrop,
    overlay,
    viewport,
    animations,
    listeners,
    onFinish: () => {
      finished++;
    },
    get finished() {
      return finished;
    },
    setRect: (next) => {
      rect = next;
    },
    reduce: () => preferenceChanged({ matches: true }),
  };
}

test('preloads, centers proportionally and measures the live destination after a quiet entrance when the page is ready', async () => {
  const f = fixture();
  let decoded;
  f.logo.decode = () =>
    new Promise((resolve) => {
      decoded = resolve;
    });
  const cleanup = playBrandIntro(f);
  assert.equal(f.animations.length, 0);
  assert.equal(f.target.style.visibility, 'hidden');
  decoded();
  await tick();
  assert.equal(f.logo.style.width, '288px');
  assert.equal(f.logo.style.left, '56px');
  assert.equal(f.animations[0].options.duration, 300);
  assert.equal(f.animations[1].options.duration, 1750);
  assert.equal(
    brandIntroTiming.hold + Math.max(brandIntroTiming.move, brandIntroTiming.fadeOut),
    2500,
  );
  assert.deepEqual(f.animations[1].frames, [{ transform: 'none' }, { transform: 'none' }]);
  f.setRect({ left: 25, top: 10, width: 36, height: 36 });
  f.animations[1].resolve();
  await tick();
  assert.equal(f.animations[2].options.duration, 750);
  assert.equal(f.animations[2].options.easing, 'cubic-bezier(.65,0,.25,1)');
  assert.equal(f.animations[2].frames[1].transform, 'translate3d(-31px,-246px,0) scale(0.125)');
  assert.equal(f.animations[3].options.duration, 750);
  f.animations[2].resolve();
  await tick();
  assert.equal(f.finished, 0);
  f.animations[3].resolve();
  await tick();
  assert.equal(f.finished, 1);
  assert.equal(f.target.style.visibility, '');
  assert.equal(f.overlay.style.display, 'none');
  cleanup();
  assert.equal(f.listeners.size, 0);
});

test('reduced motion and decode failures immediately reveal the final brand', async () => {
  for (const reduced of [true, false]) {
    const f = fixture(reduced);
    if (!reduced)
      f.logo.decode = async () => {
        throw new Error('image unavailable');
      };
    const cleanup = playBrandIntro(f);
    await tick();
    assert.equal(f.animations.length, 0);
    assert.equal(f.finished, 1);
    assert.equal(f.target.style.visibility, '');
    cleanup();
  }
});

test('cleanup during preload prevents a late start; preference changes cancel active motion', async () => {
  const f = fixture();
  let decoded;
  f.logo.decode = () =>
    new Promise((resolve) => {
      decoded = resolve;
    });
  const cleanup = playBrandIntro(f);
  cleanup();
  decoded();
  await tick();
  assert.equal(f.animations.length, 0);
  assert.equal(f.finished, 0);
  assert.equal(f.target.style.visibility, '');
  const active = fixture();
  const dispose = playBrandIntro(active);
  await tick();
  active.reduce();
  assert.equal(active.finished, 1);
  assert.ok(active.animations.every((animation) => animation.cancelled));
  dispose();
});
test('slow page repeats the logo cycle until content is ready, then docks once', async () => {
  const f = fixture();
  let ready = false;
  const cleanup = playBrandIntro({ ...f, isReady: () => ready });
  await tick();
  f.animations[1].resolve();
  await tick();
  assert.equal(f.animations.length, 3);
  assert.equal(f.animations[2].options.duration, brandIntroTiming.hold);
  assert.ok(f.animations[2].frames.at(-1).transform.includes('rotate(360deg)'));
  ready = true;
  f.animations[2].resolve();
  await tick();
  assert.equal(f.animations.length, 5);
  assert.equal(f.animations[3].options.duration, brandIntroTiming.move);
  f.animations[3].resolve();
  f.animations[4].resolve();
  await tick();
  assert.equal(f.finished, 1);
  cleanup();
});

test('Escape exits even while a slow page keeps the logo repeating', async () => {
  const f = fixture();
  const cleanup = playBrandIntro({ ...f, isReady: () => false });
  await tick();
  f.animations[1].resolve();
  await tick();
  f.listeners.get('keydown')({ key: 'Escape' });
  assert.equal(f.finished, 1);
  assert.equal(f.target.style.visibility, '');
  assert.ok(f.animations.every((animation) => animation.cancelled));
  f.animations[2].resolve();
  await tick();
  assert.equal(f.animations.length, 3);
  cleanup();
});
