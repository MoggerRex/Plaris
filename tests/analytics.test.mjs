import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildAnalytics } from '../src/services/analyticsService.js';

test('integra metas, fondo de emergencia y pagos de deuda de main sin modificar los datos', () => {
  const input = {
    month: '2026-10',
    today: '2026-10-20',
    transactions: [],
    monthlyBudgets: {
      '2026-10': {
        savings: [{ amountCents: 10000 }],
        goals: [{ monthlyAmountCents: 20000 }],
        emergencyFund: { monthlyAmountCents: 5000 },
      },
    },
    debts: [{ payment: 125.5 }],
  };
  const before = JSON.stringify(input);
  const data = buildAnalytics(input);
  assert.equal(data.planned.savings, 35000);
  assert.equal(data.fallbackSavings, 35000);
  assert.equal(data.projection, 105000);
  assert.equal(data.annual[9].plannedDebt, 12550);
  assert.equal(data.annual[8].plannedDebt, 0);
  assert.equal(JSON.stringify(input), before);
});

test('el ingreso reservado para otro mes no aumenta el disponible semanal', () => {
  const data = buildAnalytics({
    month: '2026-10',
    today: '2026-10-20',
    monthlyBudgets: {},
    transactions: [
      { type: 'income', amountCents: 50000, date: '2026-10-01', budgetMonth: '2026-11' },
      { type: 'income', amountCents: 20000, date: '2026-10-02' },
      { type: 'expense', amountCents: 10000, date: '2026-10-03' },
    ],
  });
  assert.equal(data.actual.income, 20000);
  assert.equal(data.weeks[0].balance, 60000);
  assert.equal(data.weeks[0].reserved, 50000);
  assert.equal(data.weeks[0].available, 10000);
});

const month = '2026-10';
const today = '2026-10-20';
const budget = {
  incomes: [{ amountCents: 100000 }],
  expenses: [{ amountCents: 50000 }],
  savings: [{ amountCents: 20000 }],
  debts: [{ amountCents: 10000 }],
};
const tx = (type, amountCents, date, rest = {}) => ({ type, amountCents, date, ...rest });
const calculate = (transactions, overrides = {}) =>
  buildAnalytics({ month, today, monthlyBudgets: { [month]: budget }, transactions, ...overrides });

test('incluye nuevas categorías, filtra programados, futuros y meses ajenos', () => {
  const data = calculate([
    tx('expense', 10000, '2026-10-01', { category: 'Mascotas' }),
    tx('expense', 20000, '2026-10-04', { category: 'Mascotas' }),
    tx('expense', 10000, '2026-10-05', { category: 'Comida' }),
    tx('expense', 99999, '2026-10-06', { status: 'scheduled' }),
    tx('expense', 99999, '2026-10-25'),
    tx('expense', 99999, '2026-09-01'),
    tx('debt_payment', 5000, '2026-10-02'),
  ]);
  assert.equal(data.actual.expenses, 40000);
  assert.deepEqual(data.categoryData, [
    { category: 'Mascotas', amount: 30000, share: 75 },
    { category: 'Comida', amount: 10000, share: 25 },
  ]);
  assert.equal(data.annual[9].realExpense, 40000);
  assert.equal(data.annual[10].realExpense, null);
});

test('cumplimiento tiene máximo de 100, exceso y tasa de ahorro usan denominadores correctos', () => {
  const data = calculate([
    tx('income', 100000, '2026-10-01'),
    tx('expense', 60000, '2026-10-02'),
    tx('saving', 10000, '2026-10-03'),
    tx('debt_payment', 10000, '2026-10-04'),
  ]);
  assert.equal(data.excess, 10000);
  assert.equal(data.excessPercent, 20);
  assert.equal(data.savingRate, 10);
  assert.ok(Math.abs(data.compliance - (100 + (50000 / 60000) * 100 + 50 + 100) / 4) < 0.0001);
  const over = calculate([tx('income', 100000, '2026-10-01'), tx('saving', 200000, '2026-10-02')]);
  assert.equal(over.savingRate, 200);
  assert.ok(over.compliance <= 100);
});

