import { useState } from 'react';
import { Reorder } from 'framer-motion';
import ComparisonTable from './ComparisonTable';
import ComparisonChart from './ComparisonChart';
import CategoryChart from './CategoryChart';
import FinanceTable from './FinanceTable';
import { financeSections } from '../../config/financeSections';

export default function VisualizationPanel({
  mode,
  budget,
  debts,
  comparison,
  sections,
  includeComparison = true,
}) {
  const selected = financeSections.filter((item) => sections.includes(item.key));

  const getInitialItems = () => {
    if (mode === 'tablas') {
      return [
        ...(includeComparison ? [{ id: 'comparison', type: 'comparisonTable' }] : []),
        ...selected.map((item) => ({ id: item.key, type: 'financeTable', section: item })),
      ];
    } else {
      return [
        ...(includeComparison ? [{ id: 'comparison', type: 'comparisonChart' }] : []),
        ...selected.map((item) => ({ id: item.key, type: 'categoryChart', section: item })),
      ];
    }
  };

  const [order, setOrder] = useState([]);
  const rank = (id) => (order.includes(id) ? order.indexOf(id) : order.length);
  const items = getInitialItems().sort((a, b) => rank(a.id) - rank(b.id));

  return (
    <Reorder.Group
      axis="y"
      values={items}
      onReorder={(next) => setOrder(next.map((item) => item.id))}
      className="visual-grid"
      as="div"
      style={{ listStyle: 'none', padding: 0, margin: 0 }}
    >
      {items.map((item) => (
        <Reorder.Item
          key={item.id}
          value={item}
          whileDrag={{
            scale: 1.04,
            boxShadow: '0 20px 32px rgba(16, 95, 86, 0.28)',
            cursor: 'grabbing',
            zIndex: 50,
          }}
          className="visual-grid-item"
          style={{ cursor: 'grab', touchAction: 'none', height: '100%' }}
        >
          {item.type === 'comparisonTable' && (
            <ComparisonTable data={comparison.filter((c) => sections.includes(c.key))} />
          )}
          {item.type === 'comparisonChart' && (
            <ComparisonChart data={comparison.filter((c) => sections.includes(c.key))} />
          )}
          {item.type === 'financeTable' && (
            <FinanceTable
              title={item.section.label}
              rows={item.section.key === 'debts' ? debts : budget[item.section.key] || []}
              debts={item.section.key === 'debts'}
            />
          )}
          {item.type === 'categoryChart' && (
            <CategoryChart
              title={item.section.label}
              color={item.section.color}
              rows={
                item.section.key === 'debts'
                  ? debts.map((debt) => ({ ...debt, amountCents: debt.balance * 100 }))
                  : budget[item.section.key] || []
              }
            />
          )}
        </Reorder.Item>
      ))}
    </Reorder.Group>
  );
}
