// Read onboarding contributions as editable savings rows without copying them into savings.
export function plannedSavingsRows(budget) {
  const goals = (budget.goals || [])
    .filter((goal) => goal.name?.trim())
    .map((goal) => ({
      id: `goal:${goal.id}`,
      name: goal.name,
      category: goal.name,
      amountCents: Number(goal.monthlyAmountCents) || 0,
      savingsSource: 'goal',
      goalId: goal.id,
    }));
  const emergency = budget.emergencyFund;
  const fund =
    emergency && (emergency.monthlyAmountCents > 0 || emergency.currentAmountCents > 0)
      ? [
          {
            id: 'emergency-fund',
            name: 'Fondo de emergencia',
            category: 'Fondo de emergencia',
            amountCents: Number(emergency.monthlyAmountCents) || 0,
            savingsSource: 'emergency',
          },
        ]
      : [];
  return [...(budget.savings || []), ...goals, ...fund];
}

export function applySavingsPlan(budget, rows) {
  const goalRows = new Map(
    rows.filter((row) => row.savingsSource === 'goal').map((row) => [row.goalId, row]),
  );
  const fund = rows.find((row) => row.savingsSource === 'emergency');
  return {
    ...budget,
    savings: rows.filter((row) => !row.savingsSource),
    goals: (budget.goals || []).map((goal) => {
      const row = goalRows.get(goal.id);
      return {
        ...goal,
        ...(row ? { name: row.name } : {}),
        monthlyAmountCents: row ? row.amountCents : 0,
      };
    }),
    emergencyFund: { ...budget.emergencyFund, monthlyAmountCents: fund?.amountCents || 0 },
  };
}

// Goals from the selected month's onboarding plan take priority over the legacy profile goal.
export function primaryBudgetGoal(budget, profile, month) {
  const goal = (budget.goals || []).find((item) => item.name?.trim() && item.targetCents > 0);
  if (!goal)
    return {
      name: profile.goalName || '',
      cost: Number(profile.cost || 0),
      days: Number(profile.days || 90),
    };
  const start = Date.parse(`${month}-01T00:00:00Z`);
  const end = Date.parse(`${goal.targetDate}T00:00:00Z`);
  const days = Number.isFinite(end) ? Math.max(1, Math.ceil((end - start) / 86400000)) : 90;
  return { name: goal.name, cost: goal.targetCents / 100, days };
}
