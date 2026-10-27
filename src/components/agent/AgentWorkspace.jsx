import { useState } from 'react';
import { agentShortcuts } from '../../config/agentForms';
import { useAdvice } from '../../hooks/useAdvice';
import { toPlannerData } from '../../services/financeAdapter';
import AdviceResult from './AdviceResult';
import PurchaseForm from './forms/PurchaseForm';
import GoalForm from './forms/GoalForm';
import ReportsForm from './forms/ReportsForm';
import ScheduleForm from './forms/ScheduleForm';

export default function AgentWorkspace({
  month,
  budget,
  debts,
  profile,
  templates = [],
  goals = [],
  busy = false,
  onCreateGoal,
  onRegisterEntry,
  onRequest,
}) {
  const [mode, setMode] = useState('agente');
  const [lastRequest, setLastRequest] = useState(null);
  const active = agentShortcuts.find((item) => item.id === mode);
  const { result, error, loading, generate } = useAdvice();
  busy = busy || loading;

  function dispatch(kind, payload) {
    setLastRequest({ kind, payload });
    if (kind === 'goal' && payload.mode === 'new') onCreateGoal?.(payload.goal);
    if (kind === 'schedule') onRegisterEntry?.(payload);
    onRequest?.(kind, payload);
    if (kind === 'schedule') return;
    const template =
      kind === 'report' && payload.source.kind === 'template'
        ? templates.find((item) => item.id === payload.source.id)
        : null;
    const data = toPlannerData(
      template?.budget || budget,
      profile,
      debts,
      month,
      `Solicitud: ${kind}. Datos del usuario: ${JSON.stringify(payload)}. Los campos cost, currentSaving, protectedReserve y priceCents están en centavos MXN.`,
    );
    const goal =
      kind === 'purchase'
        ? { name: payload.name, cost: payload.priceCents, deadlineDays: data.goal.days }
        : kind === 'goal'
          ? payload.goal || goals.find((item) => item.id === payload.goalId)
          : payload.source.kind === 'goal'
            ? goals.find((item) => item.id === payload.source.id)
            : null;
    if (goal) {
      data.goal = { name: goal.name, cost: goal.cost / 100, days: Number(goal.deadlineDays) };
      if (kind === 'goal') {
        data.savings = goal.currentSaving / 100;
        data.reserve = goal.protectedReserve / 100;
      }
    }
    generate(data, 'estandar');
  }

  return (
    <section className="agent-workspace">
      <h2>
        {active.titleLine1}
        <br />
        {active.titleLine2}
      </h2>

      {/* Formulario según el atajo activo */}
      <div className="agent-composer">
        {mode === 'agente' && (
          <PurchaseForm busy={busy} onSubmit={(payload) => dispatch('purchase', payload)} />
        )}
        {mode === 'metas' && (
          <GoalForm goals={goals} busy={busy} onSubmit={(payload) => dispatch('goal', payload)} />
        )}
        {mode === 'reportes' && (
          <ReportsForm
            templates={templates}
            goals={goals}
            busy={busy}
            onSubmit={(payload) => dispatch('report', payload)}
          />
        )}
        {mode === 'agendar' && (
          <ScheduleForm busy={busy} onSubmit={(payload) => dispatch('schedule', payload)} />
        )}

        <p className="agent-form-hint">{active.hint}</p>

        {/* Atajos */}
        <div className="agent-quick-actions" role="group" aria-label="Atajos del agente">
          {agentShortcuts.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              className="pill-button"
              aria-pressed={mode === id}
              onClick={() => setMode(id)}
            >
              {Icon ? <Icon size={16} /> : <span>Φ</span>} {label}
            </button>
          ))}
        </div>
      </div>

      {loading && <p role="status">Plaris está analizando tu solicitud…</p>}
      {error && (
        <p role="alert" className="validation-box warning">
          {error}
        </p>
      )}
      {result && <AdviceResult result={result} />}
      {lastRequest?.kind === 'schedule' && <p role="status">Movimiento registrado.</p>}
      {import.meta.env.DEV && lastRequest && (
        <details className="agent-dev-payload">
          <summary>Datos preparados (solo en desarrollo)</summary>
          <pre>{JSON.stringify(lastRequest, null, 2)}</pre>
        </details>
      )}
    </section>
  );
}
