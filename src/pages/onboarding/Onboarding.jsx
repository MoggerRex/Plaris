import { ArrowLeft, ArrowRight, Check, CircleHelp, Wallet } from 'lucide-react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import BudgetRowsEditor from '../../components/BudgetRowsEditor';
import GoalsEmergencyEditor from '../../components/onboarding/GoalsEmergencyEditor';
import OnboardingReport from '../../components/onboarding/OnboardingReport';
import { useBudget } from '../../context/useBudget';
import {
  formatCurrency,
  sumAmounts,
  validateZeroBasedBudget,
} from '../../services/budgetService';
import {
  analyzeOnboardingBudget,
  projectionRows,
} from '../../services/onboardingAdvice';

const steps = [
  {
    slug: 'intro',
    title: '¿Qué es un presupuesto?',
    section: 'intro',
    description: 'Conoce cómo se organiza tu dinero antes de comenzar a registrarlo.',
  },
  {
    slug: 'ingresos',
    title: 'Tus ingresos',
    section: 'incomes',
    description: 'Aquí puedes registrar las diferentes fuentes de ingresos que tienes, como un trabajo de oficina, trabajo independiente, comisiones o cualquier otra entrada de dinero mensual.',
  },
  {
    slug: 'gastos',
    title: 'Tus gastos',
    section: 'expenses',
    description: 'Marca como necesario un gasto indispensable para mantener tu vida y tus compromisos; desmárcalo si puedes reducirlo o posponerlo, para que Plaris sepa dónde existe margen de ajuste.',
  },
  {
    slug: 'ahorros',
    title: 'Tus ahorros',
    section: 'savings',
    description: 'Organiza tus metas, ahorros definidos y fondo de emergencia.',
  },
  {
    slug: 'revision',
    title: 'Revisión',
    section: null,
    description: 'Comprueba que cada peso tenga un destino.',
  },
];

