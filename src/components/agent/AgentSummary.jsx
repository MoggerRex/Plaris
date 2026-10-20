import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { financeSections, profileLink } from '../../config/financeSections';
import { formatCurrency, sumAmounts } from '../../services/budgetService';
import MonthPicker from '../common/MonthPicker';

export default function AgentSummary({ month, changeMonth, budget, debts, totals }) {
  const payment = debts.reduce((sum, debt) => sum + debt.payment * 100, 0);
  return (
    <section className="agent-summary">
      <div className="agent-title">
        <span className="eyebrow">Tu espacio financiero</span>
        <h1>Agente</h1>
      </div>
      <div className="agent-metrics">
        {financeSections.map((section) => (
          <Link key={section.key} to={profileLink(section.key, month)}>
            <span>{section.label}</span>
            <strong>
              {formatCurrency(
                section.key === 'debts'
                  ? debts.reduce((sum, debt) => sum + debt.balance * 100, 0)
                  : sumAmounts(budget[section.key]),
              )}
            </strong>
            <ArrowUpRight size={17} />
          </Link>
        ))}
        <div>
          <span>Disponible tras ahorro y deudas</span>
          <strong>
            {formatCurrency(totals.income - totals.expenses - totals.savings - payment)}
          </strong>
        </div>
        <MonthPicker month={month} onChange={changeMonth} />
      </div>
    </section>
  );
}