test('sin denominadores no inventa porcentajes ni produce NaN', () => {
  const empty = calculate([], { monthlyBudgets: {} });
  assert.equal(empty.compliance, null);
  assert.equal(empty.excessPercent, null);
  assert.equal(empty.savingRate, null);
  assert.equal(empty.projection, null);
  const unplanned = calculate([tx('expense', 10000, '2026-10-02')], { monthlyBudgets: {} });
  assert.equal(unplanned.excess, 10000);
  assert.equal(unplanned.excessPercent, null);
});

test('proyección completa el mes parcial, usa planes futuros y respeta un plan explícito de cero', () => {
  const data = calculate([tx('saving', 10000, '2026-10-03')], {
    monthlyBudgets: {
      [month]: budget,
      '2026-11': { savings: [{ amountCents: 30000 }] },
      '2026-12': { savings: [] },
    },
  });
  assert.equal(data.savedToDate, 10000);
  assert.equal(data.projection, 50000);
  assert.equal(data.annual[9].cumulative, 10000);
  assert.equal(data.annual[9].projected, 20000);
  assert.equal(data.annual[10].projected, 50000);
  const over = calculate([tx('saving', 25000, '2026-10-03')]);
  assert.equal(over.projection, 65000);
});

test('el mes cerrado no completa ahorro faltante; diciembre no extrapola otro año', () => {
  const past = calculate([tx('saving', 10000, '2026-10-03')], { today: '2026-11-10' });
  assert.equal(past.cutoff, '2026-10-31');
  assert.equal(past.projection, 50000);
  const december = calculate([tx('saving', 10000, '2026-12-03')], {
    month: '2026-12',
    today: '2027-01-01',
    monthlyBudgets: { '2026-12': budget },
  });
  assert.equal(december.projection, 10000);
  assert.equal(december.annual.length, 12);
});

test('balance semanal arrastra historial, descuenta ahorro y deuda y oculta semanas futuras', () => {
  const data = calculate([
    tx('income', 50000, '2026-09-01'),
    tx('expense', 10000, '2026-09-02'),
    tx('income', 100000, '2026-10-01'),
    tx('expense', 20000, '2026-10-07'),
    tx('saving', 10000, '2026-10-08'),
    tx('debt_payment', 5000, '2026-10-14'),
    tx('expense', 300000, '2026-10-20'),
    tx('income', 900000, '2026-10-28'),
  ]);
  assert.equal(data.opening, 40000);
  assert.equal(data.weeks[0].balance, 120000);
  assert.equal(data.weeks[1].balance, 105000);
  assert.equal(data.weeks[2].balance, -195000);
  assert.equal(data.weeks[3].balance, null);
  assert.equal(data.weeks[4].flow, null);
});

test('periodo anual incluye solo el año hasta el corte y respeta febrero bisiesto', () => {
  const transactions = [
    tx('income', 100000, '2026-01-02'),
    tx('income', 100000, '2026-10-02'),
    tx('saving', 20000, '2026-02-02'),
    tx('saving', 99999, '2025-10-02'),
  ];
  assert.equal(calculate(transactions, { scope: 'year' }).savingRate, 10);
  assert.equal(calculate(transactions).savingRate, 0);
  const leap = calculate([], { month: '2024-02', today: '2026-10-20' });
  assert.equal(leap.cutoff, '2024-02-29');
  assert.equal(leap.weeks[4].label, '29–29');
});

test('no modifica el estado y permite proyectar un ahorro planeado exclusivamente en meses futuros', () => {
  const input = {
    month,
    today,
    monthlyBudgets: { [month]: {}, '2026-12': { savings: [{ amountCents: 10000 }] } },
    transactions: [],
  };
  const original = JSON.stringify(input);
  assert.equal(buildAnalytics(input).projection, 10000);
  assert.equal(JSON.stringify(input), original);
});