export default function Onboarding() {
  const { step: routeStep = 'ingresos' } = useParams();
  const navigate = useNavigate();
  const { onboardingComplete, draft, updateDraft, completeOnboarding, storageError } = useBudget();
  const [showGuide, setShowGuide] = useState(true);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState('');
  const [goalAnalysis, setGoalAnalysis] = useState(null);
  const [goalAnalysisLoading, setGoalAnalysisLoading] = useState(false);
  const [goalAnalysisError, setGoalAnalysisError] = useState('');
  const index = steps.findIndex((step) => step.slug === routeStep);
  const activeIndex = index < 0 ? 0 : index;
  const step = steps[activeIndex];
  const allocatedDraft = useMemo(() => draft, [draft]);
  const validation = validateZeroBasedBudget(allocatedDraft);
  const validationErrors = validation.errors;
  const stepError = getStepError(step, draft);

  useEffect(() => {
    if (step.slug !== 'revision') return undefined;
    let cancelled = false;
    async function runAnalysis() {
      await Promise.resolve();
      if (cancelled) return;
      setAnalysisLoading(true);
      setAnalysisError('');
      try {
        const result = await analyzeOnboardingBudget(allocatedDraft);
        if (!cancelled) setAnalysisResult({ ...result, projection: projectionRows(result.analysis) });
      } catch (error) {
        if (!cancelled) setAnalysisError(error.message || 'No se pudo preparar el reporte.');
      } finally {
        if (!cancelled) setAnalysisLoading(false);
      }
    }
    runAnalysis();
    return () => { cancelled = true; };
  }, [step.slug, allocatedDraft]);

  if (onboardingComplete) return <Navigate to="/dashboard" replace />;
  if (index < 0) return <Navigate to="/onboarding/ingresos" replace />;

  function goToStep(nextIndex) {
    navigate(`/onboarding/${steps[nextIndex].slug}`);
  }

  function next() {
    if (stepError) return;
    goToStep(activeIndex + 1);
  }

  function updateSection(section, value) {
    setShowGuide(false);
    updateDraft(section, value);
  }

  async function analyzeGoals(mode) {
    setGoalAnalysisLoading(true);
    setGoalAnalysisError('');
    try {
      const requestDraft = mode === 'assisted'
        ? { ...draft, goals: draft.goals.map((goal) => ({ ...goal, monthlyAmountCents: 0 })) }
        : draft;
      const result = await analyzeOnboardingBudget(requestDraft, mode);
      setGoalAnalysis(result);
      if (mode === 'assisted') {
        const amounts = new Map((result.ajustes?.aportacionesMetas || []).map((item) => [item.id, Number(item.monthlyAmountCents) || 0]));
        updateDraft('goals', draft.goals.map((goal) => amounts.has(goal.id) ? { ...goal, monthlyAmountCents: amounts.get(goal.id) } : goal));
      }
    } catch (error) {
      setGoalAnalysisError(error.message || 'No se pudo consultar a Plaris.');
    } finally {
      setGoalAnalysisLoading(false);
    }
  }

  function finish() {
    if (!validation.valid) return;
    completeOnboarding();
    navigate('/dashboard');
  }

  return (
    <main className="page-shell onboarding-shell">
      {step.slug !== 'intro' && <div className="onboarding-intro"><span className="eyebrow"><Wallet size={15} /> Tu punto de partida</span><h1>Tu presupuesto, paso a paso</h1></div>}
      {step.slug !== 'intro' && <BalanceBar budget={allocatedDraft} />}
      <div className="progress-wrap" aria-label={`Paso ${activeIndex + 1} de ${steps.length}`}>
        <div className="progress-meta">
          <span>
            Paso {activeIndex + 1} de {steps.length}
          </span>
          <span>{Math.round(((activeIndex + 1) / steps.length) * 100)}%</span>
        </div>
        <progress max={steps.length} value={activeIndex + 1} />
        <div className="step-labels">
          {steps.map((item, stepIndex) => (
            <button
              type="button"
              key={item.slug}
              onClick={() => stepIndex <= activeIndex && goToStep(stepIndex)}
              className={
                stepIndex === activeIndex ? 'current' : stepIndex < activeIndex ? 'complete' : ''
              }
            >
              {stepIndex < activeIndex ? <Check size={14} /> : stepIndex + 1}{' '}
              <span>{item.title}</span>
            </button>
          ))}
        </div>
      </div>

      {step.section === 'intro' ? (
        <IntroStep />
      ) : step.section === 'savings' ? (
        <GoalsEmergencyEditor
          goals={draft.goals}
          emergencyFund={draft.emergencyFund}
          onGoalsChange={(value) => updateSection('goals', value)}
          onEmergencyChange={(value) => updateSection('emergencyFund', value)}
          onAnalyzeGoals={analyzeGoals}
          goalAnalysis={goalAnalysis}
          goalAnalysisLoading={goalAnalysisLoading}
          goalAnalysisError={goalAnalysisError}
        />
      ) : step.section ? (
        step.section === 'goals' || step.section === 'emergencyFund' ? (
          <GoalsEmergencyEditor
            goals={draft.goals}
            emergencyFund={draft.emergencyFund}
            onGoalsChange={(value) => updateSection('goals', value)}
            onEmergencyChange={(value) => updateSection('emergencyFund', value)}
          />
        ) : (
          <BudgetRowsEditor
            label={step.title}
            section={step.section}
            rows={draft[step.section]}
            description={step.description}
            onChange={(rows) => updateSection(step.section, rows)}
          />
        )
      ) : (
        <>
        <section className="panel">
          <div className="section-heading">
            <div>
              <h2>Revisión de tu presupuesto</h2>
              <p>Plaris resume la distribución que acabas de planear y sus proyecciones.</p>
            </div>
          </div>
          <div className="review-grid">
            <ReviewTotal
              label="Ingresos planeados"
              amount={sumAmounts(allocatedDraft.incomes)}
              tone="income"
            />
            <ReviewTotal
              label="Gastos planeados"
              amount={sumAmounts(allocatedDraft.expenses)}
              tone="expense"
            />
            <ReviewTotal
              label="Ahorros planeados"
              amount={validation.totals.savings}
              tone="saving"
            />
          </div>
          <div
            className={validation.valid ? 'validation-box success' : 'validation-box warning'}
            role="status"
          >
            {validation.valid
              ? '¡Listo! Ingresos, gastos y ahorros están balanceados. Puedes finalizar.'
              : validationErrors.map((message) => <p key={message}>{message}</p>)}
          </div>
          <p className="review-note">
            El ingreso se distribuye entre gastos, ahorro y dinero libre. Los importes se calculan
            al centavo.
          </p>
        </section>
        {analysisLoading && <section className="panel report-loading" role="status">Plaris está preparando tu reporte y tus proyecciones...</section>}
        {analysisError && <div className="validation-box warning" role="alert">{analysisError}</div>}
        <OnboardingReport
          result={analysisResult}
        />
        </>
      )}

      {storageError && (
        <div className="validation-box warning" role="alert">
          {storageError}
        </div>
      )}
      {stepError && (
        <p className="form-error step-error" role="alert">
          {stepError}
        </p>
      )}
      <div className="step-actions">
        <button
          type="button"
          className="button button-quiet"
          onClick={() => goToStep(activeIndex - 1)}
          disabled={activeIndex === 0}
        >
          <ArrowLeft size={17} /> Anterior
        </button>
        {activeIndex < steps.length - 1 ? (
          <button
            type="button"
            className="button button-primary"
            onClick={next}
            disabled={Boolean(stepError)}
          >
            Siguiente <ArrowRight size={17} />
          </button>
        ) : (
          <button
            type="button"
            className="button button-primary"
            onClick={finish}
            disabled={!validation.valid}
          >
            <Check size={17} /> Finalizar configuración
          </button>
        )}
      </div>
      <GuideOverlay
        step={step}
        visible={showGuide}
        onDismiss={() => setShowGuide(false)}
        onShow={() => setShowGuide(true)}
      />
    </main>
  );
}

