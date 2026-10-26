import test from 'node:test';
import assert from 'node:assert/strict';
import { saveTemplate, applyTemplate, deleteTemplate } from '../src/services/templateService.js';
import { plannedMovementAmount } from '../src/services/transactionCategories.js';
import { readBudgetState, writeBudgetState } from '../src/services/budgetService.js';

function fixture() {
  const budget = {
    incomes: [
      { name: 'Sueldo', amountCents: 100000 },
      { name: 'Arreglo de compu', amountCents: 75000 },
    ],
    expenses: [{ name: 'Vivienda', amountCents: 50000 }],
    savings: [{ name: 'Viaje', amountCents: 20000 }],
  };
  return { month: '2026-10', budget, monthlyBudgets: { '2026-10': budget }, savedTemplates: [] };
}

test('no template action means no suggested amount even with saved planned amounts', () => {
  assert.equal(plannedMovementAmount(fixture(), 'income', 'Sueldo'), null);
});

test('saving a template enables suggestions for all three types in that month only', () => {
  const state = saveTemplate(fixture(), 'Mi presupuesto', '2026-10');
  assert.equal(plannedMovementAmount(state, 'income', 'Sueldo'), 100000);
  assert.equal(plannedMovementAmount(state, 'income', 'Arreglo de compu'), 75000);
  assert.equal(plannedMovementAmount(state, 'expense', 'Vivienda'), 50000);
  assert.equal(plannedMovementAmount(state, 'saving', 'Viaje'), 20000);
  assert.equal(plannedMovementAmount(state, 'income', 'Desconocida'), null);
  assert.equal(plannedMovementAmount({ ...state, month: '2026-11' }, 'income', 'Sueldo'), null);
});

test('loading a template enables the target month; missing templates do not', () => {
  const original = fixture();
  assert.equal(applyTemplate(original, 'missing', '2026-11'), original);
  const saved = saveTemplate(original, 'Base', '2026-10');
  const loaded = applyTemplate(saved, saved.savedTemplates[0].id, '2026-11');
  assert.equal(
    plannedMovementAmount(
      { ...loaded, month: '2026-11', budget: loaded.monthlyBudgets['2026-11'] },
      'income',
      'Sueldo',
    ),
    100000,
  );
});

test('template autofill activation survives local storage reload', () => {
  const previous = globalThis.localStorage;
  const entries = new Map();
  globalThis.localStorage = {
    getItem: (key) => entries.get(key) ?? null,
    setItem: (key, value) => entries.set(key, value),
  };
  try {
    writeBudgetState(saveTemplate(fixture(), 'Base', '2026-10'));
    const restored = readBudgetState();
    assert.equal(restored.templateAutofillMonths['2026-10'], true);
    assert.equal(
      plannedMovementAmount(
        { ...restored, month: '2026-10', budget: restored.monthlyBudgets['2026-10'] },
        'income',
        'Sueldo',
      ),
      100000,
    );
  } finally {
    globalThis.localStorage = previous;
  }
});

test('deleting a template preserves applied budgets, movements and other templates', () => {
  const first = saveTemplate(fixture(), 'Base', '2026-10');
  const second = saveTemplate(first, 'Otra', '2026-10');
  const loaded = applyTemplate(second, first.savedTemplates[0].id, '2026-11');
  const state = { ...loaded, transactions: [{ id: 'real', amountCents: 25000 }] };
  const result = deleteTemplate(state, first.savedTemplates[0].id);
  assert.equal(result.savedTemplates.length, 1);
  assert.equal(result.savedTemplates[0].name, 'Otra');
  assert.equal(result.monthlyBudgets, state.monthlyBudgets);
  assert.equal(result.transactions, state.transactions);
  assert.equal(result.templateAutofillMonths, state.templateAutofillMonths);
  assert.equal(state.savedTemplates.length, 2);
});
