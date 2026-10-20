import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Plus, Trash2, Wallet } from 'lucide-react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import BudgetRowsEditor from '../../components/BudgetRowsEditor';
import ResultadoAsesoria from '../../components/ResultadoAsesoria';
import { useBudget } from '../../context/useBudget';
import {
  clasificarViabilidadMeta,
  generarAnalisisPresupuestoOnboarding,
  generarPlanAvanzadoCoT,
} from '../../services/ollamaService';
import {
  applySurplusAllocation,
  createId,
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
  const {
    onboardingComplete,
    draft,
    updateDraft,
    metas_financieras,
    updateMetasFinancieras,
    deudas_activas,
    completeOnboarding,
    storageError,
  } = useBudget();
  const metasFinancieras = Array.isArray(metas_financieras)
    ? metas_financieras.filter((goal) => goal && typeof goal === 'object')
    : [];
  const [budgetAnalysis, setBudgetAnalysis] = useState({ loading: false, result: null });
  const [advancedResults, setAdvancedResults] = useState({});
  const [advancedLoading, setAdvancedLoading] = useState('');
  const analysisRequestId = useRef(0);
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
  const invalidGoals = metasFinancieras.map(getGoalError);
  const validationErrors = [
    ...validation.errors,
    ...(needsSurplusChoice ? ['Elige si quieres ahorrar el dinero restante o dejarlo como dinero libre.'] : []),
  ];
  const stepError = getStepError(step, draft);

  const analizarPresupuesto = useCallback(async () => {
    const requestId = ++analysisRequestId.current;
    setBudgetAnalysis({ loading: true, result: null });
    let result;
    try {
      result = await generarAnalisisPresupuestoOnboarding(allocatedDraft);
    } catch (error) {
      console.error('No se pudo generar el análisis del presupuesto:', error);
      result = { error: error.message || 'No se pudo consultar al asesor. Intenta nuevamente.' };
    }
    if (requestId === analysisRequestId.current) {
      setBudgetAnalysis({ loading: false, result });
    }
  }, [allocatedDraft]);

  useEffect(() => {
    if (activeIndex !== steps.length - 1 || !validation.valid || needsSurplusChoice) return undefined;
    analizarPresupuesto();
    return () => {
      analysisRequestId.current += 1;
    };
  }, [activeIndex, analizarPresupuesto, needsSurplusChoice, validation.valid]);

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
    if (!validation.valid || needsSurplusChoice || invalidGoals.some(Boolean)) return;
    completeOnboarding();
    navigate('/dashboard');
  }

  function addGoal() {
    updateMetasFinancieras([
      ...metasFinancieras,
      {
        id: createId(),
        nombre: '',
        costo: 0,
        plazoDias: 30,
        ahorroActual: 0,
        descripcionProblematica: '',
      },
    ]);
  }

  function updateGoal(goalId, field, value) {
    const nextGoals = metasFinancieras.map((goal) => {
      if (goal.id !== goalId) return goal;
      const parsedValue = field === 'plazoDias'
        ? Number.parseInt(value, 10) || 0
        : ['costo', 'ahorroActual'].includes(field)
          ? Number.parseFloat(value) || 0
          : value;
      return { ...goal, [field]: parsedValue };
    });
    updateMetasFinancieras(nextGoals);
    setAdvancedResults({});
  }

  function removeGoal(goalId) {
    updateMetasFinancieras(metasFinancieras.filter((goal) => goal.id !== goalId));
    setAdvancedResults({});
  }

  async function consultarMeta(goal) {
    const error = getGoalError(goal);
    if (error) return;
    setAdvancedLoading(goal.id);
    setAdvancedResults((previous) => ({ ...previous, [goal.id]: null }));
    try {
      const datosFinancieros = {
        ingresosMensuales: sumAmounts(allocatedDraft.incomes) / 100,
        gastosFijos: sumAmounts(allocatedDraft.expenses) / 100,
        gastosVariables: 0,
        ahorroActual: sumAmounts(allocatedDraft.savings) / 100,

      };
      const clasificacion = await clasificarViabilidadMeta(
        datosFinancieros,
        goal,
        deudas_activas || [],
      );
      const asesoria = await generarPlanAvanzadoCoT(
        datosFinancieros,
        deudas_activas || [],
        goal,
        clasificacion,
      );
      setAdvancedResults((previous) => ({
        ...previous,
        [goal.id]: {
          plan: 'Avanzado',
          clasificacionFlash: clasificacion,
          asesoria,
        },
      }));
    } catch (error) {
      console.error('No se pudo generar el análisis avanzado de la meta:', error);
      setAdvancedResults((previous) => ({
        ...previous,
        [goal.id]: { error: error.message || 'No se pudo consultar al asesor. Intenta nuevamente.' },
      }));
    } finally {
      setAdvancedLoading('');
    }
  }

  return (
    <main className="page-shell onboarding-shell">
      <div className="onboarding-intro">
        <span className="eyebrow"><Wallet size={15} /> Tu punto de partida</span>
        <h1>Construye un presupuesto que sí cierre</h1>
        <p>Reparte tu ingreso mensual, recibe un análisis y planea tus metas financieras.</p>
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

          <section className="onboarding-advisor">
            <div className="section-heading">
              <div><h2>Análisis de tu presupuesto</h2><p>Al completar tus datos, Ollama analiza tus porcentajes, principales gastos y perfil financiero.</p></div>
            </div>
            {!validation.valid || needsSurplusChoice ? (
              <p className="review-note">Completa y balancea tu presupuesto para generar el análisis.</p>
            ) : budgetAnalysis.loading ? (
              <p role="status">Analizando tu presupuesto con Ollama…</p>
            ) : budgetAnalysis.result ? (
              <>
                <ResultadoAsesoria resultado={{ ...budgetAnalysis.result, tipo: 'presupuesto' }} />
                {budgetAnalysis.result.error && (
                  <button type="button" className="button button-secondary" onClick={analizarPresupuesto}>
                    Reintentar análisis
                  </button>
                )}
              </>
            ) : (
              <button type="button" className="button button-secondary" onClick={analizarPresupuesto}>
                Generar análisis de presupuesto
              </button>
            )}
          </section>

          <section className="onboarding-goals">
            <div className="section-heading">
              <div><h2>Metas financieras (opcional)</h2><p>Agrega una meta para consultar un plan detallado con el asesor avanzado.</p></div>
              <button type="button" className="button button-secondary" onClick={addGoal}>
                <Plus size={17} /> Agregar meta
              </button>
            </div>
            {metasFinancieras.length > 0 && (
              <p className="review-note">Para estimar el fondo de emergencia del plan avanzado, se toma el total de tus gastos mensuales como una base conservadora.</p>
            )}
            {metasFinancieras.map((goal, goalIndex) => (
              <fieldset className="onboarding-goal" key={goal.id}>
                <legend>Meta {goalIndex + 1}</legend>
                <label className="field">
                  <span>Nombre de la meta</span>
                  <input value={goal.nombre || ''} onChange={(event) => updateGoal(goal.id, 'nombre', event.target.value)} placeholder="Ej. Comprar una computadora" />
                </label>
                <div className="review-grid">
                  <label className="field">
                    <span>Costo total (MXN)</span>
                    <input type="number" min="0.01" step="0.01" value={goal.costo || ''} onChange={(event) => updateGoal(goal.id, 'costo', event.target.value)} />
                  </label>
                  <label className="field">
                    <span>Plazo deseado (días)</span>
                    <input type="number" min="1" step="1" value={goal.plazoDias || ''} onChange={(event) => updateGoal(goal.id, 'plazoDias', event.target.value)} />
                  </label>
                  <label className="field">
                    <span>¿Cuánto tienes ahorrado? (MXN)</span>
                    <input type="number" min="0" step="0.01" value={goal.ahorroActual || ''} onChange={(event) => updateGoal(goal.id, 'ahorroActual', event.target.value)} />
                  </label>
                </div>
                <label className="field">
                  <span>Contexto de la meta (opcional)</span>
                  <textarea value={goal.descripcionProblematica || ''} onChange={(event) => updateGoal(goal.id, 'descripcionProblematica', event.target.value)} rows="2" placeholder="¿Qué hace importante esta meta para ti?" />
                </label>
                {invalidGoals[goalIndex] && <p className="form-error" role="alert">{invalidGoals[goalIndex]}</p>}
                <div className="step-actions">
                  <button type="button" className="button button-primary" onClick={() => consultarMeta(goal)} disabled={Boolean(invalidGoals[goalIndex]) || Boolean(advancedLoading)}>
                    {advancedLoading === goal.id ? 'Preparando plan avanzado…' : 'Consultar plan avanzado'}
                  </button>
                  <button type="button" className="button button-quiet" onClick={() => removeGoal(goal.id)}>
                    <Trash2 size={16} /> Eliminar meta
                  </button>
                </div>
                {advancedResults[goal.id] && <ResultadoAsesoria resultado={advancedResults[goal.id]} />}
              </fieldset>
            ))}
          </section>
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
          : <button type="button" className="button button-primary" onClick={finish} disabled={!validation.valid || needsSurplusChoice || invalidGoals.some(Boolean)}><Check size={17} /> Finalizar configuración</button>}
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

function getGoalError(goal) {
  if (!goal?.nombre?.trim()) return 'Escribe un nombre para la meta.';
  if (!(Number(goal.costo) > 0)) return 'El costo de la meta debe ser mayor a cero.';
  if (!(Number(goal.plazoDias) > 0)) return 'El plazo debe ser mayor a cero días.';
  if (Number(goal.ahorroActual) < 0) return 'El ahorro actual no puede ser negativo.';
  return '';
}
