import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMonthBudget } from '../hooks/useMonthBudget';
import { financeSections } from '../config/financeSections';
import PageHeading from '../components/common/PageHeading';
import MonthPicker from '../components/common/MonthPicker';
import VisualizationPanel from '../components/finance/VisualizationPanel';

export default function Charts() {
  const state = useMonthBudget();
  const [mode, setMode] = useState('graficas');
  return (
    <main className="page-shell">
      <PageHeading title="Tablas y gráficas">
        <MonthPicker month={state.month} onChange={state.changeMonth} />
      </PageHeading>
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
      <p>
        Ambas vistas usan los mismos datos. Las gráficas comparan presupuesto y movimientos reales;
        las tablas muestran cada concepto. Las deudas se muestran por saldo y pago mensual.
      </p>
      <VisualizationPanel
        mode={mode}
        budget={state.budget}
        debts={state.deudas_activas}
        comparison={state.comparison}
        sections={financeSections.map((item) => item.key)}
      />
    </main>
  );
}
