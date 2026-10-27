import { useRef, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import MoneyInput from '../common/MoneyInput';
import { createId, formatCurrency, sumAmounts } from '../../services/budgetService';

// The list scrolls independently; adding and saving remain visible outside it.
export default function PlannedBudgetForm({ section, rows, onSave }) {
  const [draft, setDraft] = useState(() => structuredClone(rows));
  const [message, setMessage] = useState('');
  const listRef = useRef(null);
  const expenses = section.key === 'expenses';

  function update(id, changes) {
    setDraft((current) => current.map((row) => (row.id === id ? { ...row, ...changes } : row)));
  }

  function addRow() {
    setDraft((current) => [
      ...current,
      {
        id: createId(),
        name: '',
        category: '',
        amountCents: 0,
        ...(expenses ? { essential: true } : {}),
      },
    ]);
    requestAnimationFrame(() => {
      const list = listRef.current;
      list?.lastElementChild?.querySelector('input')?.focus({ preventScroll: true });
      if (list) list.scrollTop = list.scrollHeight;
    });
  }

  function save(event) {
    event.preventDefault();
    if (
      draft.some(
        (row) => !row.name.trim() || !Number.isFinite(row.amountCents) || row.amountCents < 0,
      )
    ) {
      setMessage('Completa las categorías y los montos, o elimina las filas vacías.');
      return;
    }
    onSave(draft);
    setMessage('Presupuesto guardado.');
  }

  return (
    <section className="panel budget-planned" aria-labelledby="planned-title">
      <form onSubmit={save}>
        <div className="section-heading">
          <div>
            <h2 id="planned-title">Lo que planeas</h2>
            <p>Define tus {section.label.toLowerCase()} mensuales.</p>
          </div>
          <button type="button" className="button button-primary" onClick={addRow}>
            <Plus size={16} /> Agregar
          </button>
        </div>
        <div className={`planned-editor ${expenses ? 'planned-editor-expenses' : ''}`}>
          <div className="planned-column-headings" aria-hidden="true">
            <span>Categoría</span>
            <span>Monto mensual</span>
            {expenses && <span>Necesario</span>}
            <span />
          </div>
          <div
            className="planned-scroll"
            ref={listRef}
            role="region"
            aria-label={`Lista de ${section.label.toLowerCase()} planeados`}
            tabIndex={0}
          >
            {draft.map((row) => (
              <div className="planned-item" key={row.id}>
                <label className="field">
                  <span className="planned-mobile-label">Categoría</span>
                  <input
                    aria-label={`${section.label}: categoría`}
                    value={row.name}
                    placeholder="Nombre de la categoría"
                    onChange={(event) =>
                      update(row.id, { name: event.target.value, category: event.target.value })
                    }
                  />
                </label>
                <label className="field">
                  <span className="planned-mobile-label">Monto mensual</span>
                  <MoneyInput
                    aria-label={`${row.name || section.label}: monto mensual`}
                    value={row.amountCents}
                    onChange={(amountCents) => update(row.id, { amountCents })}
                  />
                </label>
                {expenses && (
                  <label className="planned-essential">
                    <input
                      type="checkbox"
                      aria-label={`${row.name || 'Gasto'}: necesario`}
                      checked={row.essential !== false}
                      onChange={(event) => update(row.id, { essential: event.target.checked })}
                    />
                    <span className="planned-mobile-label">Necesario</span>
                  </label>
                )}
                <button
                  type="button"
                  className="icon-button danger"
                  aria-label={`Eliminar ${row.name || 'fila'}`}
                  onClick={() =>
                    setDraft((current) => current.filter((item) => item.id !== row.id))
                  }
                >
                  <Trash2 size={17} />
                </button>
              </div>
            ))}
            {!draft.length && (
              <p className="empty-state">Usa Agregar para empezar tu presupuesto.</p>
            )}
          </div>
        </div>
        <div className="planned-footer">
          <span>Total de {section.label.toLowerCase()}</span>
          <strong>{formatCurrency(sumAmounts(draft))}</strong>
          <button className="button button-primary">Guardar {section.label.toLowerCase()}</button>
        </div>
        <small className="budget-currency-note">Montos en MXN</small>
        <p className="planned-status" role="status">
          {message}
        </p>
      </form>
    </section>
  );
}
