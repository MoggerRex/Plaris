import test from 'node:test';
import assert from 'node:assert/strict';
import {
  plannedSavingsRows,
  applySavingsPlan,
  primaryBudgetGoal,
} from '../src/services/budgetConnections.js';
import {
  buildComparison,
  toPlannerData,
  selectedFinanceContext,
} from '../src/services/financeAdapter.js';
import {
  categoriesForBudget,
  plannedMovementAmount,
} from '../src/services/transactionCategories.js';
import { totalsForBudget, sumAmounts } from '../src/services/budgetService.js';

const budget = {
  incomes: [{ id: 'salary', name: 'Sueldo', amountCents: 500000 }],
  expenses: [],
  savings: [{ id: 'saving', name: 'Ahorro libre', amountCents: 20000 }],
  goals: [
    {
      id: 'trip',
      name: 'Viaje',
      targetCents: 1200000,
      monthlyAmountCents: 100000,
      targetDate: '2027-10-01',
    },
  ],
  emergencyFund: { targetMonths: 3, currentAmountCents: 80000, monthlyAmountCents: 30000 },
};

test('onboarding savings appear in budget rows, summary, categories and chat without duplication', () => {
  const rows = plannedSavingsRows(budget);
  assert.deepEqual(
    rows.map((row) => row.name),
    ['Ahorro libre', 'Viaje', 'Fondo de emergencia'],
  );
  assert.equal(sumAmounts(rows), totalsForBudget(budget).savings);
  assert.equal(
    buildComparison(budget, [], '2026-10').find((row) => row.key === 'savings').Planeado,
    1500,
  );
  assert.deepEqual(
    categoriesForBudget(budget, 'saving'),
    rows.map((row) => row.name),
  );
  const chat = selectedFinanceContext(budget, [], [], ['savings'], '2026-10');
  assert.equal(chat.secciones.savings.conceptos.length, 3);
  assert.equal(budget.savings.length, 1);
});

test('saving the plan updates the goal contribution while preserving its target, date and identity', () => {
  const rows = plannedSavingsRows(budget).map((row) =>
    row.savingsSource === 'goal' ? { ...row, amountCents: 120000 } : row,
  );
  const next = applySavingsPlan(budget, rows);
  assert.equal(next.savings.length, 1);
  assert.deepEqual(next.goals[0], { ...budget.goals[0], monthlyAmountCents: 120000 });
  assert.equal(sumAmounts(plannedSavingsRows(next)), 170000);
  assert.equal(next.emergencyFund.currentAmountCents, 80000);
  assert.equal(budget.goals[0].monthlyAmountCents, 100000);
  assert.equal(
    sumAmounts(plannedSavingsRows(applySavingsPlan(next, plannedSavingsRows(next)))),
    170000,
  );
});

test('removing a contribution does not delete its goal or the accumulated emergency fund', () => {
  const next = applySavingsPlan(budget, budget.savings);
  assert.equal(next.goals[0].id, 'trip');
  assert.equal(next.goals[0].monthlyAmountCents, 0);
  assert.equal(next.emergencyFund.monthlyAmountCents, 0);
  assert.equal(next.emergencyFund.currentAmountCents, 80000);
});

test('agent uses the onboarding goal in the selected month instead of stale profile fields', () => {
  const profile = { goalName: 'Anterior', cost: 123, days: 5 };
  const primary = primaryBudgetGoal(budget, profile, '2026-10');
  assert.deepEqual(primary, { name: 'Viaje', cost: 12000, days: 365 });
  assert.deepEqual(toPlannerData(budget, profile, [], '2026-10').goal, primary);
  assert.deepEqual(primaryBudgetGoal({}, profile, '2026-10'), {
    name: 'Anterior',
    cost: 123,
    days: 5,
  });
});

test('saved-template autofill includes goal and emergency contributions and stays disabled otherwise', () => {
  const state = { budget, month: '2026-10', templateAutofillMonths: { '2026-10': true } };
  assert.equal(plannedMovementAmount(state, 'saving', 'Viaje'), 100000);
  assert.equal(plannedMovementAmount(state, 'saving', 'Fondo de emergencia'), 30000);
  assert.equal(
    plannedMovementAmount({ ...state, templateAutofillMonths: {} }, 'saving', 'Viaje'),
    null,
  );
});
