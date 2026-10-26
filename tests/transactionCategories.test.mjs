import test from 'node:test';
import assert from 'node:assert/strict';
import { categoriesForBudget } from '../src/services/transactionCategories.js';

test('planned categories stay separate for incomes, expenses and savings', () => {
  const budget = {
    incomes: [{ name: 'Sueldo' }, { name: 'Arreglo de compu' }],
    expenses: [{ name: 'Vivienda' }],
    savings: [{ name: 'Emergencias' }, { name: 'Viaje' }],
  };
  assert.deepEqual(categoriesForBudget(budget, 'income'), ['Sueldo', 'Arreglo de compu']);
  assert.deepEqual(categoriesForBudget(budget, 'expense'), ['Vivienda']);
  assert.deepEqual(categoriesForBudget(budget, 'saving'), ['Emergencias', 'Viaje']);
});

test('category changes follow the current budget, ignoring blanks and duplicates', () => {
  const budget = { incomes: [{ name: ' Sueldo ' }, { name: 'Sueldo' }, { name: '  ' }] };
  assert.deepEqual(categoriesForBudget(budget, 'income'), ['Sueldo']);
  budget.incomes = [{ name: 'Consultas', category: 'Nombre anterior' }];
  assert.deepEqual(categoriesForBudget(budget, 'income'), ['Consultas']);
  assert.deepEqual(categoriesForBudget({}, 'saving'), ['Ahorro']);
});

test('editing retains a deleted category only for the original movement type', () => {
  const budget = { savings: [{ name: 'Viaje' }], incomes: [{ name: 'Sueldo' }] };
  const editing = { type: 'saving', category: 'Fondo anterior' };
  assert.deepEqual(categoriesForBudget(budget, 'saving', editing), ['Viaje', 'Fondo anterior']);
  assert.deepEqual(categoriesForBudget(budget, 'income', editing), ['Sueldo']);
});
