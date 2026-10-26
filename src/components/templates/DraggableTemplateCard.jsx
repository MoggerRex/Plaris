import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Trash2 } from 'lucide-react';
import { stepCardSwing } from '../../animations/cardSwing';

// Pointer capture keeps the complete card attached to the cursor, including in dialogs.
export default function DraggableTemplateCard({ id, name, onDropDelete, children }) {
  const cardRef = useRef(null);
  const binRef = useRef(null);
  const timerRef = useRef(null);
  const floatingRef = useRef(null);
  const motionRef = useRef({ vx: 0, vy: 0, lastX: 0, lastY: 0, time: 0 });
  const [drag, setDrag] = useState(null);
  useEffect(() => () => clearTimeout(timerRef.current), []);
  useEffect(() => {
    if (!drag) return;
    function escape(event) {
      if (event.key === 'Escape' && drag.phase === 'dragging') {
        event.preventDefault();
        event.stopPropagation();
        setDrag(null);
      }
    }
    window.addEventListener('keydown', escape, true);
    return () => window.removeEventListener('keydown', escape, true);
  }, [drag]);

  const phase = drag?.phase;
  useEffect(() => {
    if (phase !== 'dragging' || window.matchMedia('(prefers-reduced-motion: reduce)').matches)
      return;
    let frame;
    let previous = performance.now();
    let swing = { angle: 0, angularVelocity: 0 };
    let tilt = { angle: 0, angularVelocity: 0 };
    function animate(now) {
      const dt = Math.min((now - previous) / 1000, 1 / 30);
      previous = now;
      const motion = motionRef.current;
      const decay = Math.exp(-dt / 0.12);
      motion.vx *= decay;
      motion.vy *= decay;
      swing = stepCardSwing(swing, Math.max(-14, Math.min(14, -motion.vx * 0.018)), dt);
      tilt = stepCardSwing(tilt, Math.max(-5, Math.min(5, motion.vy * 0.008)), dt);
      const card = floatingRef.current;
      if (card) {
        card.style.setProperty('--card-swing', swing.angle + 'deg');
        card.style.setProperty('--card-tilt', tilt.angle + 'deg');
      }
      frame = requestAnimationFrame(animate);
    }
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [phase]);

  function start(event) {
    if (event.button !== 0 || drag) return;
    if (event.target.closest('button:not(.template-drag-handle), input, select, a')) return;
    const rect = cardRef.current.getBoundingClientRect();
    motionRef.current = {
      vx: 0,
      vy: 0,
      lastX: event.clientX,
      lastY: event.clientY,
      time: performance.now(),
    };
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    setDrag({
      phase: 'dragging',
      x: rect.x,
      y: rect.y,
      originX: rect.x,
      originY: rect.y,
      width: rect.width,
      height: rect.height,
      offsetX: event.clientX - rect.x,
      offsetY: event.clientY - rect.y,
      over: false,
      host: cardRef.current.closest('dialog') || document.body,
    });
  }
  function overBin(x, y) {
    const rect = binRef.current?.getBoundingClientRect();
    return rect && x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
  }
  function move(event) {
    if (drag?.phase !== 'dragging') return;
    const motion = motionRef.current;
    const now = performance.now();
    const dt = Math.max((now - motion.time) / 1000, 0.008);
    motion.vx =
      0.45 * motion.vx +
      0.55 * Math.max(-1800, Math.min(1800, (event.clientX - motion.lastX) / dt));
    motion.vy =
      0.45 * motion.vy +
      0.55 * Math.max(-1800, Math.min(1800, (event.clientY - motion.lastY) / dt));
    motion.lastX = event.clientX;
    motion.lastY = event.clientY;
    motion.time = now;
    setDrag({
      ...drag,
      x: event.clientX - drag.offsetX,
      y: event.clientY - drag.offsetY,
      over: Boolean(overBin(event.clientX, event.clientY)),
    });
  }
  function finish(event) {
    if (drag?.phase !== 'dragging') return;
    const drop = overBin(event.clientX, event.clientY);
    const bin = binRef.current?.getBoundingClientRect();
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setDrag({
      ...drag,
      phase: drop ? 'deleting' : 'returning',
      x: drop ? bin.x + bin.width / 2 - drag.width / 2 : drag.originX,
      y: drop ? bin.y + bin.height / 2 - drag.height / 2 : drag.originY,
      over: Boolean(drop),
    });
    timerRef.current = setTimeout(
      () => {
        setDrag(null);
        if (drop) onDropDelete();
      },
      reduced ? 0 : drop ? 420 : 220,
    );
  }

  return (
    <>
      <article
        ref={cardRef}
        className={`panel template-card${drag ? ' template-card-held' : ''}`}
        id={id}
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={finish}
        onPointerCancel={() => setDrag(null)}
      >
        {children}
        <button
          type="button"
          className="template-drag-handle"
          aria-label={`Arrastrar ${name} a la papelera`}
          title="Mantén pulsado y arrastra a la papelera"
        >
          Mantén y arrastra para eliminar
        </button>
      </article>
      {drag &&
        createPortal(
          <div className="template-manager template-drag-layer">
            <article
              ref={floatingRef}
              aria-hidden="true"
              inert
              className={`panel template-card template-floating-card is-${drag.phase}`}
              style={{
                width: drag.width,
                height: drag.height,
                transformOrigin:
                  drag.phase === 'dragging' ? `${drag.offsetX}px ${drag.offsetY}px` : 'center',
                transform: `translate3d(${drag.x}px, ${drag.y}px, 0) perspective(900px) rotate(${drag.phase === 'deleting' ? '-12deg' : drag.phase === 'returning' ? '0deg' : 'var(--card-swing, 0deg)'}) rotateX(${drag.phase === 'dragging' ? 'var(--card-tilt, 0deg)' : '0deg'}) scale(${drag.phase === 'deleting' ? 0.06 : drag.phase === 'returning' ? 1 : 1.025})`,
              }}
            >
              {children}
            </article>
            <div
              ref={binRef}
              className={`template-trash-zone${drag.over ? ' is-over' : ''}`}
              role="status"
            >
              <Trash2 size={32} aria-hidden="true" />
              <span>
                {drag.phase === 'deleting'
                  ? 'Eliminando plantilla...'
                  : drag.over
                    ? 'Suelta para eliminar'
                    : 'Arrastra aquí para eliminar'}
              </span>
            </div>
          </div>,
          drag.host,
        )}
    </>
  );
}
