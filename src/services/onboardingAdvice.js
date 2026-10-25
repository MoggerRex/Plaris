import { formatCurrency, sumAmounts } from './budgetService.js';

const ENV = import.meta.env || {};
const OLLAMA_HOST = ENV.VITE_OLLAMA_HOST || 'http://localhost:11434';
const MODEL = ENV.VITE_OLLAMA_MODEL || 'llama3.1:8b';

function monthlyExpenses(budget) {
  return sumAmounts(budget.expenses || []);
}

function buildLocalAnalysis(budget) {
  const income = sumAmounts(budget.incomes || []);
  const expenses = monthlyExpenses(budget);
  const savings = sumAmounts(budget.savings || []);
  const goals = (budget.goals || []).map((goal, index) => {
    const monthly = Number(goal.monthlyAmountCents) || 0;
    const remaining = Math.max(0, Number(goal.targetCents) || 0);
    const months = monthly > 0 ? Math.ceil(remaining / monthly) : null;
    return {
      id: goal.id,
      name: goal.name || `Meta ${index + 1}`,
      priority: index + 1,
      targetCents: Number(goal.targetCents) || 0,
      monthlyAmountCents: monthly,
      targetDate: goal.targetDate || null,
      months,
      projectedDate: months ? addMonths(new Date(), months) : null,
    };
  });
  const emergency = budget.emergencyFund || {};
  const targetCents = expenses * Math.max(1, Number(emergency.targetMonths) || 3);
  const currentCents = Number(emergency.currentAmountCents) || 0;
  const monthlyAmountCents = Number(emergency.monthlyAmountCents) || 0;
  const emergencyMonths = monthlyAmountCents > 0
    ? Math.ceil(Math.max(0, targetCents - currentCents) / monthlyAmountCents)
    : null;
  const assigned = expenses + savings + sumAmounts(goals.map((goal) => ({ amountCents: goal.monthlyAmountCents }))) + monthlyAmountCents;
  const available = income - assigned;
  return {
    income,
    expenses,
    savings,
    available,
    goals,
    emergency: {
      targetCents,
      currentCents,
      monthlyAmountCents,
      months: emergencyMonths,
      targetMonths: Number(emergency.targetMonths) || 3,
    },
    distribution: [
      { name: 'Gastos', value: expenses / 100 },
      { name: 'Ahorros', value: savings / 100 },
      { name: 'Metas', value: sumAmounts(goals.map((goal) => ({ amountCents: goal.monthlyAmountCents }))) / 100 },
      { name: 'Emergencia', value: monthlyAmountCents / 100 },
    ].filter((item) => item.value > 0),
  };
}

function addMonths(date, months) {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result.toISOString().slice(0, 10);
}

function projectionRows(analysis) {
  const horizon = Math.max(
    6,
    ...analysis.goals.map((goal) => goal.months || 0),
    analysis.emergency.months || 0,
  );
  return Array.from({ length: Math.min(horizon, 60) }, (_, index) => {
    const month = index + 1;
    return {
      month: `Mes ${month}`,
      ...Object.fromEntries(
        analysis.goals.map((goal) => [
          goal.name,
          Math.min(goal.targetCents, goal.monthlyAmountCents * month) / 100,
        ]),
      ),
      'Fondo de emergencia': Math.min(
        analysis.emergency.targetCents,
        analysis.emergency.currentCents + analysis.emergency.monthlyAmountCents * month,
      ) / 100,
    };
  });
}

function promptFor(budget, analysis) {
  return `Analiza exclusivamente la viabilidad de metas financieras y fondo de emergencia.
No inventes datos ni mezcles ambos temas. Explica en español claro por qué cada meta es viable,
requiere ajuste o no tiene aportación suficiente. Considera prioridad, ingresos, gastos, ahorros,
gastos opcionales y el fondo de emergencia. Devuelve únicamente JSON.

DATOS CAPTURADOS:
${JSON.stringify({ budget, analysis })}

Formato exacto:
{
  "resumen": "diagnóstico breve y comprensible",
  "metas": [{"id":"id existente","estado":"viable|ajustar|sin_aportacion","explicacion":"...","recomendacion":"..."}],
  "emergencia": {"explicacion":"...","recomendacion":"..."},
  "ajustes": {
    "gastos": [{"id":"id de gasto opcional existente","reduccionMensualCents":0,"motivo":"..."}],
    "aportacionesMetas": [{"id":"id existente","monthlyAmountCents":0}],
    "emergenciaMonthlyAmountCents": 0
  },
  "siguientesPasos": ["...", "..."]
}
Solo propone reducciones en gastos con essential=false y no excedas su monto actual. Las aportaciones
propuestas no pueden superar el dinero disponible calculado. No modifiques gastos necesarios.`;
}

