import { GripVertical, Plus, Trash2, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import MoneyInput from '../common/MoneyInput';
import { createId, formatCurrency, sumAmounts } from '../../services/budgetService';

export default function GoalsEmergencyEditor({
  goals,
  emergencyFund,
  onGoalsChange,
  onEmergencyChange,
  onAnalyzeGoals,
  goalAnalysis,
  goalAnalysisLoading,
  goalAnalysisError,
}) {
  const [mode, setMode] = useState('assisted');
  const assistedAmountsUnlocked = Boolean(goalAnalysis);
  const completeGoals = goals.length > 0 && goals.every((goal) => goal.name.trim() && goal.targetCents > 0 && goal.targetDate);
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
            <span className="eyebrow">Metas financieras y ahorros</span>
            <h2>Organiza lo que quieres lograr</h2>
            <p>
              Elige la forma que mejor describe tu situación. Puedes pedirle a Plaris que proponga
              las aportaciones o registrar metas que ya tienes completamente definidas.
            </p>
          </div>
        </div>
        <div className="goal-tabs" role="tablist" aria-label="Forma de definir metas">
          <button type="button" role="tab" aria-selected={mode === 'assisted'} className={mode === 'assisted' ? 'active' : ''} onClick={() => setMode('assisted')}>
            Necesito ayuda para establecer mis metas
          </button>
          <button type="button" role="tab" aria-selected={mode === 'manual'} className={mode === 'manual' ? 'active' : ''} onClick={() => setMode('manual')}>
            Ya tengo definidas mis metas
          </button>
        </div>
        <div className="goal-mode-note">
          {mode === 'assisted'
            ? 'Conviene si todavía no sabes cuánto destinar a cada meta. Plaris revisará tu contexto, el orden de prioridad y el fondo de emergencia.'
            : 'Conviene si ya sabes cuánto cuesta cada meta, cuánto quieres aportar y cuándo quieres cumplirla. Plaris solo revisará si el plan es realista.'}
        </div>
        <div className="section-heading goal-actions-heading">
          <p>Es obligatorio indicar el nombre, costo y fecha objetivo. El monto mensual solo se desbloquea después de consultar a Plaris en la primera pestaña.</p>
          <button type="button" className="button button-secondary" onClick={addGoal}>
            <Plus size={17} /> Agregar meta
          </button>
        </div>
        <div className="emergency-goal-card">
          <div>
            <span className="eyebrow">Ahorro protegido</span>
            <strong>Fondo de emergencia</strong>
            <p>Inclúyelo desde ahora: sirve para cubrir imprevistos sin deshacer tus otras metas. Se recomienda comenzar con 3 meses de gastos básicos.</p>
          </div>
          <div className="goal-grid">
            <label className="field">
              <span>Meses que quieres cubrir</span>
              <input type="number" min="1" max="24" value={emergencyFund.targetMonths} onChange={(event) => onEmergencyChange({ ...emergencyFund, targetMonths: Math.max(1, Number(event.target.value) || 1) })} />
            </label>
            <label className="field">
              <span>Monto que ya tienes (MXN)</span>
              <MoneyInput value={emergencyFund.currentAmountCents} onChange={(value) => onEmergencyChange({ ...emergencyFund, currentAmountCents: value })} />
            </label>
            <label className="field">
              <span>Aportación mensual (MXN)</span>
              <MoneyInput value={emergencyFund.monthlyAmountCents} onChange={(value) => onEmergencyChange({ ...emergencyFund, monthlyAmountCents: value })} />
            </label>
          </div>
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
                  disabled={mode === 'assisted' && !assistedAmountsUnlocked}
                />
              </label>
              <label className="field">
                <span>Fecha objetivo</span>
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
        {mode === 'assisted' ? (
          <div className="goal-consultation">
            <button type="button" className="button button-primary" onClick={() => onAnalyzeGoals('assisted')} disabled={!completeGoals || goalAnalysisLoading}>
              <Sparkles size={17} /> {goalAnalysisLoading ? 'Analizando metas...' : 'Consultar a Plaris la aportación mensual'}
            </button>
            {!completeGoals && <small>Completa nombre, costo y fecha objetivo de todas las metas para consultar.</small>}
          </div>
        ) : (
          <div className="goal-consultation">
            <button type="button" className="button button-primary" onClick={() => onAnalyzeGoals('manual')} disabled={!completeGoals || goalAnalysisLoading}>
              <Sparkles size={17} /> {goalAnalysisLoading ? 'Revisando viabilidad...' : 'Consultar viabilidad'}
            </button>
            {!completeGoals && <small>Completa todos los campos de tus metas para consultar su viabilidad.</small>}
          </div>
        )}
        {goalAnalysisError && <p className="form-error" role="alert">{goalAnalysisError}</p>}
        {goalAnalysis?.resumen && (
          <div className="goal-analysis-result" role="status">
            <strong>Resultado de Plaris</strong>
            <p>{goalAnalysis.resumen}</p>
            {goalAnalysis.metas?.map((item) => {
              const goal = goals.find((entry) => entry.id === item.id);
              return (
                <article className="goal-feedback" key={item.id}>
                  <p><b>{goal?.name || 'Meta'}:</b> {item.aportacionMensualMXN != null && <>{goalAnalysis.mode === 'manual' ? 'Tu aportación actual' : 'Aportación calculada'}: ${Number(item.aportacionMensualMXN).toLocaleString('es-MX', { maximumFractionDigits: 2 })} MXN ({item.porcentajeDisponible || 0}% del disponible). </>}{item.explicacion}</p>
                  <p>{item.recomendacion}</p>
                  {goalAnalysis.mode === 'manual' && item.opciones?.length > 0 && (
                    <div className="goal-options">
                      <strong>Opciones calculadas</strong>
                      {item.opciones.map((option) => (
                        <p key={option.type}>
                          <b>{option.type === 'fecha' ? 'Opción 1: mantener aportación' : 'Opción 2: mantener fecha'}:</b>{' '}
                          {option.type === 'fecha'
                            ? `${formatCurrency(option.monthlyAmountCents)} al mes hasta el ${option.date}.`
                            : `${formatCurrency(option.monthlyAmountCents)} al mes, ${formatCurrency(option.differenceCents)} más que ahora${option.feasible ? '.' : '; supera el disponible mensual.'}`}
                        </p>
                      ))}
                    </div>
                  )}
                </article>
              );
            })}
            {goalAnalysis.projection?.length > 0 && (
              <div className="goal-projection-chart">
                <strong>Proyección de ahorro por meta</strong>
                <div className="chart-wrap">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={goalAnalysis.projection}>
                      <XAxis dataKey="month" tickLine={false} />
                      <YAxis tickFormatter={(value) => value >= 1000 ? `${value / 1000}k` : value} />
                      <Tooltip formatter={(value) => formatCurrency(Number(value) * 100)} />
                      {goals.map((goal, index) => <Line key={goal.id} type="monotone" dataKey={goal.name} stroke={['#106057', '#c43785', '#4169c5', '#e3a227'][index % 4]} strokeWidth={2} dot={false} />)}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

    </>
  );
}