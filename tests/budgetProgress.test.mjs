import test from 'node:test';
import assert from 'node:assert/strict';
import {
  comparisonDifferenceCents,
  actualUnassignedCents,
} from '../src/services/financeAdapter.js';

test('excess savings and income are favorable; excess expenses are unfavorable', () => {
  assert.equal(comparisonDifferenceCents({ key: 'savings', Planeado: 1000, Real: 1500 }), 50000);
  assert.equal(comparisonDifferenceCents({ key: 'incomes', Planeado: 10000, Real: 11000 }), 100000);
  assert.equal(comparisonDifferenceCents({ key: 'expenses', Planeado: 1000, Real: 1500 }), -50000);
  assert.equal(comparisonDifferenceCents({ key: 'savings', Planeado: 1000, Real: 500 }), -50000);
});

test('unassigned actual money subtracts spending and savings, retains cents and deficits', () => {
  const actual = [
    { key: 'incomes', Planeado: 99999, Real: 10000.1 },
    { key: 'expenses', Planeado: 1, Real: 6000.05 },
    { key: 'savings', Planeado: 1, Real: 1500.02 },
  ];
  assert.equal(actualUnassignedCents(actual), 250003);
  assert.equal(actualUnassignedCents([]), 0);
  assert.equal(actualUnassignedCents([{ key: 'expenses', Real: 100 }]), -10000);
});
