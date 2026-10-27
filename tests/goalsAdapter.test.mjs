import test from 'node:test';
import assert from 'node:assert/strict';
import { profileToGoals, budgetToGoals, formToBudgetGoal } from '../src/services/goalsAdapter.js';

test('agent forms convert legacy profile MXN to cents and preserve budget goal units', () => {
  const profile = { goalName: 'Laptop', cost: 12000, days: 90, savings: 800, reserve: 200 };
  const legacy = profileToGoals(profile)[0];
  assert.equal(legacy.cost, 1200000);
  assert.equal(legacy.currentSaving, 80000);
  assert.equal(legacy.protectedReserve, 20000);
  const goal = formToBudgetGoal({ ...legacy, deadlineDays: 31 }, '2026-10', 'new-goal');
  assert.equal(goal.targetDate, '2026-11-01');
  assert.equal(goal.targetCents, 1200000);
  const result = budgetToGoals({ goals: [goal] }, profile, '2026-10');
  assert.equal(result.length, 1);
  assert.equal(result[0].id, 'new-goal');
  assert.equal(result[0].cost, 1200000);
  assert.equal(result[0].deadlineDays, 31);
  assert.equal(result[0].currentSaving, 80000);
  assert.deepEqual(budgetToGoals({}, {}, '2026-10'), []);
});