function IntroStep() {
  return (
    <section className="panel onboarding-explainer">
      <span className="eyebrow">Antes de comenzar</span>
      <h2>¿Qué es un presupuesto?</h2>
      <p>
        Un presupuesto es un mapa sencillo de tu dinero: muestra cuánto recibes, qué necesitas
        pagar y qué cantidad puedes reservar para construir tus planes.
      </p>
      <div className="budget-concepts">
        <article><strong>Ingresos</strong><p>El dinero que recibes, como un trabajo de oficina o un trabajo independiente.</p></article>
        <article><strong>Gastos</strong><p>Los pagos que haces cada mes. Marcar los necesarios ayuda a proteger lo indispensable.</p></article>
        <article><strong>Ahorros</strong><p>El dinero que separas para metas financieras y para tu fondo de emergencia.</p></article>
      </div>
      <p className="guided-note">En los siguientes pasos registraremos cada parte y veremos cómo se relacionan.</p>
    </section>
  );
}

function BalanceBar({ budget }) {
  const totals = validationTotals(budget);
  return (
    <aside className="onboarding-balance" aria-label="Balance mensual actual">
      <span className="balance-label">Balance mensual</span>
      <div className="balance-metric"><small>Ingresos</small><strong>{formatCurrency(totals.income)}</strong></div>
      <div className="balance-metric"><small>Asignado</small><strong>{formatCurrency(totals.expenses + totals.savings)}</strong></div>
      <div className="balance-metric balance-result"><small>Disponible</small><strong>{formatCurrency(totals.income - totals.expenses - totals.savings)}</strong></div>
    </aside>
  );
}

function validationTotals(budget) {
  return {
    income: sumAmounts(budget.incomes),
    expenses: sumAmounts(budget.expenses),
    savings:
      sumAmounts(budget.savings) +
      sumAmounts((budget.goals || []).map((goal) => ({ amountCents: goal.monthlyAmountCents }))) +
      Number(budget.emergencyFund?.monthlyAmountCents || 0),
  };
}

function GuideOverlay({ step, visible, onDismiss, onShow }) {
  return (
    <>
      {!visible && (
        <button type="button" className="guide-reopen" onClick={onShow}>
          <CircleHelp size={16} /> Ver explicación
        </button>
      )}
      {visible && (
        <div className="guided-overlay" role="status">
          <div className="guided-tooltip">
            <span className="eyebrow">Paso guiado</span>
            <strong>{step.title}</strong>
            <p>{step.description}</p>
            <button type="button" className="button button-secondary" onClick={onDismiss}>Entendido</button>
          </div>
        </div>
      )}
    </>
  );
}

function ReviewTotal({ label, amount, tone }) {
  return (
    <div className={`review-total ${tone}`}>
      <span>{label}</span>
      <strong>{formatCurrency(amount)}</strong>
    </div>
  );
}

function getStepError(step, draft) {
  if (step.section === 'intro') return '';
  if (step.section === 'incomes') {
    if (!draft.incomes.some((item) => item.name.trim() && item.amountCents > 0)) {
      return 'Agrega al menos un ingreso con descripción y monto mayor a cero.';
    }
    return draft.incomes.some((item) => item.amountCents > 0 && !item.name.trim())
      ? 'Completa el nombre de cada ingreso con monto.'
      : '';
  }
  if (step.section) {
    if (step.section === 'savings') {
      if (draft.goals.some((goal) => !goal.name.trim() || goal.targetCents <= 0 || !goal.targetDate)) {
        return 'Completa el nombre, costo y fecha objetivo de cada meta.';
      }
      if (draft.goals.some((goal) => goal.monthlyAmountCents <= 0)) {
        return 'Consulta a Plaris o registra una aportación mensual para cada meta.';
      }
      const availableForGoals = sumAmounts(draft.incomes) - sumAmounts(draft.expenses) - sumAmounts(draft.savings) - Number(draft.emergencyFund?.monthlyAmountCents || 0);
      const plannedGoals = sumAmounts(draft.goals.map((goal) => ({ amountCents: goal.monthlyAmountCents })));
      if (plannedGoals > availableForGoals) {
        return `Las aportaciones de metas superan el disponible mensual de ${formatCurrency(Math.max(0, availableForGoals))}. Ajusta los montos antes de continuar.`;
      }
      return draft.savings.some((item) => item.amountCents > 0 && !item.name.trim())
        ? 'Completa el nombre de cada ahorro con monto.'
        : '';
    }
    if (step.section === 'goals') {
      return draft.goals.some((goal) => (goal.targetCents > 0 || goal.monthlyAmountCents > 0) && !goal.name.trim())
        ? 'Completa el nombre de cada meta que tenga un monto.'
        : '';
    }
    if (step.section === 'emergencyFund') return '';
    return draft[step.section].some((item) => item.amountCents > 0 && !item.name.trim())
      ? 'Completa el nombre de cada categoría u objetivo con monto.'
      : '';
  }
  return '';
}
