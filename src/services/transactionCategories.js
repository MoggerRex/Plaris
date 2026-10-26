import { transactionTypes } from '../config/transactionTypes.js';

const defaultCategories = {
  income: ['Sueldo', 'Otros ingresos'],
  expense: ['Alimentación', 'Vivienda', 'Transporte', 'Servicios', 'Otros gastos'],
  saving: ['Ahorro'],
};

// Saved plans define each type's options. Keep an old category only while editing it.
export function categoriesForBudget(budget, type, editing = null) {
  const section = transactionTypes.find((item) => item.value === type)?.section;
  const planned = (budget[section] || [])
    .map((row) => (row.name || row.category || '').trim())
    .filter(Boolean);
  const choices = planned.length ? planned : defaultCategories[type] || [];
  const previous = editing?.type === type ? (editing.category || '').trim() : '';
  return [...new Set([...choices, previous].filter(Boolean))];
}

// A named template must have been saved or loaded for this specific month.
export function plannedMovementAmount(state, type, category) {
  if (!state.templateAutofillMonths?.[state.month]) return null;
  const section = transactionTypes.find((item) => item.value === type)?.section;
  const matches = (state.budget[section] || []).filter(
    (row) => (row.name || row.category || '').trim() === category.trim(),
  );
  if (!matches.length) return null;
  const amount = matches.reduce((total, row) => total + row.amountCents, 0);
  return Number.isFinite(amount) && amount >= 0 ? amount : null;
}
