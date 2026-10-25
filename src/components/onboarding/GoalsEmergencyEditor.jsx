import { GripVertical, Plus, Trash2 } from 'lucide-react';
import MoneyInput from '../common/MoneyInput';
import { createId, formatCurrency, sumAmounts } from '../../services/budgetService';

export default function GoalsEmergencyEditor({ goals, emergencyFund, onGoalsChange, onEmergencyChange }) {
  function addGoal() {
    onGoalsChange([
      ...goals,
      { id: createId(), name: '', targetCents: 0, monthlyAmountCents: 0, targetDate: '' },
    ]);
  }

  function updateGoal(id, key, value) {
    onGoalsChange(goals.map((goal) => (goal.id === id ? { ...goal, [key]: value } : goal)));
  }

  function moveGoal(id, direction) {
    const index = goals.findIndex((goal) => goal.id === id);
    const nextIndex = index + direction;
    if (index < 0 || nextIndex < 0 || nextIndex >= goals.length) return;
    const next = [...goals];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    onGoalsChange(next);
  }

  function dropGoal(event, targetId) {
    event.preventDefault();
    const sourceId = event.dataTransfer.getData('text/plain');
    if (!sourceId || sourceId === targetId) return;
    const sourceIndex = goals.findIndex((goal) => goal.id === sourceId);
    const targetIndex = goals.findIndex((goal) => goal.id === targetId);
    if (sourceIndex < 0 || targetIndex < 0) return;
    const next = [...goals];
    const [moved] = next.splice(sourceIndex, 1);
    next.splice(targetIndex, 0, moved);
    onGoalsChange(next);
  }

  return (
    <>
      <section className="panel guided-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Primero tus metas</span>
            <h2>Metas financieras</h2>
            <p>
              Registra cuánto cuesta cada meta, cuánto podrías aportar al mes y, si lo sabes, la
              fecha en que quieres alcanzarla. Ordena las metas de más importante a menos importante.
            </p>
          </div>
          <button type="button" className="button button-secondary" onClick={addGoal}>
            <Plus size={17} /> Agregar meta
          </button>
        </div>
        <div className="goal-list" aria-label="Metas ordenadas por prioridad">
          {goals.map((goal, index) => (
            <div
              className="goal-editor-row"
              key={goal.id}
              draggable
              onDragStart={(event) => event.dataTransfer.setData('text/plain', goal.id)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => dropGoal(event, goal.id)}
            >
              <span className="goal-rank">{index + 1}</span>
              <GripVertical className="drag-icon" size={20} aria-label="Arrastrar para ordenar" />
              <label className="field">
                <span>Nombre de la meta</span>
                <input
                  value={goal.name}
                  onChange={(event) => updateGoal(goal.id, 'name', event.target.value)}
                  placeholder="Ej. Enganche de una casa"
                />
              </label>
              <label className="field">
                <span>Costo de la meta (MXN)</span>
                <MoneyInput
                  value={goal.targetCents}
                  onChange={(value) => updateGoal(goal.id, 'targetCents', value)}
                  aria-label="Costo de la meta"
                />
              </label>
              <label className="field">
                <span>Aportación mensual (MXN)</span>
                <MoneyInput
                  value={goal.monthlyAmountCents}
                  onChange={(value) => updateGoal(goal.id, 'monthlyAmountCents', value)}
                  aria-label="Aportación mensual a la meta"
                />
              </label>
              <label className="field">
                <span>Fecha objetivo (opcional)</span>
                <input
                  type="date"
                  value={goal.targetDate}
                  onChange={(event) => updateGoal(goal.id, 'targetDate', event.target.value)}
                />
              </label>
              <div className="goal-row-actions">
                <button type="button" className="icon-button" onClick={() => moveGoal(goal.id, -1)} disabled={index === 0} aria-label="Subir prioridad">↑</button>
                <button type="button" className="icon-button" onClick={() => moveGoal(goal.id, 1)} disabled={index === goals.length - 1} aria-label="Bajar prioridad">↓</button>
                <button type="button" className="icon-button danger" onClick={() => onGoalsChange(goals.filter((item) => item.id !== goal.id))} aria-label={`Eliminar ${goal.name || 'meta'}`}><Trash2 size={18} /></button>
              </div>
            </div>
          ))}
          {goals.length === 0 && <p className="empty-state">Aún no agregas metas. Puedes continuar y añadirlas después.</p>}
        </div>
        <div className="budget-total">
          <span>Total mensual destinado a metas</span>
          <strong>{formatCurrency(sumAmounts(goals.map((goal) => ({ amountCents: goal.monthlyAmountCents }))))}</strong>
        </div>
      </section>

      <section className="panel guided-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Después, tu red de seguridad</span>
            <h2>Fondo de emergencia</h2>
            <p>
              Se recomienda comenzar con 3 meses de gastos básicos para tener margen ante una
              pérdida de ingresos, una reparación o una emergencia médica. Este ahorro es distinto a tus metas.
            </p>
          </div>
        </div>
        <div className="goal-grid">
          <label className="field">
            <span>Meses que quieres cubrir</span>
            <input
              type="number"
              min="1"
              max="24"
              value={emergencyFund.targetMonths}
              onChange={(event) => onEmergencyChange({ ...emergencyFund, targetMonths: Math.max(1, Number(event.target.value) || 1) })}
            />
          </label>
          <label className="field">
            <span>Monto que ya tienes (MXN)</span>
            <MoneyInput value={emergencyFund.currentAmountCents} onChange={(value) => onEmergencyChange({ ...emergencyFund, currentAmountCents: value })} />
          </label>
          <label className="field">
            <span>Aportación mensual al fondo (MXN)</span>
            <MoneyInput value={emergencyFund.monthlyAmountCents} onChange={(value) => onEmergencyChange({ ...emergencyFund, monthlyAmountCents: value })} />
          </label>
        </div>
        <p className="guided-note">Puedes escribir una aportación mensual o dejarla en cero para pedir una recomendación después.</p>
      </section>
    </>
  );
}