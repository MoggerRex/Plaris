import { budgetToGoals, goalToBudget } from '../../services/goalsAdapter';
import { useState } from 'react';
import BudgetAdviceWorkspace from './BudgetAdviceWorkspace';
import { useBudget } from '../../context/useBudget';
import { useAdvice } from '../../hooks/useAdvice';
import { usePurchaseAdvice } from '../../hooks/usePurchaseAdvice';
import { buildPurchaseAnalysis } from '../../services/purchaseAnalysis';
import { toPlannerData } from '../../services/financeAdapter';
import { primaryBudgetGoal } from '../../services/budgetConnections';
import { createId } from '../../services/budgetService';
import AdviceResult from './AdviceResult';
import { agentShortcuts } from '../../config/agentForms';
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
  goals: providedGoals,
  busy = false,
  onCreateGoal,
  onRegisterEntry,
  onRequest,
}) {
  const state = useBudget();
  const { result, error, loading, generate } = useAdvice();
  const {
    result: purchaseResult,
    error: purchaseError,
    loading: purchaseLoading,
    generate: generatePurchase,
  } = usePurchaseAdvice();
  const [notice, setNotice] = useState('');
  const goals = providedGoals || budgetToGoals(budget, profile, month);
  const availableTemplates = templates.length ? templates : state.savedTemplates || [];
  const isBusy = busy || loading || purchaseLoading;
  const [mode, setMode] = useState('agente');
  const [lastRequest, setLastRequest] = useState(null);
  const active = agentShortcuts.find((item) => item.id === mode);
  const isPurchase = lastRequest?.kind === 'purchase';
  const shownResult = isPurchase ? purchaseResult : result;
  const shownError = isPurchase ? purchaseError : error;
  const shownLoading = isPurchase ? purchaseLoading : loading;

  function dispatch(kind, payload) {
    setNotice('');
    if (kind === 'schedule') {
      setLastRequest({ kind, payload });
      const now = new Date();
      const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      state.addTransaction({
        ...payload,
        date: today.startsWith(month) ? today : month + '-01',
        description: '',
      });
      onRegisterEntry?.(payload);
      setNotice('Movimiento registrado en el mes seleccionado.');
    } else if (kind === 'purchase') {
      // La compra se evalúa con los movimientos reales del mes, no con el presupuesto planeado.
      const analysis = buildPurchaseAnalysis({
        month,
        transactions: state.transactions,
        debts,
        purchase: payload,
      });
      setLastRequest({ kind, payload, analysis });
      generatePurchase(analysis);
    } else {
      setLastRequest({ kind, payload });
      let analysisBudget = budget;
      const data = toPlannerData(
        budget,
        profile,
        debts,
        month,
        JSON.stringify({ kind, ...payload }),
      );
      if (kind === 'goal') {
        const goal =
          payload.mode === 'new' ? payload.goal : goals.find((item) => item.id === payload.goalId);
        if (!goal) return;
        data.goal = { name: goal.name, cost: goal.cost / 100, days: Number(goal.deadlineDays) };
        data.savings = goal.currentSaving / 100;
        data.reserve = goal.protectedReserve / 100;
        if (payload.mode === 'new') {
          state.updateBudget(month, 'goals', [
            ...(budget.goals || []),
            goalToBudget(goal, month, createId()),
          ]);
          onCreateGoal?.(goal);
          setNotice('Meta guardada en el presupuesto del mes seleccionado.');
        }
      }
      if (kind === 'report') {
        if (payload.source.kind === 'template') {
          const template = availableTemplates.find((item) => item.id === payload.source.id);
          if (template) analysisBudget = template.budget;
        }
        const reportData = toPlannerData(analysisBudget, profile, debts, month, data.context);
        const goal = goals.find((item) => item.id === payload.source.id);
        reportData.goal = goal
          ? { name: goal.name, cost: goal.cost / 100, days: goal.deadlineDays }
          : primaryBudgetGoal(analysisBudget, profile, month);
        generate(reportData, 'estandar');
      } else generate(data, 'estandar');
    }
    onRequest?.(kind, payload);
  }

  if (mode === 'plan')
    return (
      <div className="agent-workspace-combined">
        <button className="button button-secondary" type="button" onClick={() => setMode('agente')}>
          Volver a los atajos del agente
        </button>
        <BudgetAdviceWorkspace month={month} budget={budget} profile={profile} debts={debts} />
      </div>
    );

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
          <PurchaseForm busy={isBusy} onSubmit={(payload) => dispatch('purchase', payload)} />
        )}
        {mode === 'metas' && (
          <GoalForm goals={goals} busy={isBusy} onSubmit={(payload) => dispatch('goal', payload)} />
        )}
        {mode === 'reportes' && (
          <ReportsForm
            templates={availableTemplates}
            goals={goals}
            busy={isBusy}
            onSubmit={(payload) => dispatch('report', payload)}
          />
        )}
        {mode === 'agendar' && (
          <ScheduleForm busy={isBusy} onSubmit={(payload) => dispatch('schedule', payload)} />
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
              disabled={isBusy}
              onClick={() => setMode(id)}
            >
              {Icon ? <Icon size={16} /> : <span>Φ</span>} {label}
            </button>
          ))}
        </div>
      </div>

      {notice && <p role="status">{notice}</p>}
      {shownError && (
        <p role="alert" className="validation-box warning">
          {shownError}
        </p>
      )}
      {shownLoading && <p role="status">Plaris está preparando tu asesoría con Ollama…</p>}
      <AdviceResult result={shownResult} />
      {import.meta.env.DEV && lastRequest && (
        <details className="agent-dev-payload">
          <summary>Datos preparados (solo en desarrollo)</summary>
          <pre>{JSON.stringify(lastRequest, null, 2)}</pre>
        </details>
      )}
    </section>
  );
}
