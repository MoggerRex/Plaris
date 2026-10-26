const currency = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const STORAGE_KEY = 'plaris-budget-v1';
const LEGACY_STORAGE_PREFIX = `${STORAGE_KEY}:`;

export function createId() {
  return (
    globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
}

export function currentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function amountToCents(value) {
  const amount = Number.parseFloat(String(value).replace(',', '.'));
  return Number.isFinite(amount) ? Math.max(0, Math.round(amount * 100)) : 0;
}

export function centsToInput(cents) {
  return (Number(cents || 0) / 100).toFixed(2);
}

export function formatCurrency(cents) {
  return currency.format(Number(cents || 0) / 100);
}

export function sumAmounts(items = []) {
  return items.reduce((total, item) => total + (Number(item.amountCents) || 0), 0);
}

export function totalsForBudget(budget = {}) {
  const goals = sumAmounts(
    (budget.goals || []).map((goal) => ({ amountCents: goal.monthlyAmountCents })),
  );
  const emergency = Number(budget.emergencyFund?.monthlyAmountCents) || 0;
  return {
    income: sumAmounts(budget.incomes),
    expenses: sumAmounts(budget.expenses),
    savings: sumAmounts(budget.savings) + goals + emergency,
    goalSavings: goals,
    emergencySavings: emergency,
  };
}

export function unassignedAmount(budget = {}) {
  const totals = totalsForBudget(budget);
  return totals.income - totals.expenses - totals.savings;
}

export function applySurplusAllocation(budget, allocation) {
  const pending = unassignedAmount(budget);
  if (pending <= 0 || !allocation) return budget;

  const destination = allocation === 'savings' ? 'savings' : 'expenses';
  const name = allocation === 'savings' ? 'Ahorro del excedente' : 'Dinero libre';
  const category = allocation === 'savings' ? 'Ahorro adicional' : 'Dinero libre';

  return {
    ...budget,
    [destination]: [
      ...budget[destination],
      { id: createId(), name, category, amountCents: pending },
    ],
  };
}

export function validateZeroBasedBudget(budget) {
  const totals = totalsForBudget(budget);
  const pending = unassignedAmount(budget);
  const errors = [];
  const sections = [
    ['ingresos', budget.incomes || []],
    ['gastos', budget.expenses || []],
    ['ahorros', budget.savings || []],
    ['metas', budget.goals || []],
  ];

  if (!budget.incomes?.some((item) => item.name.trim() && item.amountCents > 0)) {
    errors.push('Agrega al menos una fuente de ingresos con un monto mayor a cero.');
  }
  for (const [label, items] of sections) {
    if (items.some((item) => (item.amountCents > 0 || item.monthlyAmountCents > 0) && !item.name.trim())) {
      errors.push(`Completa el nombre de cada elemento de ${label} que tenga un monto.`);
    }
  }
  if ((budget.goals || []).some((goal) => goal.name.trim() && (goal.targetCents <= 0 || !goal.targetDate))) {
    errors.push('Completa el costo y la fecha objetivo de cada meta.');
  }
  if (pending < 0)
    errors.push('Los gastos y ahorros superan los ingresos. Reduce la distribución.');
  if (pending > 0)
    errors.push('Todavía hay dinero sin asignar. Distribuye todo el ingreso planeado.');
  if (pending === 0 && totals.income === 0)
    errors.push('El ingreso planeado debe ser mayor a cero.');

  return { valid: errors.length === 0, errors, totals, pending };
}

export function emptyBudget() {
  return { incomes: [], expenses: [], savings: [], goals: [], emergencyFund: defaultEmergencyFund() };
}

export function defaultEmergencyFund() {
  return { targetMonths: 3, currentAmountCents: 0, monthlyAmountCents: 0 };
}

export function createInitialBudgetState() {
  return {
    onboardingComplete: false,
    draft: {
      incomes: [{ id: createId(), name: '', category: 'Sueldo', amountCents: 0 }],
      expenses: [
        ...['Vivienda', 'Alimentación', 'Transporte', 'Servicios', 'Entretenimiento', 'Otros'].map(
          (name) => ({ id: createId(), name, category: name, amountCents: 0 }),
        ),
      ],
      savings: [{ id: createId(), name: '', category: 'Ahorro', amountCents: 0 }],
      goals: [],
      emergencyFund: defaultEmergencyFund(),
    },
    profile: { displayName: '', goalName: '', cost: '', days: 90, savings: '', reserve: '' },
    savedTemplates: [],
    analysisHistory: [],
    template: null,
    monthlyBudgets: {},
    transactions: [],
    deudas_activas: [],
    metas_financieras: [],
  };
}

export function cloneBudget(budget = emptyBudget()) {
  return {
    ...Object.fromEntries(
      ['incomes', 'expenses', 'savings'].map((key) => [
      key,
      (budget[key] || []).map((item) => ({ ...item, id: createId() })),
      ]),
    ),
    goals: (budget.goals || []).map((goal) => ({ ...goal, id: createId() })),
    emergencyFund: { ...defaultEmergencyFund(), ...(budget.emergencyFund || {}) },
  };
}

export function readBudgetState() {
  try {
    let saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      const legacyStates = Object.keys(localStorage)
        .filter((key) => key.startsWith(LEGACY_STORAGE_PREFIX))
        .map((key) => localStorage.getItem(key))
        .filter(Boolean)
        .map((value) => JSON.parse(value));
      const migrated = legacyStates.find((state) => state.onboardingComplete) || legacyStates[0];
      if (migrated) {
        saved = JSON.stringify(migrated);
        localStorage.setItem(STORAGE_KEY, saved);
      }
    }
    if (!saved) return createInitialBudgetState();

    const parsed = JSON.parse(saved);
    const initial = createInitialBudgetState();
    let legacyGoal = {};
    try {
      legacyGoal = JSON.parse(localStorage.getItem('plaris-agent-goal') || '{}') || {};
    } catch {
      /* Keep the budget even when legacy goal data is invalid. */
    }
    return {
      ...initial,
      ...parsed,
      profile: {
        ...initial.profile,
        ...legacyGoal,
        goalName: legacyGoal.name || '',
        ...parsed.profile,
      },
      savedTemplates: Array.isArray(parsed.savedTemplates) ? parsed.savedTemplates : [],
      analysisHistory: Array.isArray(parsed.analysisHistory) ? parsed.analysisHistory : [],
      draft: {
        ...initial.draft,
        ...parsed.draft,
        emergencyFund: { ...initial.draft.emergencyFund, ...(parsed.draft?.emergencyFund || {}) },
        goals: Array.isArray(parsed.draft?.goals) ? parsed.draft.goals : initial.draft.goals,
      },
      monthlyBudgets: parsed.monthlyBudgets || {},
      transactions: parsed.transactions || [],
    };
  } catch (error) {
    console.error('No se pudieron recuperar los datos del presupuesto:', error);
    return createInitialBudgetState();
  }
}

export function writeBudgetState(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
