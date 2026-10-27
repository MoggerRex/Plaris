import { formatCurrency, sumAmounts } from '../../services/budgetService';

export default function FinanceTable({ rows, title, debts = false }) {
  return (
    <section className="panel">
      <h2>{title}</h2>
      <div className="table-scroll" tabIndex={0} role="region" aria-label={`Tabla de ${title}`}>
        <table className="finance-detail-table">
          <thead>
            <tr>
              <th>Concepto</th>
              <th className={debts ? 'money-cell' : undefined}>{debts ? 'Saldo' : 'Categoría'}</th>
              <th className="money-cell">{debts ? 'Pago mensual' : 'Monto mensual'}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td className="money-cell">{row.name || 'Sin nombre'}</td>
                <td className={debts ? 'money-cell' : undefined}>
                  {debts ? formatCurrency(row.balance * 100) : row.category || row.name}
                </td>
                <td className="money-cell">
                  {formatCurrency(debts ? row.payment * 100 : row.amountCents)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th colSpan={2}>Total mensual</th>
              <td className="money-cell">
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
