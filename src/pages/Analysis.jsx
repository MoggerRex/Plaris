import { useState } from 'react';
import { financeSections } from '../config/financeSections';
import { useMonthBudget } from '../hooks/useMonthBudget';
import { selectedFinanceContext } from '../services/financeAdapter';
import VisualizationPanel from '../components/finance/VisualizationPanel';
import StatementAnalysisDemo from '../components/analysis/StatementAnalysisDemo';
import FinanceChat from '../components/analysis/FinanceChat';

export default function Analysis() {
  const state = useMonthBudget();
  const [source, setSource] = useState('budget');
  const [selected, setSelected] = useState(['incomes', 'expenses']);
  const [mode, setMode] = useState('tablas');
  const context = selectedFinanceContext(
    state.budget,
    state.deudas_activas,
    state.comparison,
    selected,
    state.month,
  );

  function toggle(key) {
    setSelected((previous) =>
      previous.includes(key) ? previous.filter((item) => item !== key) : [...previous, key],
    );
  }

  return (
    <main>
      <div className="page-shell">
        <div
          className="section-tabs"
          role="group"
          aria-label="Origen de los datos para el análisis"
        >
          <button
            type="button"
            aria-pressed={source === 'budget'}
            onClick={() => setSource('budget')}
          >
            Mi presupuesto
          </button>
          <button
            type="button"
            aria-pressed={source === 'statement'}
            onClick={() => setSource('statement')}
          >
            Estado de cuenta
          </button>
        </div>
        {source === 'statement' ? (
          <StatementAnalysisDemo />
        ) : (
          <div className="analysis-layout">
            <section>
              <fieldset className="section-selector">
                <legend>Datos que recibirá Plaris</legend>
                {financeSections.map((item) => (
                  <label key={item.key}>
                    <input
                      type="checkbox"
                      checked={selected.includes(item.key)}
                      onChange={() => toggle(item.key)}
                    />{' '}
                    {item.label}
                  </label>
                ))}
              </fieldset>
              <div
                className="section-tabs"
                role="group"
                aria-label="Vista de los datos seleccionados"
              >
                <button aria-pressed={mode === 'tablas'} onClick={() => setMode('tablas')}>
                  Tablas
                </button>
                <button aria-pressed={mode === 'graficas'} onClick={() => setMode('graficas')}>
                  Gráficas
                </button>
              </div>
              <VisualizationPanel
                mode={mode}
                budget={state.budget}
                debts={state.deudas_activas}
                comparison={state.comparison}
                sections={selected}
              />
            </section>
            <FinanceChat
              key={JSON.stringify(context)}
              context={context}
              disabled={!selected.length}
              onSave={state.saveAnalysis}
            />
          </div>
        )}
      </div>
    </main>
  );
}
