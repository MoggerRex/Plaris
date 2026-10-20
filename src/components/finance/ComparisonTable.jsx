import { money } from '../../domain/planner';

export default function ComparisonTable({ data }) {
  return (
    <section className="panel">
      <h2>Planeado y real</h2>
      <div
        className="table-scroll"
        role="region"
        aria-label="Comparación de presupuesto y movimientos"
        tabIndex={0}
      >
        <table>
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Planeado</th>
              <th>Real</th>
              <th>Real menos planeado</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.key}>
                <td>{item.name}</td>
                <td>{money(item.Planeado)}</td>
                <td>{money(item.Real)}</td>
                <td>{money(item.Real - item.Planeado)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="empty-state">
        La diferencia describe lo registrado; un resultado positivo no siempre significa una mejora.
      </p>
    </section>
  );
}
