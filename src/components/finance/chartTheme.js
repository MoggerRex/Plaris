import { useSyncExternalStore } from 'react';

export const chartColors = {
  planned: '#91b8a3',
  actual: '#176b55',
  projection: '#56866b',
  expense: '#67854a',
  grid: '#dce7df',
  negative: '#b42318',
};

export const chartTooltipStyle = {
  border: '1px solid #c9dbcf',
  borderRadius: 10,
  backgroundColor: '#fcfdf9',
  color: '#123e34',
  boxShadow: '0 6px 18px #123e3414',
};

const query = '(prefers-reduced-motion: reduce)';
const subscribe = (notify) => {
  const media = window.matchMedia(query);
  media.addEventListener('change', notify);
  return () => media.removeEventListener('change', notify);
};
const snapshot = () => window.matchMedia(query).matches;
const serverSnapshot = () => true;

export function useReducedChartMotion() {
  return useSyncExternalStore(subscribe, snapshot, serverSnapshot);
}

export function useChartAnimation() {
  const reduced = useReducedChartMotion();
  return {
    isAnimationActive: !reduced,
    animationBegin: 80,
    animationDuration: 1400,
    animationEasing: 'ease-out',
  };
}
