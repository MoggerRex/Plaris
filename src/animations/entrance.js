// Shared motion tokens: a short upward reveal with no bounce or scaling.
export const entranceMotion = {
  duration: 620,
  easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
  distance: 10,
};

export const brandEntrance = [
  { selector: '.brand-symbol', delay: 0 },
  { selector: '.brand-name', delay: 110 },
  { selector: '.app-header > p', delay: 230 },
  { selector: '.app-header nav', delay: 300 },
];

export const formEntrance = [
  { selector: '.onboarding-intro .eyebrow', delay: 130 },
  { selector: '.onboarding-intro h1', delay: 180 },
  { selector: '.onboarding-intro > p', delay: 250 },
  { selector: '.progress-wrap', delay: 300 },
  { selector: '.panel', delay: 350 },
  { selector: '.step-actions', delay: 400 },
];

// Never replace nodes or touch form values, focus, validation or authentication.
export function playEntrance(root, stages, reducedMotion) {
  if (!root || reducedMotion?.matches) return () => {};
  const animations = [];
  for (const stage of stages) {
    for (const element of root.querySelectorAll(stage.selector)) {
      if (!element.animate) continue;
      animations.push(
        element.animate(
          [
            { opacity: 0, transform: 'translateY(' + entranceMotion.distance + 'px)' },
            { opacity: 1, transform: 'translateY(0)' },
          ],
          {
            duration: entranceMotion.duration,
            delay: stage.delay,
            easing: entranceMotion.easing,
            fill: 'backwards',
          },
        ),
      );
    }
  }

  // Reveal immediately on keyboard focus or interaction, including during the delay.
  const reveal = () => animations.forEach((animation) => animation.cancel());
  const preferenceChanged = (event) => {
    if (event.matches) reveal();
  };
  root.addEventListener('focusin', reveal);
  root.addEventListener('pointerdown', reveal);
  reducedMotion?.addEventListener('change', preferenceChanged);
  return () => {
    reveal();
    root.removeEventListener('focusin', reveal);
    root.removeEventListener('pointerdown', reveal);
    reducedMotion?.removeEventListener('change', preferenceChanged);
  };
}
