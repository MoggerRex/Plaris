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
  if (mode === 'tablas') {
    return (
      <div className="visual-grid">
        <ComparisonTable data={comparison.filter((item) => sections.includes(item.key))} />
        {selected.map((item) => (
          <FinanceTable
            key={item.key}
            title={item.label}
            rows={item.key === 'debts' ? debts : budget[item.key] || []}
            debts={item.key === 'debts'}
          />
        ))}
      </div>
    );
  }
  return (
    <div className="visual-grid">
      {includeComparison && (
        <ComparisonChart data={comparison.filter((item) => sections.includes(item.key))} />
      )}
      {selected.map((item) => (
        <CategoryChart
          key={item.key}
          title={item.label}
          color={item.color}
          rows={
            item.key === 'debts'
              ? debts.map((debt) => ({ ...debt, amountCents: debt.balance * 100 }))
              : budget[item.key] || []
          }
        />
      ))}
    </div>
  );
}
