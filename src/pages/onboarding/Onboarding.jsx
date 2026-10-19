import { ArrowLeft, ArrowRight, Check, Wallet } from 'lucide-react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import BudgetRowsEditor from '../../components/BudgetRowsEditor';
import { useBudget } from '../../context/useBudget';
import {
  applySurplusAllocation,
  formatCurrency,
  sumAmounts,
  unassignedAmount,
  validateZeroBasedBudget,
} from '../../services/budgetService';

const steps = [
  { slug: 'ingresos', title: 'Tus ingresos', section: 'incomes', description: 'Registra cuánto dinero recibes cada mes.' },
  { slug: 'gastos', title: 'Tus gastos', section: 'expenses', description: 'Distribuye tu ingreso entre tus categorías de gasto.' },
  { slug: 'ahorros', title: 'Tus ahorros', section: 'savings', description: 'Define tus objetivos de ahorro mensual.' },
  { slug: 'revision', title: 'Revisión', section: null, description: 'Comprueba que cada peso tenga un destino.' },
];

export default function Onboarding() {
  const { step: routeStep = 'ingresos' } = useParams();
  const navigate = useNavigate();
  const { onboardingComplete, draft, updateDraft, completeOnboarding, storageError } = useBudget();
  const index = steps.findIndex((step) => step.slug === routeStep);
  const activeIndex = index < 0 ? 0 : index;
  const step = steps[activeIndex];
  const rawPending = unassignedAmount(draft);
  const allocatedDraft = applySurplusAllocation(draft, draft.surplusAllocation);
  const validation = validateZeroBasedBudget(allocatedDraft);
  const needsSurplusChoice = rawPending > 0 && !draft.surplusAllocation;
  const validationErrors = [
    ...validation.errors,
    ...(needsSurplusChoice ? ['Elige si quieres ahorrar el dinero restante o dejarlo como dinero libre.'] : []),
  ];
  const stepError = getStepError(step, draft);

  if (onboardingComplete) return <Navigate to="/dashboard" replace />;
  if (index < 0) return <Navigate to="/onboarding/ingresos" replace />;

  function goToStep(nextIndex) {
    navigate(`/onboarding/${steps[nextIndex].slug}`);
  }

  function next() {
    if (stepError) return;
    goToStep(activeIndex + 1);
  }

  function finish() {
    if (!validation.valid) return;
    completeOnboarding();
    navigate('/dashboard');
  }

  return (
    <main className="page-shell onboarding-shell">
      <div className="onboarding-intro">
        <span className="eyebrow"><Wallet size={15} /> Tu punto de partida</span>
        <h1>Construye un presupuesto que sí cierre</h1>
        <p>Cuatro pasos para repartir tu ingreso mensual con intención.</p>
      </div>
      <div className="progress-wrap" aria-label={`Paso ${activeIndex + 1} de ${steps.length}`}>
        <div className="progress-meta"><span>Paso {activeIndex + 1} de {steps.length}</span><span>{Math.round(((activeIndex + 1) / steps.length) * 100)}%</span></div>
        <progress max={steps.length} value={activeIndex + 1} />
        <div className="step-labels">{steps.map((item, stepIndex) => (
          <button type="button" key={item.slug} onClick={() => stepIndex <= activeIndex && goToStep(stepIndex)} className={stepIndex === activeIndex ? 'current' : stepIndex < activeIndex ? 'complete' : ''}>
            {stepIndex < activeIndex ? <Check size={14} /> : stepIndex + 1} <span>{item.title}</span>
          </button>
        ))}</div>
      </div>

      {step.section ? (
        <BudgetRowsEditor
          label={step.title}
          section={step.section}
          rows={draft[step.section]}
          onChange={(rows) => updateDraft(step.section, rows)}
          showCategory={step.section === 'incomes'}
        />
      ) : (
        <section className="panel">
          <div className="section-heading">
            <div><h2>Tu presupuesto mensual inicial</h2><p>Si tus ingresos superan los gastos y ahorros, elige qué hacer con la diferencia.</p></div>
          </div>
          {rawPending > 0 && (
            <fieldset>
              <legend>Te quedan {formatCurrency(rawPending)} por asignar. ¿Qué prefieres hacer?</legend>
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
            <ReviewTotal label="Ingresos planeados" amount={sumAmounts(allocatedDraft.incomes)} tone="income" />
            <ReviewTotal label="Gastos planeados" amount={sumAmounts(allocatedDraft.expenses)} tone="expense" />
            <ReviewTotal label="Ahorros planeados" amount={sumAmounts(allocatedDraft.savings)} tone="saving" />
            <ReviewTotal label="Dinero pendiente de asignar" amount={validation.pending} tone={validation.pending === 0 ? 'income' : 'warning'} />
          </div>
          <div className={validation.valid ? 'validation-box success' : 'validation-box warning'} role="status">
            {validation.valid
              ? '¡Listo! Ingresos, gastos y ahorros están balanceados. Puedes finalizar.'
              : validationErrors.map((message) => <p key={message}>{message}</p>)}
          </div>
          <p className="review-note">El ingreso se distribuye entre gastos, ahorro y dinero libre. Los importes se calculan al centavo.</p>
        </section>
      )}

      {storageError && <div className="validation-box warning" role="alert">{storageError}</div>}
      {stepError && <p className="form-error step-error" role="alert">{stepError}</p>}
      <div className="step-actions">
        <button type="button" className="button button-quiet" onClick={() => goToStep(activeIndex - 1)} disabled={activeIndex === 0}>
          <ArrowLeft size={17} /> Anterior
        </button>
        {activeIndex < steps.length - 1
          ? <button type="button" className="button button-primary" onClick={next} disabled={Boolean(stepError)}>Siguiente <ArrowRight size={17} /></button>
          : <button type="button" className="button button-primary" onClick={finish} disabled={!validation.valid || needsSurplusChoice}><Check size={17} /> Finalizar configuración</button>}
      </div>
    </main>
  );
}

function ReviewTotal({ label, amount, tone }) {
  return <div className={`review-total ${tone}`}><span>{label}</span><strong>{formatCurrency(amount)}</strong></div>;
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
    return draft[step.section].some((item) => item.amountCents > 0 && !item.name.trim())
      ? 'Completa el nombre de cada categoría u objetivo con monto.'
      : '';
  }
  return '';
}
