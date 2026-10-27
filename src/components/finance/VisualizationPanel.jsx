import { useState } from 'react';
import { Reorder, useDragControls } from 'framer-motion';
import { GripVertical, ArrowUp, ArrowDown } from 'lucide-react';
import ComparisonTable from './ComparisonTable';
import ComparisonChart from './ComparisonChart';
import CategoryChart from './CategoryChart';
import FinanceTable from './FinanceTable';
import { financeSections } from '../../config/financeSections';
import { plannedSavingsRows } from '../../services/budgetConnections';

function SortableChart({ id, index, count, onMove, children }) {
  const controls = useDragControls();
  return (
    <Reorder.Item
      value={id}
      as="div"
      dragListener={false}
      dragControls={controls}
      className={'visual-grid-item' + (id === 'comparison' ? ' visual-grid-comparison' : '')}
      whileDrag={{ scale: 1.02, boxShadow: '0 16px 28px #123e3428', zIndex: 5 }}
    >
      <div className="chart-reorder-controls">
        <button
          type="button"
          className="icon-button"
          aria-label="Arrastrar para ordenar"
          onPointerDown={(event) => controls.start(event)}
          style={{ touchAction: 'none', cursor: 'grab' }}
        >
          <GripVertical size={16} />
        </button>
        <button
          type="button"
          className="icon-button"
          aria-label="Mover antes"
          disabled={index === 0}
          onClick={() => onMove(index, -1)}
        >
          <ArrowUp size={16} />
        </button>
        <button
          type="button"
          className="icon-button"
          aria-label="Mover después"
          disabled={index === count - 1}
          onClick={() => onMove(index, 1)}
        >
          <ArrowDown size={16} />
        </button>
      </div>
      {children}
    </Reorder.Item>
  );
}

export default function VisualizationPanel({
  mode,
  budget,
  debts,
  comparison,
  sections,
  includeComparison = true,
}) {
  const [order, setOrder] = useState(['comparison', ...financeSections.map((item) => item.key)]);
  const items = order.filter((id) =>
    id === 'comparison' ? includeComparison : sections.includes(id),
  );
  const selectedComparison = comparison.filter((item) => sections.includes(item.key));

  function reorder(visible) {
    setOrder([...visible, ...order.filter((id) => !visible.includes(id))]);
  }
  function move(index, delta) {
    const next = [...items];
    [next[index], next[index + delta]] = [next[index + delta], next[index]];
    reorder(next);
  }

  return (
    <Reorder.Group axis="xy" as="div" values={items} onReorder={reorder} className="visual-grid">
      {items.map((id, index) => {
        const section = financeSections.find((item) => item.key === id);
        const rows =
          id === 'debts'
            ? debts
            : id === 'savings'
              ? plannedSavingsRows(budget)
              : budget[id] || [];
        return (
          <SortableChart key={id} id={id} index={index} count={items.length} onMove={move}>
            {id === 'comparison' ? (
              mode === 'tablas' ? (
                <ComparisonTable data={selectedComparison} />
              ) : (
                <ComparisonChart data={selectedComparison} />
              )
            ) : mode === 'tablas' ? (
              <FinanceTable title={section.label} rows={rows} debts={id === 'debts'} />
            ) : (
              <CategoryChart
                title={section.label}
                color={section.color}
                rows={
                  id === 'debts'
                    ? debts.map((debt) => ({ ...debt, amountCents: debt.balance * 100 }))
                    : rows
                }
              />
            )}
          </SortableChart>
        );
      })}
    </Reorder.Group>
  );
}