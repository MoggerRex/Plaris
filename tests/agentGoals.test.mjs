import test from 'node:test';
import assert from 'node:assert/strict';
import { budgetToGoals, goalToBudget, profileToGoals } from '../src/services/goalsAdapter.js';

test('agent form keeps main onboarding amounts in cents and prefers monthly goals', () => {
  const budget = {
    goals: [
      {
        id: 'g',
        name: 'Laptop',
        targetCents: 120000,
        targetDate: '2026-11-01',
        currentAmountCents: 15000,
        monthlyAmountCents: 10000,
      },
    ],
  };
  const before = JSON.stringify(budget);
  const [goal] = budgetToGoals(budget, { goalName: 'Legacy', cost: 9000 }, '2026-10');
  assert.equal(goal.name, 'Laptop');
  assert.equal(goal.cost, 120000);
  assert.equal(goal.deadlineDays, 31);
  assert.equal(goal.currentSaving, 15000);
  assert.equal(JSON.stringify(budget), before);
});

test('legacy profile goals convert pesos once and remain available without onboarding goals', () => {
  const profile = { goalName: 'Viaje', cost: '2500', days: 60, savings: '500', reserve: '100' };
  assert.deepEqual(budgetToGoals({}, profile, '2026-10'), profileToGoals(profile));
  const [goal] = profileToGoals(profile);
  assert.equal(goal.cost, 250000);
  assert.equal(goal.currentSaving, 50000);
  assert.equal(goal.protectedReserve, 10000);
  assert.deepEqual(profileToGoals({}), []);
});

test('new agent goals retain savings and reserve without assigning an unapproved monthly contribution', () => {
  const goal = {
    name: 'Viaje',
    cost: 500000,
    deadlineDays: 31,
    currentSaving: 20000,
    protectedReserve: 5000,
  };
  assert.deepEqual(goalToBudget(goal, '2026-10', 'new'), {
    id: 'new',
    name: 'Viaje',
    targetCents: 500000,
    targetDate: '2026-11-01',
    monthlyAmountCents: 0,
    currentAmountCents: 20000,
    protectedReserve: 5000,
  });
});
