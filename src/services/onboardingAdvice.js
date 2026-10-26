import { formatCurrency, sumAmounts } from './budgetService.js';

const ENV = import.meta.env || {};
const OLLAMA_HOST = ENV.VITE_OLLAMA_HOST || 'http://localhost:11434';
const MODEL = ENV.VITE_OLLAMA_MODEL || 'llama3.1:8b';

function monthlyExpenses(budget) {
  return sumAmounts(budget.expenses || []);
}

function buildLocalAnalysis(budget) {
  const today = new Date();
  const income = sumAmounts(budget.incomes || []);
  const expenses = monthlyExpenses(budget);
  const savings = sumAmounts(budget.savings || []);
  const goals = (budget.goals || []).map((goal, index) => {
    const monthly = Number(goal.monthlyAmountCents) || 0;
    const remaining = Math.max(0, Number(goal.targetCents) || 0);
    const deadlineMonths = monthsUntil(today, goal.targetDate);
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
      deadlineMonths,
      requiredMonthlyAmountCents: deadlineMonths > 0 ? Math.ceil(remaining / deadlineMonths) : remaining,
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
  const surplusBeforeGoals = income - expenses - savings - monthlyAmountCents;
  return {
    income,
    expenses,
    savings,
    available,
    surplusBeforeGoals,
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

function monthsUntil(from, targetDate) {
  if (!targetDate) return null;
  const target = new Date(`${targetDate}T00:00:00`);
  if (Number.isNaN(target.getTime())) return null;
  const days = Math.ceil((target.getTime() - from.getTime()) / 86400000);
  return days > 0 ? Math.ceil(days / 30.4375) : 0;
}

function goalStatus(goal, monthlyAmountCents) {
  if (monthlyAmountCents <= 0) return 'sin_aportacion';
  const months = Math.ceil(goal.targetCents / monthlyAmountCents);
  if (months > 120) return 'largo_plazo';
  if (goal.deadlineMonths === 0 || (goal.deadlineMonths && months > goal.deadlineMonths)) return 'ajustar';
  return 'viable';
}

function calculateGoalPlan(analysis, mode) {
  let available = Math.max(0, analysis.surplusBeforeGoals);
  return analysis.goals.map((goal) => {
    const availableBeforeGoal = available;
    const monthlyAmountCents = mode === 'assisted'
      ? Math.min(available, goal.requiredMonthlyAmountCents)
      : goal.monthlyAmountCents;
    available = Math.max(0, available - monthlyAmountCents);
    const months = monthlyAmountCents > 0 ? Math.ceil(goal.targetCents / monthlyAmountCents) : null;
    const exceedsAvailable = monthlyAmountCents > availableBeforeGoal && goal.targetCents > 0;
    const status = mode === 'assisted' && monthlyAmountCents === 0 && goal.targetCents > 0
      ? 'imposible'
      : goalStatus(goal, monthlyAmountCents);
    return {
      ...goal,
      monthlyAmountCents,
      months,
      projectedDate: months ? addMonths(new Date(), months) : null,
      status,
      percentageOfAvailable: analysis.surplusBeforeGoals > 0
        ? Math.round((monthlyAmountCents / analysis.surplusBeforeGoals) * 1000) / 10
        : 0,
      shortfallCents: Math.max(0, goal.requiredMonthlyAmountCents - monthlyAmountCents),
      moreThanTenYears: months === null || months > 120,
      exceedsAvailable,
      projectedAtDeadlineCents: monthlyAmountCents * (goal.deadlineMonths || 0),
      options: buildGoalOptions(goal, monthlyAmountCents, analysis.surplusBeforeGoals),
    };
  });
}

function buildGoalOptions(goal, currentMonthlyAmountCents, availableCents) {
  if (currentMonthlyAmountCents <= 0 || !goal.deadlineMonths) return [];
  const required = goal.requiredMonthlyAmountCents;
  const deadlineOptionMonths = Math.ceil(goal.targetCents / currentMonthlyAmountCents);
  const monthlyOption = required;
  return [
    {
      type: 'fecha',
      monthlyAmountCents: currentMonthlyAmountCents,
      months: deadlineOptionMonths,
      date: addMonths(new Date(), deadlineOptionMonths),
      explanation: `Mantener ${formatCurrency(currentMonthlyAmountCents)} al mes y terminar en aproximadamente ${deadlineOptionMonths} meses.`,
    },
    {
      type: 'aportacion',
      monthlyAmountCents: monthlyOption,
      differenceCents: Math.max(0, monthlyOption - currentMonthlyAmountCents),
      availableCents,
      feasible: monthlyOption <= availableCents,
      date: goal.targetDate,
      explanation: monthlyOption <= availableCents
        ? `Aumentar la aportación en ${formatCurrency(Math.max(0, monthlyOption - currentMonthlyAmountCents))} al mes para cumplir la fecha.`
        : `Se necesitarían ${formatCurrency(monthlyOption)} al mes, ${formatCurrency(monthlyOption - availableCents)} por encima del disponible actual.`
    },
  ];
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

function promptForAssisted(analysis, plannedGoals) {
  const financialData = {
    ingresosMensualesMXN: analysis.income / 100,
    gastosMensualesMXN: analysis.expenses / 100,
    ahorrosMensualesMXN: analysis.savings / 100,
    disponibleAntesDeMetasMXN: analysis.surplusBeforeGoals / 100,
    disponibleDespuesDeMetasMXN: (analysis.surplusBeforeGoals - plannedGoals.reduce((sum, goal) => sum + goal.monthlyAmountCents, 0)) / 100,
    fondoEmergencia: {
      mesesObjetivo: analysis.emergency.targetMonths,
      montoActualMXN: analysis.emergency.currentCents / 100,
      aportacionMensualMXN: analysis.emergency.monthlyAmountCents / 100,
      objetivoMXN: analysis.emergency.targetCents / 100,
    },
    metas: plannedGoals.map((goal) => ({
      id: goal.id,
      nombre: goal.name,
      prioridad: goal.priority,
      costoMXN: goal.targetCents / 100,
      aportacionMensualMXN: goal.monthlyAmountCents / 100,
      fechaObjetivo: goal.targetDate || null,
      mesesHastaFecha: goal.deadlineMonths,
      aportacionNecesariaParaFechaMXN: goal.requiredMonthlyAmountCents / 100,
      porcentajeCalculadoDelDisponible: goal.percentageOfAvailable,
      estadoCalculado: goal.status,
      mesesCalculados: goal.months,
      superaDiezAnios: goal.moreThanTenYears,
      excedeDisponible: goal.exceedsAvailable,
    })),
  };
  return `Eres Plaris, un asesor de finanzas personales para usuarios mexicanos.
Esta es la pestaña "Necesito ayuda para establecer mis metas". Tu única tarea es explicar
el desglose que YA calculó el sistema. No evalúes si las metas son viables, no vuelvas a
calcular montos y no propongas otros montos.

Explica cada meta en un texto amplio y sencillo: prioridad, aportación mensual en MXN,
porcentaje del dinero disponible para metas, cómo se relaciona con la fecha objetivo y por
qué la distribución respeta el orden de prioridad. Si el sistema marca una meta como
imposible, sin aportación, ajustar o largo_plazo, explica exactamente qué significa y qué
consecuencia tiene para el usuario. Si supera 120 meses, escribe que tomaría más de 10 años.
Aclara que los importes del sistema están en pesos mexicanos y conserva exactamente sus cifras.
No uses cifras distintas a las recibidas.

REGLAS DE UNIDADES Y FECHAS:
- Todos los importes del bloque siguiente están expresados en PESOS MEXICANOS (MXN), no en centavos.
- No multipliques ni dividas ningún importe. Si dice 65000, escribe $65,000 MXN.
- Las cifras calculadas por el sistema son definitivas.

DATOS FINANCIEROS NORMALIZADOS:
${JSON.stringify(financialData)}

Formato exacto:
{
  "resumen": "explicación amplia del criterio de distribución, sin cambiar cifras",
  "metas": [{"id":"id existente","explicacion":"explicación amplia y didáctica","recomendacion":"qué debe hacer el usuario"}],
  "emergencia": {"explicacion":"...","recomendacion":"..."},
  "siguientesPasos": ["...", "..."]
}
No devuelvas campos de ajustes ni aportaciones nuevas.`;
}

function promptForViability(analysis, plannedGoals) {
  const financialData = {
    ingresosMensualesMXN: analysis.income / 100,
    gastosMensualesMXN: analysis.expenses / 100,
    ahorrosMensualesMXN: analysis.savings / 100,
    disponibleAntesDeMetasMXN: analysis.surplusBeforeGoals / 100,
    fondoEmergencia: {
      mesesObjetivo: analysis.emergency.targetMonths,
      montoActualMXN: analysis.emergency.currentCents / 100,
      aportacionMensualMXN: analysis.emergency.monthlyAmountCents / 100,
      objetivoMXN: analysis.emergency.targetCents / 100,
    },
    metas: plannedGoals.map((goal) => ({
      id: goal.id,
      nombre: goal.name,
      prioridad: goal.priority,
      costoMXN: goal.targetCents / 100,
      aportacionMensualMXN: goal.monthlyAmountCents / 100,
      fechaObjetivo: goal.targetDate || null,
      mesesHastaFecha: goal.deadlineMonths,
      mesesProyectados: goal.months,
      montoProyectadoALaFechaMXN: Math.min(goal.targetCents, goal.projectedAtDeadlineCents) / 100,
      faltanteALaFechaMXN: Math.max(0, goal.targetCents - goal.projectedAtDeadlineCents) / 100,
      estadoCalculado: goal.status,
      superaDiezAnios: goal.moreThanTenYears,
      opciones: goal.options.map((option) => ({
        tipo: option.type,
        aportacionMensualMXN: option.monthlyAmountCents / 100,
        diferenciaMensualMXN: (option.differenceCents || 0) / 100,
        fecha: option.date,
        meses: option.months,
        viable: option.feasible,
      })),
    })),
  };
  return `Eres Plaris, un asesor de finanzas personales para usuarios mexicanos.
Esta es la pestaña "Ya tengo definidas mis metas". Tu única tarea es explicar la viabilidad
de las metas que el usuario ya configuró. NO sugieras una aportación mensual distinta y NO
cambies ningún valor calculado.

Para cada meta explica: cuánto acumulará a la fecha objetivo si mantiene su aportación,
cuánto faltará si existe una brecha, cuántos meses tardaría realmente y si el plan es viable.
Si requiere ajustes, presenta las DOS opciones calculadas por el sistema: mantener la aportación
y mover la fecha, o aportar el monto requerido para conservar la fecha. Indica el monto y fecha
de cada opción. Si la segunda opción supera el disponible, dilo claramente y no la presentes como
viable. Si supera 120 meses, escribe que tomaría más de 10 años. Para una meta viable, indica
que debe continuar con su plan actual.

Importes en el bloque: pesos mexicanos (MXN), nunca centavos. Conserva exactamente las cifras.
No inventes montos ni porcentajes. Si una meta no es viable, recomienda consultar la pestaña
"Necesito ayuda para establecer mis metas".

DATOS CALCULADOS POR EL SISTEMA:
${JSON.stringify(financialData)}

Devuelve únicamente este JSON:
{
  "resumen":"explicación amplia y didáctica del análisis",
  "metas":[{"id":"id existente","explicacion":"proyección y viabilidad","recomendacion":"continuar, o las dos opciones calculadas"}],
  "emergencia":{"explicacion":"...","recomendacion":"..."},
  "siguientesPasos":["...","..."]
}`;
}

export async function analyzeOnboardingBudget(budget, mode = 'review') {
  const analysis = buildLocalAnalysis(budget);
  const plannedGoals = calculateGoalPlan(analysis, mode);
  const assistedFallbackGoals = plannedGoals.map((goal) => ({
    id: goal.id,
    monthlyAmountCents: goal.monthlyAmountCents,
  }));
  const fallback = {
    resumen: analysis.surplusBeforeGoals < 0
      ? 'La distribución actual supera el ingreso mensual; conviene ajustar gastos o aportaciones antes de finalizar.'
      : 'La distribución tiene capacidad mensual para continuar con las metas registradas.',
    metas: plannedGoals.map((goal) => ({
      id: goal.id,
      estado: goal.status,
      aportacionMensualMXN: goal.monthlyAmountCents / 100,
      porcentajeDisponible: goal.percentageOfAvailable,
      mesesEstimados: goal.months,
      fechaEstimada: goal.projectedDate,
      opciones: goal.options,
      explicacion: buildDeterministicExplanation(goal, mode),
      recomendacion: buildDeterministicRecommendation(goal, mode),
    })),
    emergencia: {
      explicacion: `El objetivo inicial es cubrir ${analysis.emergency.targetMonths} meses de gastos (${formatCurrency(analysis.emergency.targetCents)}).`,
      recomendacion: analysis.emergency.monthlyAmountCents > 0
        ? `Con ${formatCurrency(analysis.emergency.monthlyAmountCents)} al mes, tardaría aproximadamente ${analysis.emergency.months} meses.`
        : 'Define una aportación mensual para comenzar a construirlo.',
    },
    ajustes: { gastos: [], aportacionesMetas: mode === 'assisted' ? assistedFallbackGoals : [], emergencyMonthlyAmountCents: 0 },
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
        prompt: mode === 'assisted'
          ? promptForAssisted(analysis, plannedGoals)
          : promptForViability(analysis, plannedGoals),
        options: { temperature: 0.2, num_predict: 1100 },
      }),
    });
    if (!response.ok) throw new Error(`Ollama respondió con ${response.status}.`);
    const payload = await response.json();
    const advice = JSON.parse(payload.response);
    const explanations = new Map((advice.metas || []).map((goal) => [goal.id, goal]));
    const safeMetas = fallback.metas.map((goal) => ({
      ...goal,
      explicacion: explanations.get(goal.id)?.explicacion || goal.explicacion,
      recomendacion: explanations.get(goal.id)?.recomendacion || goal.recomendacion,
      opciones: goal.opciones,
    }));
    return {
      ...fallback,
      ...advice,
      metas: safeMetas,
      ajustes: { aportacionesMetas: assistedFallbackGoals },
      analysis,
      projection: projectionRows({ ...analysis, goals: plannedGoals }),
      mode,
      source: 'ollama',
    };
  } catch (error) {
    return {
      ...fallback,
      analysis: { ...analysis, goals: plannedGoals },
      projection: projectionRows({ ...analysis, goals: plannedGoals }),
      mode,
      source: 'local',
      warning: error.message,
    };
  }
}

function buildDeterministicExplanation(goal, mode) {
  const amount = formatCurrency(goal.monthlyAmountCents);
  const required = formatCurrency(goal.requiredMonthlyAmountCents);
  const percentage = `${goal.percentageOfAvailable}%`;
  if (goal.status === 'imposible') {
    return `No hay dinero disponible para asignar a esta meta después de respetar las metas con mayor prioridad y el fondo de emergencia. Para la fecha indicada se requieren ${required} al mes.`;
  }
  if (mode === 'manual' && goal.status === 'viable') {
    return `Si mantienes ${formatCurrency(goal.monthlyAmountCents)} al mes, acumularás aproximadamente ${formatCurrency(Math.min(goal.targetCents, goal.projectedAtDeadlineCents))} para la fecha objetivo y completarás la meta en ${goal.months} meses.${goal.exceedsAvailable ? ' La suma de las aportaciones registradas supera el disponible por un pequeño redondeo y debe ajustarse.' : ''}`;
  }
  if (goal.moreThanTenYears) {
    return `Con ${amount} al mes, esta meta tomaría más de 10 años. Para alcanzar ${formatCurrency(goal.targetCents)} en la fecha indicada se requieren ${required} al mes.`;
  }
  if (goal.status === 'ajustar') {
    return `La aportación de ${amount} al mes no alcanza la fecha objetivo. El cálculo requiere ${required} al mes y esta meta usa ${percentage} del disponible asignable.`;
  }
  if (goal.exceedsAvailable) {
    return `La suma de las aportaciones supera el dinero disponible después de las metas prioritarias. Ajusta este monto para no comprometer tu presupuesto.`;
  }
  if (mode === 'assisted') {
    return `La distribución asigna ${amount} al mes (${percentage} del disponible para metas), respetando la prioridad registrada. Para la fecha objetivo se calculan ${required} al mes.`;
  }
  return `Con ${amount} al mes, la meta se estima en ${goal.months} meses y se compara con los ${goal.deadlineMonths || 0} meses disponibles hasta la fecha objetivo.`;
}

function buildDeterministicRecommendation(goal, mode) {
  if (goal.status === 'viable') return 'Continúa con la aportación actual; el plan es compatible con la fecha objetivo.';
  if (goal.exceedsAvailable) return 'No confirmes esta distribución todavía: la suma de aportaciones supera el remanente disponible. Ajusta el monto o la prioridad.';
  if (goal.moreThanTenYears) return 'Reconsidera la fecha, la aportación o la prioridad de esta meta; también puedes consultar la pestaña de ayuda para establecer metas.';
  if (goal.status === 'ajustar') return mode === 'manual'
    ? 'Consulta la pestaña de ayuda para establecer metas para obtener una distribución alternativa.'
    : 'Aumenta la aportación o usa una fecha objetivo más realista.';
  return 'Mantén esta aportación y revisa el plan si cambia tu ingreso o tus gastos.';
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

export { buildLocalAnalysis, calculateGoalPlan, projectionRows };