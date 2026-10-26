import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { useAdvice } from '../../hooks/useAdvice';
import { toPlannerData } from '../../services/financeAdapter';
import { agentShortcuts } from '../../config/agentForms';
import AdviceResult from './AdviceResult';
import FlowForm from './forms/FlowForm';
import GoalForm from './forms/GoalForm';
import ReportsForm from './forms/ReportsForm';
import ScheduleForm from './forms/ScheduleForm';

/**
 * Props nuevas (todas opcionales):
 *  - templates:   [{ id, name }]  plantillas guardadas
 *  - goals:       [{ id, name, cost, deadlineDays, currentSaving, protectedReserve }]  (montos en centavos)
 *  - onCreateGoal(goal)          guardar la meta nueva en el perfil
 *  - onRegisterEntry(entry)      guardar un gasto/ingreso agendado
 *  - onRequest(kind, payload)    punto único para conectar la lógica / la IA
 *
 * Cada formulario entrega un `payload` limpio:
 *  flow:     { source: 'current' | templateId, plan: 'estandar' | 'avanzado' }
 *  goal:     { mode: 'existing', goalId } | { mode: 'new', goal, saveToProfile: true }
 *  report:   { report: 'comparison' | 'distribution' | 'tracking', source: { kind: 'template' | 'goal', id } }
 *  schedule: { type: 'expense' | 'income', amountCents, category }
 */
export default function AgentWorkspace({
  month,
  budget,
  profile,
  debts,
  templates = [],
  goals = [],
  onCreateGoal,
  onRegisterEntry,
  onRequest,
}) {
  const [mode, setMode] = useState('agente');
  const [lastRequest, setLastRequest] = useState(null);
  const { result, error, loading, generate } = useAdvice();
  const active = agentShortcuts.find((item) => item.id === mode);

  function dispatch(kind, payload) {
    setLastRequest({ kind, payload });

    if (kind === 'flow') {
      // TODO(lógica): analizar los datos de la plantilla elegida (payload.source).
      // Por ahora se conserva el análisis actual para que el agente siga funcionando.
      generate(toPlannerData(budget, profile, debts, month, ''), payload.plan);
      return;
    }
    if (kind === 'goal' && payload.mode === 'new') onCreateGoal?.(payload.goal);
    if (kind === 'schedule') onRegisterEntry?.(payload);
    onRequest?.(kind, payload);
  }

  return (
    <section className="agent-workspace">
      <h2>
        ¿Por dónde
        <br />
        empezamos{profile.displayName ? ', ' + profile.displayName : ''}?
      </h2>

      {/* Formulario según el atajo activo */}
      <div className="agent-composer">
        {mode === 'agente' && (
          <FlowForm
            templates={templates}
            month={month}
            busy={loading}
            onSubmit={(payload) => dispatch('flow', payload)}
          />
        )}
        {mode === 'metas' && (
          <GoalForm goals={goals} busy={loading} onSubmit={(payload) => dispatch('goal', payload)} />
        )}
        {mode === 'reportes' && (
          <ReportsForm
            templates={templates}
            goals={goals}
            busy={loading}
            onSubmit={(payload) => dispatch('report', payload)}
          />
        )}
        {mode === 'agendar' && (
          <ScheduleForm busy={loading} onSubmit={(payload) => dispatch('schedule', payload)} />
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

      {mode === 'agente' && (
        <>
          {error && (
            <p role="alert" className="validation-box warning">
              {error}
            </p>
          )}
          {loading && <p role="status">Plaris está preparando tu asesoría con Ollama…</p>}
          <AdviceResult result={result} />
        </>
      )}

      {/* Aquí se mostrará la respuesta limpia de metas, reportes y agendar */}

      {import.meta.env.DEV && lastRequest && (
        <details className="agent-dev-payload">
          <summary>Datos preparados (solo en desarrollo)</summary>
          <pre>{JSON.stringify(lastRequest, null, 2)}</pre>
        </details>
      )}
    </section>
  );
}