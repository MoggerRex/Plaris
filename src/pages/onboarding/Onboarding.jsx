import { ArrowLeft, ArrowRight, Check, CircleHelp, Wallet } from 'lucide-react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import BudgetRowsEditor from '../../components/BudgetRowsEditor';
import GoalsEmergencyEditor from '../../components/onboarding/GoalsEmergencyEditor';
import OnboardingReport from '../../components/onboarding/OnboardingReport';
import { useBudget } from '../../context/useBudget';
import {
  applySurplusAllocation,
  formatCurrency,
  sumAmounts,
  unassignedAmount,
  validateZeroBasedBudget,
} from '../../services/budgetService';
import {
  analyzeOnboardingBudget,
  applyOnboardingRecommendations,
  projectionRows,
} from '../../services/onboardingAdvice';

const steps = [
  {
    slug: 'ingresos',
    title: 'Tus ingresos',
    section: 'incomes',
    description: 'Registra cuánto dinero recibes cada mes.',
  },
  {
    slug: 'gastos',
    title: 'Tus gastos',
    section: 'expenses',
    description: 'Distribuye tu ingreso entre tus categorías de gasto.',
  },
  {
    slug: 'ahorros',
    title: 'Tus ahorros',
    section: 'savings',
    description: 'Define tus objetivos de ahorro mensual.',
  },
  {
    slug: 'metas',
    title: 'Metas financieras',
    section: 'goals',
    description: 'Define qué quieres alcanzar y en qué orden de prioridad.',
  },
  {
    slug: 'emergencia',
    title: 'Fondo de emergencia',
    section: 'emergencyFund',
    description: 'Construye una reserva para imprevistos.',
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
  const [recommendationsApplied, setRecommendationsApplied] = useState(false);
  const index = steps.findIndex((step) => step.slug === routeStep);
  const activeIndex = index < 0 ? 0 : index;
  const step = steps[activeIndex];
  const rawPending = unassignedAmount(draft);
  const allocatedDraft = useMemo(
    () => applySurplusAllocation(draft, draft.surplusAllocation),
    [draft],
  );
  const validation = validateZeroBasedBudget(allocatedDraft);
  const needsSurplusChoice = rawPending > 0 && !draft.surplusAllocation;
  const validationErrors = [
    ...validation.errors,
    ...(needsSurplusChoice
      ? ['Elige si quieres ahorrar el dinero restante o dejarlo como dinero libre.']
      : []),
  ];
  const stepError = getStepError(step, draft);

  useEffect(() => {
    if (step.slug !== 'revision') return undefined;
    let cancelled = false;
    async function runAnalysis() {
      await Promise.resolve();
      if (cancelled) return;
      setAnalysisLoading(true);
      setAnalysisError('');
      setRecommendationsApplied(false);
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

  function applyRecommendations() {
    if (!analysisResult) return;
    const adjusted = applyOnboardingRecommendations(draft, analysisResult);
    updateDraft('expenses', adjusted.expenses);
    updateDraft('goals', adjusted.goals);
    updateDraft('emergencyFund', adjusted.emergencyFund);
    setRecommendationsApplied(true);
  }

  function finish() {
    if (!validation.valid) return;
    completeOnboarding();
    navigate('/dashboard');
  }

  return (
    <main className="page-shell onboarding-shell">
      <div className="onboarding-intro">
        <span className="eyebrow">
          <Wallet size={15} /> Tu punto de partida
        </span>
        <h1>Construye un presupuesto que sí cierre</h1>
        <p>
          Un presupuesto es un plan para decidir a dónde va tu dinero antes de gastarlo. Lo
          componen tus ingresos, tus gastos, tus ahorros y las metas que quieres alcanzar.
        </p>
      </div>
      <BalanceBar budget={allocatedDraft} />
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

      {step.section ? (
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
            onChange={(rows) => updateSection(step.section, rows)}
          />
        )
      ) : (
        <>
        <section className="panel">
          <div className="section-heading">
            <div>
              <h2>Tu presupuesto mensual inicial</h2>
              <p>
                Si tus ingresos superan los gastos y ahorros, elige qué hacer con la diferencia.
              </p>
            </div>
          </div>
          {rawPending > 0 && (
            <fieldset>
              <legend>
                Te quedan {formatCurrency(rawPending)} por asignar. ¿Qué prefieres hacer?
              </legend>
              <label>
                <input
                  type="radio"
                  name="surplus-allocation"
                  value="savings"
                  checked={draft.surplusAllocation === 'savings'}
                  onChange={() => updateDraft('surplusAllocation', 'savings')}
                />
                Ahorrarlo como un objetivo adicional
              </label>
              <label>
                <input
                  type="radio"
                  name="surplus-allocation"
                  value="free"
                  checked={draft.surplusAllocation === 'free'}
                  onChange={() => updateDraft('surplusAllocation', 'free')}
                />
                Dejarlo como dinero libre para gastos no planeados
              </label>
            </fieldset>
          )}
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
              amount={sumAmounts(allocatedDraft.savings)}
              tone="saving"
            />
            <ReviewTotal
              label="Dinero pendiente de asignar"
              amount={validation.pending}
              tone={validation.pending === 0 ? 'income' : 'warning'}
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
          applied={recommendationsApplied}
          onApply={applyRecommendations}
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
            disabled={!validation.valid || needsSurplusChoice}
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

function BalanceBar({ budget }) {
  const totals = validationTotals(budget);
  return (
    <aside className="onboarding-balance" aria-label="Balance mensual actual">
      <span>Balance mensual</span>
      <strong>{formatCurrency(totals.income - totals.expenses - totals.savings)}</strong>
      <small>
        Ingresos {formatCurrency(totals.income)} · asignado {formatCurrency(totals.expenses + totals.savings)}
      </small>
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
  if (step.section === 'incomes') {
    if (!draft.incomes.some((item) => item.name.trim() && item.amountCents > 0)) {
      return 'Agrega al menos un ingreso con descripción y monto mayor a cero.';
    }
    return draft.incomes.some((item) => item.amountCents > 0 && !item.name.trim())
      ? 'Completa el nombre de cada ingreso con monto.'
      : '';
  }
  if (step.section) {
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
