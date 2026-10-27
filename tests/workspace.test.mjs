import test from 'node:test';
import assert from 'node:assert/strict';
import { buildComparison, selectedFinanceContext, toPlannerData } from '../src/services/financeAdapter.js';
import { analyze } from '../src/domain/planner.js';
import { snapshotTemplate, applyTemplate } from '../src/services/templateService.js';
import { readBudgetState, writeBudgetState } from '../src/services/budgetService.js';
import { requestChat } from '../src/services/chatService.js';
import { applyOnboardingRecommendations, buildLocalAnalysis, calculateGoalPlan } from '../src/services/onboardingAdvice.js';

const budget = {
  incomes: [{ id: 'income', name: 'Sueldo', category: 'Trabajo', amountCents: 3000000 }],
  expenses: [{ id: 'rent', name: 'Renta', amountCents: 1200000, essential: true }],
  savings: [{ id: 'saving', name: 'Fondo', amountCents: 200000 }],
};
const profile = { displayName: 'Ejemplo', goalName: 'Laptop', cost: '20000', days: '90', savings: '6000', reserve: '1000' };
const debts = [{ id: 'debt', name: 'Tarjeta', balance: 10000, payment: 1000, minimum: 300, rate: 12, rateType: 'anual' }];
const transactions = [
  { id: 'one', date: '2026-10-12', type: 'income', amountCents: 50000 },
  { id: 'two', date: '2026-09-12', type: 'income', amountCents: 99000 },
];

test('comparisons convert cents once and isolate actual movements by month', () => {
  const result = buildComparison(budget, transactions, '2026-10');
  assert.equal(result[0].Planeado, 30000);
  assert.equal(result[0].Real, 500);
  assert.equal(result[1].Real, 0);
});

test('planner adapter retains protected expenses and subtracts debt payments once', () => {
  const data = toPlannerData(budget, profile, debts, '2026-10');
  const result = analyze(data);
  assert.deepEqual(result.errors, []);
  assert.equal(result.free, 17000);
  assert.equal(result.payments, 1000);
  assert.equal(data.expenses[0].essential, true);
  assert.equal(data.goal.name, 'Laptop');
});

test('analysis context includes only selected financial sections', () => {
  const context = selectedFinanceContext(budget, debts, buildComparison(budget, transactions, '2026-10'), ['expenses'], '2026-10');
  assert.deepEqual(Object.keys(context.secciones), ['expenses']);
  assert.equal(context.secciones.expenses.conceptos[0].montoMensual, 12000);
  assert.equal(JSON.stringify(context).includes('Sueldo'), false);
});

test('templates create isolated copies and apply without altering other months or transactions', () => {
  const state = { monthlyBudgets: { '2026-10': budget }, transactions, profile, deudas_activas: debts };
  const template = snapshotTemplate(state, '  Familiar  ', '2026-10');
  assert.equal(template.name, 'Familiar');
  assert.notEqual(template.budget.incomes[0].id, 'income');
  template.budget.incomes[0].amountCents = 4000000;
  assert.equal(budget.incomes[0].amountCents, 3000000);
  const next = applyTemplate({ ...state, savedTemplates: [template] }, template.id, '2026-11');
  assert.equal(next.monthlyBudgets['2026-11'].incomes[0].amountCents, 4000000);
  assert.equal(next.monthlyBudgets['2026-10'], budget);
  assert.equal(next.transactions, transactions);
  assert.equal(next.deudas_activas, state.deudas_activas);
  assert.equal(next.profile, state.profile);
  assert.equal(template.debts, undefined);
  assert.equal(template.profile, undefined);
});

test('saved profile, templates and conversations survive reload; malformed legacy goal does not reset budget', () => {
  const storage = new Map();
  globalThis.localStorage = { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) };
  const state = { onboardingComplete: true, monthlyBudgets: { '2026-10': budget }, transactions, profile, savedTemplates: [{ id: 'test' }], analysisHistory: [{ id: 'chat' }] };
  writeBudgetState(state);
  storage.set('plaris-agent-goal', '{invalid');
  const restored = readBudgetState();
  assert.equal(restored.onboardingComplete, true);
  assert.deepEqual(restored.profile, profile);
  assert.equal(restored.savedTemplates[0].id, 'test');
  assert.equal(restored.analysisHistory[0].id, 'chat');
  assert.equal(restored.monthlyBudgets['2026-10'].incomes[0].amountCents, 3000000);
  delete globalThis.localStorage;
});

