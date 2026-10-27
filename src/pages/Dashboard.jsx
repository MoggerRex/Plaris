import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Reorder } from 'framer-motion';
import { useMonthBudget } from '../hooks/useMonthBudget';
import AgentWorkspace from '../components/agent/AgentWorkspace';
import ComparisonChart from '../components/finance/ComparisonChart';

export default function Dashboard() {
  const { month, budget, comparison, profile, deudas_activas, storageError } =
    useMonthBudget();
  const signature = JSON.stringify({ month, budget, profile, deudas_activas });

  // Panel "Cada peso cuenta": abierto por defecto
  const [chartsOpen, setChartsOpen] = useState(true);
  
  // Estado para el orden de las gráficas en el dashboard
  const [cardOrder, setCardOrder] = useState(['planeas', 'llevas']);

  return (
    <main className="agent-shell">
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
            <p>Tu presupuesto y tus movimientos, en perspectiva. (Arrastra hacia arriba o abajo para ordenar)</p>

            {/* Grupo de elementos reordenables con animación */}
            <Reorder.Group
              axis="y"
              values={cardOrder}
              onReorder={setCardOrder}
              style={{ listStyle: 'none', padding: 0, margin: '16px 0' }}
            >
              {cardOrder.map((id) => (
                <Reorder.Item
                  key={id}
                  value={id}
                  whileDrag={{
                    scale: 1.04,
                    boxShadow: '0 20px 32px rgba(16, 95, 86, 0.28)',
                    cursor: 'grabbing',
                    zIndex: 50,
                  }}
                  style={{
                    cursor: 'grab',
                    listStyle: 'none',
                    marginBottom: '16px',
                    borderRadius: '9px',
                    background: 'transparent',
                    userSelect: 'none',
                  }}
                >
                  {id === 'planeas' ? (
                    <ComparisonChart data={comparison} title="Lo que planeas" series={['Planeado']} />
                  ) : (
                    <ComparisonChart data={comparison} title="Lo que llevas" series={['Real']} />
                  )}
                </Reorder.Item>
              ))}
            </Reorder.Group>

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