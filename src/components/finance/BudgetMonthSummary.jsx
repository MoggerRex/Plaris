import { formatCurrency } from '../../services/budgetService';

// Each pair shares a scale; exceeding the plan stays visible without overflowing.
export default function BudgetMonthSummary({ data, month }) {
  const monthLabel = new Date(`${month}-01T12:00:00`).toLocaleDateString('es-MX', {
    month: 'long',
    year: 'numeric',
  });
  return (
    <section className="panel budget-month-summary" aria-labelledby="month-summary-title">
      <div className="month-summary-heading">
        <div>
          <h2 id="month-summary-title">Tu mes en números</h2>
          <p>Compara lo que planeaste con tus movimientos del mes.</p>
        </div>
        <div className="month-summary-meta">
          <span className="month-summary-date">{monthLabel}</span>
          <div className="month-summary-legend">
            <span>
              <i className="summary-dot-planned" />
              Planeado
            </span>
            <span>
              <i className="summary-dot-actual" />
              Real
            </span>
          </div>
        </div>
      </div>
      <div className="month-summary-grid">
        {data.map((item, index) => {
          const scale = Math.max(item.Planeado, item.Real, 1);
          const percent = item.Planeado > 0 ? Math.round((item.Real / item.Planeado) * 100) : null;
          return (
            <article className="month-summary-item" key={item.key}>
              <h3>{item.name}</h3>
              {[
                { label: 'Planeado', amount: item.Planeado, className: 'summary-bar-planned' },
                { label: 'Real', amount: item.Real, className: 'summary-bar-actual' },
              ].map((bar) => (
                <div className="summary-bar-group" key={bar.label}>
                  <div className="summary-bar-label">
                    <span>{bar.label}</span>
                    <strong>{formatCurrency(Math.round(bar.amount * 100))}</strong>
                  </div>
                  <div className="summary-bar-track" aria-hidden="true">
                    <span
                      key={month + bar.label}
                      className={bar.className}
                      style={{
                        width: `${(Math.max(0, bar.amount) / scale) * 100}%`,
                        '--bar-entry-delay': `${index * 140 + (bar.label === 'Real' ? 120 : 0)}ms`,
                      }}
                    />
                  </div>
                </div>
              ))}
              <p className="summary-percentage">
                {percent === null
                  ? item.Real > 0
                    ? 'Registrado sin un monto planeado'
                    : 'Sin monto planeado este mes'
                  : `${percent}% del total planeado`}
              </p>
            </article>
          );
        })}
      </div>
      <small className="month-summary-note">
        Montos en MXN. Las barras de cada apartado comparten su propia escala.
      </small>
    </section>
  );
}