test('chat sends selected context and bounded history with a cancellation signal', async () => {
  const originalFetch = globalThis.fetch;
  const controller = new AbortController();
  let request;
  globalThis.fetch = async (url, options) => {
    request = { url, options, body: JSON.parse(options.body) };
    return { ok: true, json: async () => ({ message: { content: 'Respuesta de prueba' } }) };
  };
  try {
    const messages = Array.from({ length: 20 }, (_, index) => ({ role: index % 2 ? 'assistant' : 'user', content: 'Mensaje ' + index }));
    const answer = await requestChat(messages, { periodo: '2026-10', secciones: { expenses: [] } }, controller.signal);
    assert.equal(answer, 'Respuesta de prueba');
    assert.equal(request.body.messages.length, 13);
    assert.equal(request.options.signal, controller.signal);
    assert.match(request.body.messages[0].content, /expenses/);
    assert.equal(request.body.stream, false);
  } finally { globalThis.fetch = originalFetch; }
});

test('onboarding projections include goals and emergency contributions', () => {
  const onboardingBudget = {
    incomes: [{ amountCents: 3000000 }],
    expenses: [{ amountCents: 1500000, essential: true }],
    savings: [],
    goals: [{ id: 'goal', name: 'Viaje', targetCents: 600000, monthlyAmountCents: 100000 }],
    emergencyFund: { targetMonths: 3, currentAmountCents: 0, monthlyAmountCents: 200000 },
  };
  const result = buildLocalAnalysis(onboardingBudget);
  assert.equal(result.goals[0].months, 6);
  assert.equal(result.emergency.targetCents, 4500000);
  assert.equal(result.available, 1200000);
});

test('onboarding recommendations never over-allocate the monthly income', () => {
  const onboardingBudget = {
    incomes: [{ amountCents: 1000000 }],
    expenses: [{ id: 'rent', amountCents: 600000, essential: true }],
    savings: [],
    goals: [{ id: 'goal', name: 'Viaje', targetCents: 500000, monthlyAmountCents: 100000 }],
    emergencyFund: { targetMonths: 3, currentAmountCents: 0, monthlyAmountCents: 100000 },
  };
  const adjusted = applyOnboardingRecommendations(onboardingBudget, {
    ajustes: {
      aportacionesMetas: [{ id: 'goal', monthlyAmountCents: 900000 }],
      emergencyMonthlyAmountCents: 900000,
    },
  });
  const assigned = adjusted.expenses[0].amountCents + adjusted.goals[0].monthlyAmountCents + adjusted.emergencyFund.monthlyAmountCents;
  assert.ok(assigned <= onboardingBudget.incomes[0].amountCents);
});

test('goal assistance calculates MXN amounts by deadline and priority', () => {
  const onboardingBudget = {
    incomes: [{ amountCents: 1000000 }],
    expenses: [{ amountCents: 250000, essential: true }],
    savings: [],
    goals: [
      { id: 'surgery', name: 'Mastectomia', targetCents: 6500000, monthlyAmountCents: 0, targetDate: '2028-07-03' },
      { id: 'house', name: 'Enganche', targetCents: 40000000, monthlyAmountCents: 0, targetDate: '2030-09-26' },
    ],
    emergencyFund: { targetMonths: 3, currentAmountCents: 0, monthlyAmountCents: 0 },
  };
  const analysis = buildLocalAnalysis(onboardingBudget);
  const plan = calculateGoalPlan(analysis, 'assisted');
  assert.equal(analysis.surplusBeforeGoals, 750000);
  assert.ok(plan[0].monthlyAmountCents > 0);
  assert.ok(plan[0].monthlyAmountCents <= 6500000);
  assert.equal(plan[0].status, 'viable');
  assert.equal(plan[1].monthlyAmountCents, 750000 - plan[0].monthlyAmountCents);
  assert.ok(plan[1].percentageOfAvailable > 0);
});

test('manual viability keeps user MXN amounts and calculates projections without cent errors', () => {
  const onboardingBudget = {
    incomes: [{ amountCents: 1000000 }],
    expenses: [{ amountCents: 250000, essential: true }],
    savings: [],
    goals: [
      { id: 'surgery', name: 'Mastectomia', targetCents: 6500000, monthlyAmountCents: 541700, targetDate: '2028-07-03' },
      { id: 'house', name: 'Enganche', targetCents: 40000000, monthlyAmountCents: 208500, targetDate: '2030-09-26' },
    ],
    emergencyFund: { targetMonths: 3, currentAmountCents: 0, monthlyAmountCents: 0 },
  };
  const analysis = buildLocalAnalysis(onboardingBudget);
  const plan = calculateGoalPlan(analysis, 'manual');
  assert.equal(plan[0].monthlyAmountCents / 100, 5417);
  assert.equal(plan[0].status, 'viable');
  assert.equal(plan[1].monthlyAmountCents / 100, 2085);
  assert.equal(plan[1].status, 'largo_plazo');
  assert.equal(plan[1].exceedsAvailable, true);
  assert.equal(plan[0].projectedAtDeadlineCents / 100, 113757);
  assert.ok(plan[1].options.some((option) => option.type === 'aportacion'));
});
