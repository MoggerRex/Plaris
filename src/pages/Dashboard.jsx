import { Link } from 'react-router-dom';
import { useMonthBudget } from '../hooks/useMonthBudget';
import AgentSummary from '../components/agent/AgentSummary';
import AgentWorkspace from '../components/agent/AgentWorkspace';
import ComparisonChart from '../components/finance/ComparisonChart';

export default function Dashboard() {
  const { month, changeMonth, budget, totals, comparison, profile, deudas_activas, storageError } =
    useMonthBudget();
  const signature = JSON.stringify({ month, budget, profile, deudas_activas });

  return (
    <main className="agent-shell">
      <AgentSummary
        month={month}
        changeMonth={changeMonth}
        budget={budget}
        debts={deudas_activas}
        totals={totals}
      />
      {storageError && <p role="alert">{storageError}</p>}
      <div className="agent-body">
        <aside className="agent-charts">
          <span className="eyebrow">El panorama de tu mes</span>
          <h2>Cada peso cuenta.</h2>
          <p>Tu presupuesto y tus movimientos, en perspectiva.</p>
          <ComparisonChart data={comparison} title="Lo que planeas" series={['Planeado']} />
          <ComparisonChart data={comparison} title="Lo que llevas" series={['Real']} />
          <Link className="button button-secondary" to={'/graficas?mes=' + month}>
            Ver tablas y gráficas
          </Link>
        </aside>
        <AgentWorkspace
          key={signature}
          month={month}
          budget={budget}
          profile={profile}
          debts={deudas_activas}
        />
      </div>
    </main>
  );
}
