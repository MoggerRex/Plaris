import { useEffect, useRef, useState } from 'react';
import { ResponsiveContainer } from 'recharts';
import { useReducedChartMotion } from './chartTheme';

// Reserve the chart's size; start its animation only when the reader reaches it.
export default function ViewportChart({ children, width = '100%', height = 300, ...props }) {
  const ref = useRef(null);
  const [entered, setEntered] = useState(false);
  const reduced = useReducedChartMotion();

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (typeof IntersectionObserver === 'undefined') {
      const frame = requestAnimationFrame(() => setEntered(true));
      return () => cancelAnimationFrame(frame);
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.15) {
          setEntered(true);
        } else if (!entry.isIntersecting) {
          setEntered(false);
        }
      },
      { threshold: [0, 0.15] },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const visible = entered || reduced;
  return (
    <div
      ref={ref}
      className={'viewport-chart' + (visible ? ' viewport-chart-visible' : '')}
      style={{ width, height, minWidth: 0 }}
    >
      {visible && (
        <ResponsiveContainer {...props} width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      )}
    </div>
  );
}
