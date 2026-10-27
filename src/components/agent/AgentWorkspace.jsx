import { useState } from 'react';
import { agentShortcuts } from '../../config/agentForms';
import PurchaseForm from './forms/PurchaseForm';
import GoalForm from './forms/GoalForm';
import ReportsForm from './forms/ReportsForm';
import ScheduleForm from './forms/ScheduleForm';

export default function AgentWorkspace({
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

  function dispatch(kind, payload) {
    setLastRequest({ kind, payload });
    if (kind === 'goal' && payload.mode === 'new') onCreateGoal?.(payload.goal);
    if (kind === 'schedule') onRegisterEntry?.(payload);
    onRequest?.(kind, payload);
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

      {import.meta.env.DEV && lastRequest && (
        <details className="agent-dev-payload">
          <summary>Datos preparados (solo en desarrollo)</summary>
          <pre>{JSON.stringify(lastRequest, null, 2)}</pre>
        </details>
      )}
    </section>
  );
}