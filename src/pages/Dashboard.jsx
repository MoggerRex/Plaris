import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMonthBudget } from '../hooks/useMonthBudget';
import AgentSummary from '../components/agent/AgentSummary';
import AgentWorkspace from '../components/agent/AgentWorkspace';
import ComparisonChart from '../components/finance/ComparisonChart';

export default function Dashboard() {
  const { month, changeMonth, budget, totals, comparison, profile, deudas_activas, storageError } =
    useMonthBudget();
  const signature = JSON.stringify({ month, budget, profile, deudas_activas });

  // Panel "Cada peso cuenta": abierto por defecto
  const [chartsOpen, setChartsOpen] = useState(true);

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

      <div className={'agent-body' + (chartsOpen ? '' : ' charts-collapsed')}>
        {/* Flecha sobre la línea divisoria */}
        <button
          type="button"
          className="charts-toggle"
          onClick={() => setChartsOpen((open) => !open)}
          aria-expanded={chartsOpen}
          aria-controls="agent-charts-panel"
          aria-label={chartsOpen ? 'Cerrar panorama del mes' : 'Abrir panorama del mes'}
        >
          {chartsOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>

        {/* Contenedor que recorta el panel mientras se abre/cierra */}
        <div className="agent-charts-wrap" id="agent-charts-panel" aria-hidden={!chartsOpen}>
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
        </div>

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