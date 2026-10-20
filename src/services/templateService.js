import { cloneBudget, createId, emptyBudget } from './budgetService.js';

export function snapshotTemplate(state, name, month) {
  if (!name.trim()) throw new Error('Escribe el nombre de la plantilla.');
  return {
    id: createId(),
    name: name.trim(),
    createdAt: new Date().toISOString(),
    budget: cloneBudget(state.monthlyBudgets[month] || state.template || emptyBudget()),
    debts: structuredClone(state.deudas_activas || []),
    profile: { ...state.profile },
  };
}

export function applyTemplate(state, id, month) {
  const selected = state.savedTemplates?.find((item) => item.id === id);
  if (!selected) return state;
  return {
    ...state,
    monthlyBudgets: { ...state.monthlyBudgets, [month]: cloneBudget(selected.budget) },
    deudas_activas: structuredClone(selected.debts),
    profile: { ...selected.profile },
  };
}