export async function analyzeOnboardingBudget(budget) {
  const analysis = buildLocalAnalysis(budget);
  const fallback = {
    resumen: analysis.available < 0
      ? 'La distribución actual supera el ingreso mensual; conviene ajustar gastos o aportaciones antes de finalizar.'
      : 'La distribución tiene capacidad mensual para continuar con las metas registradas.',
    metas: analysis.goals.map((goal) => ({
      id: goal.id,
      estado: goal.monthlyAmountCents > 0 ? 'viable' : 'sin_aportacion',
      explicacion: goal.monthlyAmountCents > 0
        ? `Con ${formatCurrency(goal.monthlyAmountCents)} al mes, la proyección inicial es de ${goal.months} meses.`
        : 'Todavía no tiene una aportación mensual registrada.',
      recomendacion: goal.monthlyAmountCents > 0 ? 'Mantén la aportación y revisa la fecha objetivo.' : 'Define una aportación después de proteger tu fondo de emergencia.',
    })),
    emergencia: {
      explicacion: `El objetivo inicial es cubrir ${analysis.emergency.targetMonths} meses de gastos (${formatCurrency(analysis.emergency.targetCents)}).`,
      recomendacion: analysis.emergency.monthlyAmountCents > 0
        ? `Con ${formatCurrency(analysis.emergency.monthlyAmountCents)} al mes, tardaría aproximadamente ${analysis.emergency.months} meses.`
        : 'Define una aportación mensual para comenzar a construirlo.',
    },
    ajustes: { gastos: [], aportacionesMetas: [], emergencyMonthlyAmountCents: 0 },
    siguientesPasos: ['Revisa las metas en orden de prioridad.', 'Mantén separado el fondo de emergencia de tus metas.'],
  };

  try {
    const response = await fetch(`${OLLAMA_HOST}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        stream: false,
        format: 'json',
        prompt: promptFor(budget, analysis),
        options: { temperature: 0.2, num_predict: 1100 },
      }),
    });
    if (!response.ok) throw new Error(`Ollama respondió con ${response.status}.`);
    const payload = await response.json();
    const advice = JSON.parse(payload.response);
    return { ...fallback, ...advice, analysis, source: 'ollama' };
  } catch (error) {
    return { ...fallback, analysis, source: 'local', warning: error.message };
  }
}

export function applyOnboardingRecommendations(budget, advice) {
  const recommendations = advice?.ajustes || {};
  const reductions = new Map((recommendations.gastos || []).map((item) => [item.id, Number(item.reduccionMensualCents) || 0]));
  const expenses = (budget.expenses || []).map((expense) => {
    if (expense.essential !== false || !reductions.has(expense.id)) return expense;
    const reduction = Math.min(expense.amountCents, Math.max(0, reductions.get(expense.id)));
    return { ...expense, amountCents: expense.amountCents - reduction };
  });
  const income = sumAmounts(budget.incomes || []);
  const goalAmounts = new Map((recommendations.aportacionesMetas || []).map((item) => [item.id, Math.max(0, Number(item.monthlyAmountCents) || 0)]));
  let remainingForGoals = Math.max(0, income - sumAmounts(expenses) - sumAmounts(budget.savings || []));
  const goals = (budget.goals || []).map((goal) => {
    if (!goalAmounts.has(goal.id)) {
      remainingForGoals = Math.max(0, remainingForGoals - (Number(goal.monthlyAmountCents) || 0));
      return goal;
    }
    const amount = Math.min(goalAmounts.get(goal.id), remainingForGoals);
    remainingForGoals -= amount;
    return { ...goal, monthlyAmountCents: amount };
  });
  const assignedWithoutEmergency = sumAmounts(expenses) + sumAmounts(budget.savings || []) + sumAmounts(goals.map((goal) => ({ amountCents: goal.monthlyAmountCents })));
  const availableForEmergency = Math.max(0, income - assignedWithoutEmergency);
  const emergencyAmount = Number(recommendations.emergencyMonthlyAmountCents);
  const boundedEmergencyAmount = Number.isFinite(emergencyAmount) && emergencyAmount >= 0
    ? Math.min(emergencyAmount, availableForEmergency)
    : null;
  const emergencyFund = boundedEmergencyAmount !== null
    ? { ...budget.emergencyFund, monthlyAmountCents: boundedEmergencyAmount }
    : budget.emergencyFund;
  return { ...budget, expenses, goals, emergencyFund };
}

export { buildLocalAnalysis, projectionRows };