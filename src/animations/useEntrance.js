import { useEffect } from 'react';
import { playEntrance } from './entrance';

export function useEntrance(rootRef, stages) {
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    return playEntrance(rootRef.current, stages, preference);
  }, [rootRef, stages]);
}
