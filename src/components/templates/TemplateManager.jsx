import { useRef, useState } from 'react';
import DraggableTemplateCard from './DraggableTemplateCard';
import { formatCurrency, totalsForBudget } from '../../services/budgetService';

export default function TemplateManager({ month, templates, onSave, onApply, onDelete }) {
  const [targetMonth, setTargetMonth] = useState(month);
  const [deleting, setDeleting] = useState(null);
  const monthInput = useRef(null);
  const targetLabel = new Date(`${targetMonth}-01T12:00:00`).toLocaleDateString('es-MX', {
    month: 'long',
    year: 'numeric',
  });
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState(null);
  const monthName = new Date(`${month}-01T12:00:00`).toLocaleDateString('es-MX', { month: 'long' });

  function save(event) {
    event.preventDefault();
    if (!name.trim()) return;
    onSave(name.trim(), month);
    setName('');
    setMessage('Plantilla guardada con tus ingresos, gastos y ahorros planeados.');
  }

  return (
    <div className="template-manager">
      <form className="panel template-save" onSubmit={save}>
        <div className="template-save-heading">
          <div>
            <h2>Guardar este presupuesto</h2>
            <p>Ingresos, gastos y ahorros planeados de {monthName}.</p>
          </div>
        </div>
        <label className="field">
          <span>Nombre de la plantilla</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ej. Mi presupuesto mensual"
            required
            maxLength={80}
            pattern=".*\S.*"
          />
        </label>
        <button type="submit" className="button button-primary">
          Guardar plantilla
        </button>
        <small className="template-save-note">Guarda primero los cambios de tus formularios.</small>
      </form>
      {message && (
        <p className="form-success" role="status">
          {message}
        </p>
      )}
      <div className="template-list-heading">
        <h2>Tus plantillas</h2>
        <span>
          {templates.length} {templates.length === 1 ? 'guardada' : 'guardadas'}
        </span>
      </div>
      <div className="template-target-toolbar">
        <span>Cargar plantilla en</span>
        <div className="template-target-month">
          <button
            type="button"
            className="button button-quiet"
            onClick={() => {
              const input = monthInput.current;
              if (input.showPicker) input.showPicker();
              else input.focus();
            }}
          >
            {targetLabel}
          </button>
          <input
            ref={monthInput}
            type="month"
            aria-label="Mes para cargar la plantilla"
            value={targetMonth}
            onChange={(event) => {
              if (event.target.value) {
                setTargetMonth(event.target.value);
                setPending(null);
              }
            }}
            tabIndex={-1}
          />
        </div>
      </div>
      <div className="template-grid">
        {templates.map((item) => {
          const totals = totalsForBudget({
            incomes: item.budget.incomes,
            expenses: item.budget.expenses,
            savings: item.budget.savings,
          });
          const available = totals.income - totals.expenses - totals.savings;
          const date = item.updatedAt || item.createdAt;
          const dateLabel =
            date && !Number.isNaN(new Date(date).getTime())
              ? new Date(date).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
              : null;
          return (
            <DraggableTemplateCard
              key={item.id}
              id={'plantilla-' + item.id}
              name={item.name}
              onDropDelete={() => {
                onDelete(item.id);
                setDeleting(null);
                setPending(null);
                setMessage('Plantilla eliminada.');
              }}
            >
              <div className="template-card-heading">
                <h3>{item.name}</h3>
                <button
                  type="button"
                  className="template-delete"
                  aria-label={`Eliminar plantilla ${item.name}`}
                  onClick={() => {
                    setDeleting(item.id);
                    setPending(null);
                  }}
                >
                  Eliminar
                </button>
              </div>
              {dateLabel && (
                <p className="template-date">
                  {item.updatedAt ? 'Actualizada' : 'Guardada'} el {dateLabel}
                </p>
              )}
              <dl>
                <dt>Ingresos</dt>
                <dd>{formatCurrency(totals.income)}</dd>
                <dt>Gastos</dt>
                <dd>{formatCurrency(totals.expenses)}</dd>
                <dt>Ahorro</dt>
                <dd>{formatCurrency(totals.savings)}</dd>
              </dl>
              <div className="template-available">
                <span>Disponible</span>
                <strong>{formatCurrency(available)}</strong>
              </div>
              {deleting === item.id ? (
                <div className="template-confirmation">
                  <p>
                    Eliminar esta plantilla guardada no modifica tus presupuestos ni movimientos.
                  </p>
                  <div className="template-confirm-actions">
                    <button
                      type="button"
                      className="button button-quiet danger"
                      onClick={() => {
                        onDelete(item.id);
                        setDeleting(null);
                        setMessage('Plantilla eliminada.');
                      }}
                    >
                      Eliminar plantilla
                    </button>
                    <button
                      type="button"
                      className="button button-quiet"
                      onClick={() => setDeleting(null)}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : pending === item.id ? (
                <div className="template-confirmation">
                  <p>
                    Se reemplazará lo planeado de {targetLabel}. Los movimientos reales se
                    conservan.
                  </p>
                  <div className="template-confirm-actions">
                    <button
                      type="button"
                      className="button button-primary"
                      onClick={() => {
                        onApply(item.id, targetMonth);
                        setPending(null);
                        setMessage(`Plantilla cargada en ${targetLabel}.`);
                      }}
                    >
                      Confirmar carga
                    </button>
                    <button
                      type="button"
                      className="button button-quiet"
                      onClick={() => setPending(null)}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  className="button button-quiet template-use"
                  onClick={() => {
                    setPending(item.id);
                    setDeleting(null);
                  }}
                >
                  Usar en {targetLabel}
                </button>
              )}
            </DraggableTemplateCard>
          );
        })}
      </div>
      {!templates.length && (
        <p className="empty-state">
          Aún no tienes plantillas. Guarda tu presupuesto para reutilizarlo en otro mes.
        </p>
      )}
    </div>
  );
}
