import { useEffect, useImperativeHandle, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Grip,
  Maximize2,
  Minimize2,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';
import {
  clampSplit,
  defaultAnalysisLayout,
  readAnalysisLayout,
  saveAnalysisLayout,
  swapAnalysisPanels,
} from '../../services/analysisLayout';

export default function AnalysisWorkspace({ panels, ref }) {
  const reducedMotion = useReducedMotion();
  const [layout, setLayout] = useState(readAnalysisLayout);
  const [organizing, setOrganizing] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [dragging, setDragging] = useState(null);
  const board = useRef(null);
  useEffect(() => {
    saveAnalysisLayout(layout);
  }, [layout]);
  useImperativeHandle(
    ref,
    () => ({
      revealPanel(id) {
        setExpanded((previous) => (previous ? id : null));
      },
    }),
    [],
  );
  useEffect(() => {
    function escape(event) {
      if (event.key === 'Escape') {
        setExpanded(null);
        setDragging(null);
      }
    }
    window.addEventListener('keydown', escape);
    return () => window.removeEventListener('keydown', escape);
  }, []);

  function swap(source, target) {
    setLayout((previous) => ({
      ...previous,
      order: swapAnalysisPanels(previous.order, source, target),
    }));
    setDragging(null);
  }
  function splitKeys(event, axis) {
    const direction = ['ArrowLeft', 'ArrowUp'].includes(event.key)
      ? -2
      : ['ArrowRight', 'ArrowDown'].includes(event.key)
        ? 2
        : 0;
    if (direction) {
      event.preventDefault();
      setLayout((previous) => ({ ...previous, [axis]: clampSplit(previous[axis] + direction) }));
    }
  }

  return (
    <>
      <div className="analysis-workspace-toolbar">
        <p>
          {organizing
            ? 'Arrastra los encabezados o usa las flechas. Ajusta el tamaño desde los separadores.'
            : 'Tu espacio se guarda automáticamente. Las tablas no limitan los datos que recibe Plaris.'}
        </p>
        <div>
          <button
            className="button button-secondary"
            aria-pressed={organizing}
            onClick={() => {
              setOrganizing(!organizing);
              setExpanded(null);
            }}
          >
            <SlidersHorizontal size={16} />
            {organizing ? 'Terminar de organizar' : 'Organizar paneles'}
          </button>
          <button
            className="icon-button"
            aria-label="Restablecer distribución"
            title="Restablecer distribución"
            onClick={() => {
              setLayout(defaultAnalysisLayout);
              setExpanded(null);
            }}
          >
            <RotateCcw size={17} />
          </button>
        </div>
      </div>
      <div
        ref={board}
        className={`analysis-board${organizing ? ' is-organizing' : ''}${expanded ? ' has-expanded' : ''}`}
        style={{ '--analysis-column': `${layout.column}%`, '--analysis-row': `${layout.row}%` }}
      >
        {layout.order.map((id, index) => {
          const panel = panels[id];
          return (
            <motion.section
              layout={reducedMotion ? false : 'position'}
              initial={reducedMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                layout: { type: 'spring', stiffness: 350, damping: 32 },
                opacity: { duration: reducedMotion ? 0 : 0.2 },
                y: { duration: reducedMotion ? 0 : 0.2 },
              }}
              key={id}
              aria-label={panel.title}
              className={`analysis-widget slot-${index}${expanded === id ? ' is-expanded' : ''}${dragging === id ? ' is-dragging' : ''}`}
              hidden={Boolean(expanded && expanded !== id)}
              onDragOver={(event) => {
                if (organizing && dragging) event.preventDefault();
              }}
              onDrop={(event) => {
                event.preventDefault();
                if (organizing) swap(event.dataTransfer.getData('text/plain'), id);
              }}
            >
              <header
                className="analysis-widget-header"
                draggable={organizing && !expanded}
                onDragStart={(event) => {
                  event.dataTransfer.setData('text/plain', id);
                  event.dataTransfer.effectAllowed = 'move';
                  setDragging(id);
                }}
                onDragEnd={() => setDragging(null)}
              >
                <div className="analysis-widget-title">
                  <Grip size={18} aria-hidden="true" />
                  <h2>{panel.title}</h2>
                  {panel.badge}
                </div>
                <div className="analysis-widget-tools">
                  {organizing && (
                    <>
                      <button
                        className="icon-button"
                        aria-label={`Mover ${panel.title} al panel anterior`}
                        onClick={() => swap(id, layout.order[(index + 2) % 3])}
                      >
                        <ArrowLeft size={15} />
                      </button>
                      <button
                        className="icon-button"
                        aria-label={`Mover ${panel.title} al panel siguiente`}
                        onClick={() => swap(id, layout.order[(index + 1) % 3])}
                      >
                        <ArrowRight size={15} />
                      </button>
                    </>
                  )}
                  <button
                    className="icon-button"
                    aria-label={`${expanded === id ? 'Reducir' : 'Ampliar'} ${panel.title}`}
                    onClick={() => setExpanded(expanded === id ? null : id)}
                  >
                    {expanded === id ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                  </button>
                </div>
              </header>
              <div className="analysis-widget-content">{panel.content}</div>
            </motion.section>
          );
        })}
        {organizing &&
          !expanded &&
          ['column', 'row'].map((axis) => (
            <div
              key={axis}
              className={`analysis-splitter analysis-splitter-${axis}`}
              role="separator"
              tabIndex={0}
              aria-label={axis === 'column' ? 'Ancho de los paneles' : 'Altura de las tablas'}
              aria-orientation={axis === 'column' ? 'vertical' : 'horizontal'}
              aria-valuemin={30}
              aria-valuemax={70}
              aria-valuenow={Math.round(layout[axis])}
              onKeyDown={(event) => splitKeys(event, axis)}
              onPointerDown={(event) => {
                event.preventDefault();
                event.currentTarget.setPointerCapture(event.pointerId);
              }}
              onPointerMove={(event) => {
                if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
                const rect = board.current.getBoundingClientRect();
                const value =
                  axis === 'column'
                    ? ((event.clientX - rect.left) / rect.width) * 100
                    : ((event.clientY - rect.top) / rect.height) * 100;
                setLayout((previous) => ({ ...previous, [axis]: clampSplit(value) }));
              }}
              onPointerUp={(event) => event.currentTarget.releasePointerCapture(event.pointerId)}
            />
          ))}
      </div>
    </>
  );
}
