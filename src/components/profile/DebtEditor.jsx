import { Plus, Trash2 } from 'lucide-react';
import { createId } from '../../services/budgetService';

const numericFields = [
  ['balance', 'Saldo pendiente (MXN)'],
  ['payment', 'Pago mensual (MXN)'],
  ['minimum', 'Pago mínimo (MXN)'],
  ['rate', 'Tasa de interés (%)'],
];

export default function DebtEditor({ rows, onChange }) {
  function update(id, key, value) {
    onChange(rows.map((row) => (row.id === id ? { ...row, [key]: value } : row)));
  }

  function add() {
    onChange([
      ...rows,
      { id: createId(), name: '', balance: 0, payment: 0, minimum: 0, rate: 0, rateType: 'anual' },
    ]);
  }

  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <h2>Tus deudas</h2>
          <p>Separa los pagos de deuda de los gastos para evitar contarlos dos veces.</p>
        </div>
        <button type="button" className="button button-secondary" onClick={add}>
          <Plus size={16} /> Agregar deuda
        </button>
      </div>
      {rows.map((row) => (
        <fieldset className="debt-row" key={row.id}>
          <legend>{row.name || 'Nueva deuda'}</legend>
          <label className="field">
            <span>Nombre o institución</span>
            <input
              value={row.name}
              onChange={(event) => update(row.id, 'name', event.target.value)}
              required
            />
          </label>
          {numericFields.map(([key, label]) => (
            <label className="field" key={key}>
              <span>{label}</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={row[key]}
                onChange={(event) =>
                  update(row.id, key, event.target.value === '' ? '' : Number(event.target.value))
                }
                required
              />
            </label>
          ))}
          <label className="field">
            <span>Periodo de la tasa</span>
            <select
              value={row.rateType}
              onChange={(event) => update(row.id, 'rateType', event.target.value)}
            >
              <option value="anual">Anual</option>
              <option value="mensual">Mensual</option>
            </select>
          </label>
          <button
            type="button"
            className="button button-quiet danger"
            onClick={() => onChange(rows.filter((item) => item.id !== row.id))}
          >
            <Trash2 size={16} /> Quitar deuda
          </button>
        </fieldset>
      ))}
      {!rows.length && <p className="empty-state">No has registrado deudas.</p>}
    </section>
  );
}
