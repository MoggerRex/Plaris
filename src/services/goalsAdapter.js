// Agent forms use cents; legacy profile amounts use pesos.
export function profileToGoals(profile = {}) {
  if (!profile.goalName) return [];
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
  const goals = (budget.goals || []).map((goal) => ({
    id: goal.id,
    name: goal.name,
    cost: goal.targetCents,
    deadlineDays: Math.max(
      1,
      Math.ceil((Date.parse(goal.targetDate) - Date.parse(month + '-01')) / 86400000) || 90,
    ),
    currentSaving: goal.currentAmountCents || 0,
    protectedReserve: goal.protectedReserve || 0,
  }));
  return goals.length ? goals : profileToGoals(profile);
}

export function goalToBudget(goal, month, id) {
  const deadline = new Date(month + '-01T12:00:00Z');
  deadline.setUTCDate(deadline.getUTCDate() + Number(goal.deadlineDays));
  return {
    id,
    name: goal.name,
    targetCents: goal.cost,
    targetDate: deadline.toISOString().slice(0, 10),
    monthlyAmountCents: 0,
    currentAmountCents: goal.currentSaving,
    protectedReserve: goal.protectedReserve,
  };
}
