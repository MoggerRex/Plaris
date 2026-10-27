import { Check, Pencil, Plus, Trash2, X } from 'lucide-react';
import { centsToInput, formatCurrency } from '../../services/budgetService';
import { transactionTypes as TRANSACTION_TYPES } from '../../config/transactionTypes';

export default function TransactionPanel({
  month,
  transactions,
  categoriesFor,
  editingTransaction,
  newTransactionType,
  setEditingTransaction,
  saveTransaction,
  startEdit,
  changeType,
  deleteTransaction,
  message,
}) {
  const today = getTodayKey();
  const selected = editingTransaction || {
    type: newTransactionType,
    date: month === today.slice(0, 7) ? today : `${month}-01`,
    category: '',
  };
  const categories = categoriesFor(selected.type);

  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <h2>Movimientos</h2>
          <p>Agrega ingresos, gastos y aportaciones de ahorro.</p>
        </div>
      </div>
      <form className="transaction-form" onSubmit={saveTransaction}>
        <label className="field">
          <span>Tipo</span>
          <select
            name="type"
            value={selected.type}
            onChange={(event) => changeType(event.target.value)}
          >
            {TRANSACTION_TYPES.map((item) => (
              <option value={item.value} key={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Categoría</span>
          <input
            name="category"
            list="transaction-categories"
            defaultValue={selected.category}
            key={`${editingTransaction?.id || 'new'}-${selected.type}`}
            placeholder="Ej. Alimentación"
            required
          />
          <datalist id="transaction-categories">
            {categories.map((category) => (
              <option key={category} value={category} />
            ))}
          </datalist>
        </label>
        <label className="field">
          <span>Descripción</span>
          <input
            name="description"
            defaultValue={selected.description || ''}
            key={`${editingTransaction?.id || 'new'}-description`}
            placeholder="Ej. Despensa, papitas Sabritas o entradas al cine"
            maxLength={300}
          />
        </label>

        <label className="field">
          <span>Monto (MXN)</span>
          <input
            name="amount"
            type="number"
            min="0.01"
            step="0.01"
            defaultValue={editingTransaction ? centsToInput(editingTransaction.amountCents) : ''}
            key={`${editingTransaction?.id || 'new'}-amount`}
            required
          />
        </label>
        <label className="field">
          <span>Fecha</span>
          <input
            name="date"
            type="date"
            defaultValue={selected.date || today}
            key={`${editingTransaction?.id || 'new'}-date`}
            required
          />
        </label>
        <div className="form-buttons">
          <button className="button button-primary" type="submit">
            {editingTransaction ? <Check size={16} /> : <Plus size={16} />}
            {editingTransaction ? 'Guardar' : 'Agregar'}
          </button>
          {editingTransaction && (
            <button
              className="button button-quiet"
              type="button"
              onClick={() => setEditingTransaction(null)}
            >
              <X size={16} /> Cancelar
            </button>
          )}
        </div>
      </form>
      {message && (
        <p
          className={
            message.includes('debe') || message.includes('Completa') ? 'form-error' : 'form-success'
          }
          role="status"
        >
          {message}
        </p>
      )}
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Tipo</th>
              <th>Categoría</th>
              <th>Descripción</th>
              <th>Monto</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {transactions
              .slice()
              .sort((a, b) => b.date.localeCompare(a.date))
              .map((item) => (
                <tr key={item.id}>
                  <td>{new Date(`${item.date}T12:00:00`).toLocaleDateString('es-MX')}</td>
                  <td>{TRANSACTION_TYPES.find((type) => type.value === item.type)?.label}</td>
                  <td>{item.category}</td>
                  <td>{item.description || '—'}</td>
                  <td>{formatCurrency(item.amountCents)}</td>
                  <td>
                    <div className="table-actions">
                      <button
                        type="button"
                        className="icon-button"
                        aria-label="Editar movimiento"
                        onClick={() => startEdit(item)}
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        className="icon-button danger"
                        aria-label="Eliminar movimiento"
                        onClick={() => deleteTransaction(item.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        {transactions.length === 0 && (
          <p className="empty-state">No hay movimientos registrados para este mes.</p>
        )}
      </div>
    </section>
  );
}

function getTodayKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}
