import { formatCurrency, sumAmounts } from '../../services/budgetService';

export default function FinanceTable({ rows, title, debts = false }) {
  return (
    <section className="panel">
      <h2>{title}</h2>
      <div className="table-scroll" tabIndex={0} role="region" aria-label={`Tabla de ${title}`}>
        <table>
          <thead>
            <tr>
              <th>Concepto</th>
              <th>{debts ? 'Saldo' : 'Categoría'}</th>
              <th>{debts ? 'Pago mensual' : 'Monto mensual'}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{row.name || 'Sin nombre'}</td>
                <td>{debts ? formatCurrency(row.balance * 100) : row.category || row.name}</td>
                <td>{formatCurrency(debts ? row.payment * 100 : row.amountCents)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th colSpan={2}>Total mensual</th>
              <td>
                {formatCurrency(
                  debts ? rows.reduce((sum, row) => sum + row.payment * 100, 0) : sumAmounts(rows),
                )}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
      {!rows.length && <p className="empty-state">Aún no hay conceptos registrados.</p>}
    </section>
  );
}
