import { useState } from 'react';
import { formatCurrency, totalsForBudget } from '../../services/budgetService';

export default function TemplateManager({ month, templates, onSave, onApply }) {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState(null);
  function save(event) {
    event.preventDefault();
    onSave(name, month);
    setName('');
    setMessage('Plantilla guardada con ingresos, gastos, ahorros, deudas y meta.');
  }
  return (
    <>
      <form className="panel template-save" onSubmit={save}>
        <div>
          <h2>Guardar mi presupuesto como plantilla</h2>
          <p>
            Se guardará una copia de los datos del mes {month}. Tus movimientos reales permanecen
            separados.
          </p>
        </div>
        <label className="field">
          <span>Nombre de la plantilla</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ej. Presupuesto familiar"
            required
            maxLength={80}
            pattern=".*\S.*"
          />
        </label>
        <button className="button button-primary">Guardar plantilla</button>
      </form>
      {message && <p role="status">{message}</p>}
      <div className="template-grid">
        {templates.map((item) => {
          const totals = totalsForBudget(item.budget);
          return (
            <article className="panel template-card" key={item.id} id={'plantilla-' + item.id}>
              <span className="eyebrow">Presupuesto guardado</span>
              <h2>{item.name}</h2>
              <dl>
                <dt>Ingresos</dt>
                <dd>{formatCurrency(totals.income)}</dd>
                <dt>Gastos</dt>
                <dd>{formatCurrency(totals.expenses)}</dd>
                <dt>Ahorros</dt>
                <dd>{formatCurrency(totals.savings)}</dd>
                <dt>Deudas</dt>
                <dd>{item.debts.length}</dd>
              </dl>
              {pending === item.id ? (
                <div className="validation-box">
                  <p>
                    Se reemplazará el presupuesto de {month}, el perfil, la meta y las deudas
                    actuales con esta copia. Los movimientos reales se conservan.
                  </p>
                  <button
                    className="button button-primary"
                    onClick={() => {
                      onApply(item.id, month);
                      setPending(null);
                      setMessage('Plantilla aplicada al mes ' + month + '.');
                    }}
                  >
                    Aplicar esta copia
                  </button>
                  <button className="button button-quiet" onClick={() => setPending(null)}>
                    Cancelar
                  </button>
                </div>
              ) : (
                <button className="button button-secondary" onClick={() => setPending(item.id)}>
                  Usar en {month}
                </button>
              )}
            </article>
          );
        })}
      </div>
      {!templates.length && (
        <p className="empty-state">
          Ponle nombre a tu primer presupuesto para reutilizarlo después.
        </p>
      )}
    </>
  );
}
