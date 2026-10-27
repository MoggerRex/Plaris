import { money } from '../../domain/planner';

function planStatus(item) {
  const difference = Math.round((item.Real - item.Planeado) * 100) / 100;
  const amount = money(Math.abs(difference));
  if (!item.Planeado && !item.Real) return 'Sin plan ni movimientos';
  if (!item.Planeado) return `${money(item.Real)} registrados sin plan`;
  if (item.key === 'savings') {
    if (difference < 0) return `Faltan ${amount} por ahorrar`;
    if (difference > 0) return `Meta superada por ${amount}`;
    return 'Meta de ahorro alcanzada';
  }
  if (item.key === 'expenses') {
    if (difference < 0) return `${amount} disponibles del presupuesto`;
    if (difference > 0) return `${amount} por encima del presupuesto`;
    return 'Presupuesto utilizado por completo';
  }
  if (difference < 0) return `Faltan ${amount} por recibir`;
  if (difference > 0) return `${amount} más de lo planeado`;
  return 'Ingreso planeado recibido';
}

export default function ComparisonTable({ data, compact = false }) {
  return (
    <section className="panel comparison-table-panel">
      {!compact && <h2>Planeado y real</h2>}
      <div
        className="table-scroll"
        role="region"
        aria-label="Comparación de presupuesto y movimientos"
        tabIndex={0}
      >
        <table className="comparison-table">
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Planeado</th>
              <th>Real</th>
              <th>Estado del plan</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.key}>
                <td>{item.name}</td>
                <td>{money(item.Planeado)}</td>
                <td>{money(item.Real)}</td>
                <td>{planStatus(item)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!compact && (
        <p className="empty-state">
          El estado compara los movimientos registrados con el plan completo del mes. En ahorros
          muestra cuánto falta para la meta; en gastos, cuánto queda del presupuesto o cuánto se ha
          excedido.
        </p>
      )}
    </section>
  );
}
