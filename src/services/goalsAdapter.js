/**
 * Convierte la meta guardada en el perfil al formato que usan los formularios.
 *
 * Forma de una meta (montos en CENTAVOS, como usa MoneyInput):
 *   { id, name, cost, deadlineDays, currentSaving, protectedReserve }
 *
 * Convierte los montos del perfil (MXN) a centavos para los formularios.
 */
import { primaryBudgetGoal } from './budgetConnections.js';

export function profileToGoals(profile) {
  if (!profile?.goalName) return [];
  return [
    {
      id: 'profile-goal',
      name: profile.goalName,
      cost: Math.round(Number(profile.cost || 0) * 100),
      deadlineDays: Number(profile.days || 90),
      currentSaving: Math.round(Number(profile.savings || 0) * 100),
      protectedReserve: Math.round(Number(profile.reserve || 0) * 100),
    },
  ];
}

export function budgetToGoals(budget, profile, month) {
  const goals = (budget.goals || [])
    .filter((goal) => goal.name?.trim())
    .map((goal) => ({
      id: goal.id,
      name: goal.name,
      cost: goal.targetCents,
      deadlineDays: primaryBudgetGoal({ goals: [goal] }, profile, month).days,
      currentSaving: goal.currentSaving ?? Math.round(Number(profile.savings || 0) * 100),
      protectedReserve: goal.protectedReserve ?? Math.round(Number(profile.reserve || 0) * 100),
    }));
  return goals.length ? goals : profileToGoals(profile);
}

export function formToBudgetGoal(goal, month, id) {
  const target = new Date(`${month}-01T12:00:00Z`);
  target.setUTCDate(target.getUTCDate() + Number(goal.deadlineDays));
  return {
    id,
    name: goal.name,
    targetCents: goal.cost,
    targetDate: target.toISOString().slice(0, 10),
    monthlyAmountCents: 0,
    currentSaving: goal.currentSaving,
    protectedReserve: goal.protectedReserve,
  };
}
