import { Check, Pencil, Plus, Trash2, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { centsToInput, formatCurrency } from '../../services/budgetService';
import { transactionTypes as TRANSACTION_TYPES } from '../../config/transactionTypes';

export default function BudgetTransactionPanel({
  month,
  transactions,
  categoriesFor,
  autofillEnabled,
  amountForCategory,
  editingTransaction,
  newTransactionType,
  setEditingTransaction,
  saveTransaction,
  startEdit,
  changeType,
  deleteTransaction,
  message,
  plannedContent,
}) {
  const today = getTodayKey();
  const selected = editingTransaction || {
    type: newTransactionType,
    date: month === today.slice(0, 7) ? today : `${month}-01`,
    category: '',
  };
  const categories = categoriesFor(selected.type);

  return (
    <div className="budget-columns">
      {plannedContent}
      <div className="budget-entry-stack">
        <section className="panel budget-actual">
          <div className="section-heading">
            <div>
              <h2>Registrar movimiento</h2>
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
              <select
                name="category"
                onChange={(event) => {
                  if (!autofillEnabled || editingTransaction) return;
                  const amount = amountForCategory(selected.type, event.target.value);
                  event.currentTarget.form.elements.namedItem('amount').value =
                    amount === null ? '' : centsToInput(amount);
                }}
                defaultValue={selected.category}
                key={(editingTransaction?.id || 'new') + '-' + selected.type}
                required
              >
                <option value="" disabled>
                  Selecciona una categoría
                </option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Monto (MXN)</span>
              <input
                name="amount"
                type="number"
                min="0.01"
                step="0.01"
                defaultValue={
                  editingTransaction ? centsToInput(editingTransaction.amountCents) : ''
                }
                key={`${editingTransaction?.id || 'new'}-amount`}
                required
              />
            </label>
            {selected.type === 'saving' ? (
              <>
                <input type="hidden" name="date" value={selected.date || today} />
                <p className="transaction-saving-date">
                  Fecha del ahorro:{' '}
                  {new Date(`${selected.date || today}T12:00:00`).toLocaleDateString('es-MX')}
                </p>
              </>
            ) : (
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
            )}
            <div className="form-buttons">
              <button className="button button-primary" type="submit">
                {editingTransaction ? <Check size={16} /> : <Plus size={16} />}
                {editingTransaction ? 'Guardar cambios' : 'Registrar'}
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
                message.includes('debe') || message.includes('Completa')
                  ? 'form-error'
                  : 'form-success'
              }
              role="status"
            >
              {message}
            </p>
          )}
        </section>
        <section className="panel budget-history" aria-labelledby="history-title">
          <h2 id="history-title">Últimos movimientos</h2>
          <p>Movimientos del mes seleccionado.</p>
          <div
            className="budget-history-scroll"
            role="region"
            aria-label="Movimientos recientes"
            tabIndex={0}
          >
            {transactions
              .slice()
              .sort((a, b) => b.date.localeCompare(a.date))
              .map((item) => (
                <article className="budget-history-item" key={item.id}>
                  <div>
                    <strong>{item.category}</strong>
                    <small>
                      {new Date(item.date + 'T12:00:00').toLocaleDateString('es-MX', {
                        day: 'numeric',
                        month: 'short',
                      })}{' '}
                      · {TRANSACTION_TYPES.find((type) => type.value === item.type)?.label}
                    </small>
                  </div>
                  <strong className={item.type === 'income' ? 'budget-income-amount' : ''}>
                    {item.type === 'income' ? '+' : item.type === 'expense' ? '−' : ''}
                    {formatCurrency(item.amountCents)}
                  </strong>
                  <div className="table-actions">
                    <button
                      type="button"
                      className="icon-button"
                      aria-label={'Editar ' + item.category}
                      onClick={() => startEdit(item)}
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      type="button"
                      className="icon-button danger"
                      aria-label={'Eliminar ' + item.category}
                      onClick={() => deleteTransaction(item.id)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </article>
              ))}
            {!transactions.length && (
              <p className="empty-state">No hay movimientos registrados para este mes.</p>
            )}
          </div>
          <Link
            className="button button-secondary budget-history-view-all"
            to={'/movimientos?mes=' + month}
          >
            Ver todos los movimientos
          </Link>
        </section>
      </div>
    </div>
  );
}

function getTodayKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}
