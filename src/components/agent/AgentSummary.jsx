import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { financeSections, profileLink } from '../../config/financeSections';
import { formatCurrency, sumAmounts } from '../../services/budgetService';
import MonthPicker from '../common/MonthPicker';

export default function AgentSummary({ month, changeMonth, budget, debts, totals }) {
  const payment = debts.reduce((sum, debt) => sum + debt.payment * 100, 0);
  return (
    <section className="agent-summary-compact">
      {/* Etiqueta animada con la palabra AGENTE que entra y sale deslizándose 
      <div className="agent-title-animated">
        <span className="sliding-title">AGENTE</span>
      </div>*/}

      <div className="agent-metrics-full">
        {financeSections.map((section) => (
          <Link key={section.key} to={profileLink(section.key, month)}>
            <span>{section.label}:</span>
            <strong>
              {formatCurrency(
                section.key === 'debts'
                  ? debts.reduce((sum, debt) => sum + debt.balance * 100, 0)
                  : section.key === 'savings'
                    ? totals.savings
                    : sumAmounts(budget[section.key]),
              )}
            </strong>
            <ArrowUpRight size={15} />
          </Link>
        ))}
        <div>
          <span>Disponible:</span>
          <strong>
            {formatCurrency(totals.income - totals.expenses - totals.savings - payment)}
          </strong>
        </div>
        <div className="month-picker-wrap">
          <MonthPicker month={month} onChange={changeMonth} />
        </div>
      </div>
    </section>
  );
}
