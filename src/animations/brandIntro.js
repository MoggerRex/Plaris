export const brandIntroTiming = {
  fadeIn: 300,
  hold: 1750,
  move: 750,
  fadeOut: 750,
  easing: 'cubic-bezier(.65,0,.25,1)',
};

// Shared by the overlay and final header image so their silhouettes match exactly.
export const brandImage = '/images/plaris-symbol.svg';

export function playBrandIntro({
  target,
  logo,
  backdrop,
  overlay,
  viewport = window,
  onFinish,
  isReady = () => true,
}) {
  let cancelled = false;
  let finished = false;
  const animations = [];
  const originalVisibility = target?.style.visibility || '';
  const preference = viewport.matchMedia('(prefers-reduced-motion: reduce)');

  function stopAnimations() {
    animations.forEach((animation) => animation.cancel());
  }
  function finish() {
    if (cancelled || finished) return;
    finished = true;
    if (target) target.style.visibility = originalVisibility;
    if (overlay) overlay.style.display = 'none';
    stopAnimations();
    onFinish();
  }
  const preferenceChanged = (event) => {
    if (event.matches) finish();
  };
  const onKey = (event) => {
    if (event.key === 'Escape') finish();
  };
  preference.addEventListener('change', preferenceChanged);
  viewport.addEventListener('resize', finish);
  viewport.addEventListener('scroll', finish, true);
  viewport.addEventListener('keydown', onKey);

  if (target && !preference.matches) target.style.visibility = 'hidden';

  async function run() {
    try {
      if (!target || !logo?.animate || !backdrop?.animate || preference.matches) {
        finish();
        return;
      }
      await Promise.all([logo.decode(), target.decode()]);
      if (cancelled || finished) return;
      const ratio = logo.naturalHeight / logo.naturalWidth;
      if (!Number.isFinite(ratio) || ratio <= 0) {
        finish();
        return;
      }
      const width = Math.min(viewport.innerWidth * 0.72, 720, (viewport.innerHeight * 0.7) / ratio);
      const left = (viewport.innerWidth - width) / 2;
      const top = (viewport.innerHeight - width * ratio) / 2;
      Object.assign(logo.style, { width: `${width}px`, left: `${left}px`, top: `${top}px` });
      animations.push(
        logo.animate([{ opacity: 0 }, { opacity: 1 }], {
          duration: brandIntroTiming.fadeIn,
          easing: 'ease',
          fill: 'both',
        }),
      );
      // Start with the original quiet entrance; animate only if content is still loading.
      const initialHold = logo.animate([{ transform: 'none' }, { transform: 'none' }], {
        duration: brandIntroTiming.hold,
      });
      animations.push(initialHold);
      await initialHold.finished;
      if (cancelled || finished) return;
      const holdFrames = [
        { offset: 0, transform: 'translateY(0) rotate(0deg) scale(1)' },
        { offset: 0.18, transform: 'translateY(0) rotate(0deg) scale(1)', easing: 'ease-in' },
        {
          offset: 0.23,
          transform: 'translateY(8px) rotate(0deg) scale(1.06,.93)',
          easing: 'ease-out',
        },
        {
          offset: 0.34,
          transform: 'translateY(-65px) rotate(0deg) scale(.98,1.03)',
          easing: 'ease-in',
        },
        {
          offset: 0.44,
          transform: 'translateY(5px) rotate(0deg) scale(1.05,.95)',
          easing: 'ease-out',
        },
        { offset: 0.5, transform: 'translateY(0) rotate(0deg) scale(1)' },
        {
          offset: 0.55,
          transform: 'translateY(0) rotate(0deg) scale(1)',
          easing: 'cubic-bezier(.45,0,.2,1)',
        },
        { offset: 0.86, transform: 'translateY(0) rotate(360deg) scale(1)' },
        { offset: 1, transform: 'translateY(0) rotate(360deg) scale(1)' },
      ].map((frame) => ({ ...frame, transformOrigin: 'center center' }));
      while (!isReady()) {
        const hold = logo.animate(holdFrames, { duration: brandIntroTiming.hold });
        animations.push(hold);
        await hold.finished;
        if (cancelled || finished) return;
      }
      const destination = target.getBoundingClientRect();
      if (!destination.width || !destination.height) {
        finish();
        return;
      }
      const move = logo.animate(
        [
          { transform: 'translate3d(0,0,0) scale(1)' },
          {
            transform: `translate3d(${destination.left - left}px,${destination.top - top}px,0) scale(${destination.width / width})`,
          },
        ],
        { duration: brandIntroTiming.move, easing: brandIntroTiming.easing, fill: 'forwards' },
      );
      const fadeOut = backdrop.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: brandIntroTiming.fadeOut,
        easing: 'ease',
        fill: 'forwards',
      });
      animations.push(move, fadeOut);
      await Promise.all([move.finished, fadeOut.finished]);
      finish();
    } catch {
      // Decode errors and cancelled animation promises must never block the page.
      finish();
    }
  }
  void run();
  return () => {
    cancelled = true;
    stopAnimations();
    if (target) target.style.visibility = originalVisibility;
    preference.removeEventListener('change', preferenceChanged);
    viewport.removeEventListener('resize', finish);
    viewport.removeEventListener('scroll', finish, true);
    viewport.removeEventListener('keydown', onKey);
  };
}
