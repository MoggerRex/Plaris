import { Plus, Trash2 } from 'lucide-react';
import {
  amountToCents,
  centsToInput,
  createId,
  formatCurrency,
  sumAmounts,
} from '../services/budgetService';

export default function BudgetRowsEditor({ section, rows, onChange, label, showCategory = false }) {
  function updateRow(id, key, value) {
    onChange(rows.map((row) => row.id === id
      ? {
        ...row,
        [key]: key === 'amountCents' ? amountToCents(value) : value,
        ...(key === 'name' && section !== 'incomes' ? { category: value } : {}),
      }
      : row));
  }

  function addRow() {
    onChange([...rows, { id: createId(), name: '', category: '', amountCents: 0 }]);
  }

  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <h2>{label}</h2>
          <p>Asigna montos mensuales en pesos mexicanos.</p>
        </div>
        <button type="button" className="button button-secondary" onClick={addRow}>
          <Plus size={17} /> Agregar
        </button>
      </div>
      <div className="budget-rows">
        {rows.map((row) => (
          <div className={`budget-row${showCategory ? ' with-category' : ''}`} key={row.id}>
            <label className="field">
              <span>{section === 'incomes' ? 'Fuente de ingreso' : 'Categoría u objetivo'}</span>
              <input
                value={row.name}
                onChange={(event) => updateRow(row.id, 'name', event.target.value)}
                placeholder={section === 'incomes' ? 'Ej. Sueldo' : 'Ej. Vivienda'}
                aria-label={`${label}: nombre`}
              />
            </label>
            {showCategory && (
              <label className="field">
                <span>Categoría</span>
                <input
                  value={row.category}
                  onChange={(event) => updateRow(row.id, 'category', event.target.value)}
                  placeholder="Ej. Trabajo"
                />
              </label>
            )}
            <label className="field">
              <span>Monto mensual (MXN)</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={centsToInput(row.amountCents)}
                onChange={(event) => updateRow(row.id, 'amountCents', event.target.value)}
                aria-label={`${label}: monto mensual`}
              />
            </label>
            {section === 'expenses' && <label className="essential-choice"><input type="checkbox" checked={row.essential !== false} onChange={event => updateRow(row.id, 'essential', event.target.checked)} /> Necesario</label>}
            <button
              type="button"
              className="icon-button danger"
              onClick={() => onChange(rows.filter((item) => item.id !== row.id))}
              aria-label={`Eliminar ${row.name || 'fila'}`}
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
        {rows.length === 0 && <p className="empty-state">Aún no agregas elementos.</p>}
      </div>
      <div className="budget-total"><span>Total mensual planeado</span><strong>{formatCurrency(sumAmounts(rows))}</strong></div>
    </section>
  );
}
