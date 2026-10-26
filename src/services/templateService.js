import { cloneBudget, createId, emptyBudget } from './budgetService.js';

export function snapshotTemplate(state, name, month) {
  if (!name.trim()) throw new Error('Escribe el nombre de la plantilla.');
  return {
    id: createId(),
    name: name.trim(),
    createdAt: new Date().toISOString(),
    budget: cloneBudget(state.monthlyBudgets[month] || state.template || emptyBudget()),
  };
}

export function saveTemplate(state, name, month) {
  const template = snapshotTemplate(state, name, month);
  return {
    ...state,
    savedTemplates: [template, ...(state.savedTemplates || [])],
    templateAutofillMonths: { ...state.templateAutofillMonths, [month]: true },
  };
}

export function applyTemplate(state, id, month) {
  const selected = state.savedTemplates?.find((item) => item.id === id);
  if (!selected) return state;
  return {
    ...state,
    monthlyBudgets: { ...state.monthlyBudgets, [month]: cloneBudget(selected.budget) },
    templateAutofillMonths: { ...state.templateAutofillMonths, [month]: true },
  };
}

export function deleteTemplate(state, id) {
  return {
    ...state,
    savedTemplates: (state.savedTemplates || []).filter((item) => item.id !== id),
  };
}
