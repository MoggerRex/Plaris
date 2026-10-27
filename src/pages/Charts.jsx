import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, Table2, MessageSquareText, ArrowUpRight } from 'lucide-react';
import { useMonthBudget } from '../hooks/useMonthBudget';
import { financeSections } from '../config/financeSections';
import VisualizationPanel from '../components/finance/VisualizationPanel';

import ComparisonChart from '../components/finance/ComparisonChart';
import AnnualAnalytics from '../components/finance/AnnualAnalytics';

export default function Charts() {
  const state = useMonthBudget();
  const [mode, setMode] = useState('graficas');
  return (
    <main className="page-shell">
      <header className="charts-navigation">
        <div className="charts-navigation-intro">
          <div>
            <h1>Explora tus datos</h1>
            <p>Elige cómo ver tus finanzas o consulta tus resultados con Plaris.</p>
          </div>
          <Link className="charts-analysis-link" to={'/analisis?mes=' + state.month}>
            <MessageSquareText size={18} aria-hidden="true" />
            <span>Ayúdame a entender mis datos</span>
            <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </div>
        <div className="charts-view-switch" role="group" aria-label="Tipo de visualización">
          <button
            type="button"
            aria-pressed={mode === 'graficas'}
            onClick={() => setMode('graficas')}
          >
            <BarChart3 size={18} aria-hidden="true" /> Gráficas
          </button>
          <button type="button" aria-pressed={mode === 'tablas'} onClick={() => setMode('tablas')}>
            <Table2 size={18} aria-hidden="true" /> Tablas
          </button>
        </div>
      </header>
      {mode === 'graficas' ? (
        <AnnualAnalytics
          month={state.month}
          transactions={state.transactions}
          monthlyBudgets={state.monthlyBudgets}
          openingFunds={state.openingFunds}
          debts={state.deudas_activas}
          overview={<ComparisonChart data={state.comparison} />}
        >
          <VisualizationPanel
            mode="graficas"
            includeComparison={false}
            budget={state.budget}
            debts={state.deudas_activas}
            comparison={state.comparison}
            sections={financeSections.map((item) => item.key)}
          />
        </AnnualAnalytics>
      ) : (
        <>
          <VisualizationPanel
            mode="tablas"
            budget={state.budget}
            debts={state.deudas_activas}
            comparison={state.comparison}
            sections={financeSections.map((item) => item.key)}
          />
        </>
      )}
    </main>
  );
}
