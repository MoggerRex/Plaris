const currency = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const STORAGE_KEY = 'plaris-budget-v1';
const LEGACY_STORAGE_PREFIX = `${STORAGE_KEY}:`;

export function createId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
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
  return currency.format((Number(cents || 0) / 100));
}

export function sumAmounts(items = []) {
  return items.reduce((total, item) => total + (Number(item.amountCents) || 0), 0);
}

export function totalsForBudget(budget = {}) {
  return {
    income: sumAmounts(budget.incomes),
    expenses: sumAmounts(budget.expenses),
    savings: sumAmounts(budget.savings),
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
  ];

  if (!budget.incomes?.some((item) => item.name.trim() && item.amountCents > 0)) {
    errors.push('Agrega al menos una fuente de ingresos con un monto mayor a cero.');
  }
  for (const [label, items] of sections) {
    if (items.some((item) => item.amountCents > 0 && !item.name.trim())) {
      errors.push(`Completa el nombre de cada elemento de ${label} que tenga un monto.`);
    }
  }
  if (pending < 0) errors.push('Los gastos y ahorros superan los ingresos. Reduce la distribución.');
  if (pending > 0) errors.push('Todavía hay dinero sin asignar. Distribuye todo el ingreso planeado.');
  if (pending === 0 && totals.income === 0) errors.push('El ingreso planeado debe ser mayor a cero.');

  return { valid: errors.length === 0, errors, totals, pending };
}

export function emptyBudget() {
  return { incomes: [], expenses: [], savings: [] };
}

export function createInitialBudgetState() {
  return {
    onboardingComplete: false,
    draft: {
      incomes: [{ id: createId(), name: '', category: 'Sueldo', amountCents: 0 }],
      expenses: [
        ...['Vivienda', 'Alimentación', 'Transporte', 'Servicios', 'Entretenimiento', 'Otros']
          .map((name) => ({ id: createId(), name, category: name, amountCents: 0 })),
      ],
      savings: [{ id: createId(), name: '', category: 'Ahorro', amountCents: 0 }],
    },
    template: null,
    monthlyBudgets: {},
    transactions: [],
  };
}

export function cloneBudget(budget = emptyBudget()) {
  return Object.fromEntries(
    ['incomes', 'expenses', 'savings'].map((key) => [
      key,
      (budget[key] || []).map((item) => ({ ...item, id: createId() })),
    ]),
  );
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
    return {
      ...initial,
      ...parsed,
      draft: { ...initial.draft, ...parsed.draft },
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
