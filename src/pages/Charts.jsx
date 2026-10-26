import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMonthBudget } from '../hooks/useMonthBudget';
import { financeSections } from '../config/financeSections';
import AgentSummary from '../components/agent/AgentSummary';
import VisualizationPanel from '../components/finance/VisualizationPanel';

export default function Charts() {
  const state = useMonthBudget();
  const [mode, setMode] = useState('graficas');
  return (
    <main>
      {/* Misma barra de métricas y selector de mes que la pantalla del agente */}
      <AgentSummary
        month={state.month}
        changeMonth={state.changeMonth}
        budget={state.budget}
        debts={state.deudas_activas}
        totals={state.totals}
      />

      <div className="page-shell">
        <div className="section-toolbar">
          <div className="section-tabs" role="group" aria-label="Tipo de visualización">
            <button aria-pressed={mode === 'graficas'} onClick={() => setMode('graficas')}>
              Gráficas
            </button>
            <button aria-pressed={mode === 'tablas'} onClick={() => setMode('tablas')}>
              Tablas con importes
            </button>
          </div>
          <Link className="button button-primary" to={'/analisis?mes=' + state.month}>
            Ayúdame a entender mis datos
          </Link>
          <Link className="button button-secondary" to={'/movimientos?mes=' + state.month}>
            Registrar movimientos
          </Link>
        </div>
        <div className="panel">
          <h2>¿Qué estás viendo?</h2>
          <p>
            <strong>Planeado:</strong> los ingresos, gastos y aportaciones de ahorro que guardaste
            en tu perfil para este mes. <strong>Real:</strong> los movimientos que registraste con
            fecha en este mes.
          </p>
          <p>
            La gráfica de barras compara ambos. Las gráficas circulares de ingresos, gastos y
            ahorros muestran la distribución planeada del perfil; la de deudas muestra el saldo
            registrado. Si no has registrado movimientos, Real aparece en cero.
          </p>
        </div>
        <VisualizationPanel
          mode={mode}
          budget={state.budget}
          debts={state.deudas_activas}
          comparison={state.comparison}
          sections={financeSections.map((item) => item.key)}
        />
      </div>
    </main>
  );
}