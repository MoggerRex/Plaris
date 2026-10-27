import { financeSections } from '../config/financeSections.js';
import { plannedSavingsRows, primaryBudgetGoal } from './budgetConnections.js';
import { sumAmounts } from './budgetService.js';
import { analysisMovements, expenseBreakdown } from './analysisMovements.js';

export function buildComparison(budget, transactions, month) {
  return financeSections
    .filter((section) => section.type)
    .map((section) => ({
      key: section.key,
      name: section.label,
      Planeado:
        sumAmounts(section.key === 'savings' ? plannedSavingsRows(budget) : budget[section.key]) /
        100,
      Real:
        sumAmounts(
          transactions.filter(
            (item) => item.type === section.type && item.date?.slice(0, 7) === month,
          ),
        ) / 100,
    }));
}

export function toPlannerData(budget, profile, debts, month, context = '') {
  const mapRows = (rows) =>
    (rows || [])
      .filter((row) => row.amountCents > 0)
      .map((row) => ({
        id: row.id,
        name: row.name,
        amount: row.amountCents / 100,
        frequency: 'mensual',
        essential: row.essential !== false,
        category: row.category || row.name,
      }));

  const hasOnboardingPlan =
    (budget.goals || []).length > 0 ||
    Number(budget.emergencyFund?.currentAmountCents || 0) > 0 ||
    Number(budget.emergencyFund?.monthlyAmountCents || 0) > 0;
  const emergencyCurrent = Number(budget.emergencyFund?.currentAmountCents || 0) / 100;
  const legacySavings = Number(profile.savings || 0);
  const legacyReserve = Number(profile.reserve || 0);

  return {
    startDate: `${month}-01`,
    incomes: mapRows(budget.incomes),
    expenses: mapRows(budget.expenses),
    debts: (debts || []).map((debt) => ({ ...debt, dueDate: debt.dueDate || null })),
    savings: hasOnboardingPlan ? emergencyCurrent : legacySavings,
    reserve: hasOnboardingPlan ? emergencyCurrent : legacyReserve,
    plannedSavings: sumAmounts(plannedSavingsRows(budget)) / 100,
    goalContributions: (budget.goals || []).reduce(
      (total, goal) => total + Number(goal.monthlyAmountCents || 0) / 100,
      0,
    ),
    goals: (budget.goals || []).map((goal, priority) => ({
      id: goal.id,
      name: goal.name,
      target: Number(goal.targetCents || 0) / 100,
      monthlyAmount: Number(goal.monthlyAmountCents || 0) / 100,
      targetDate: goal.targetDate || null,
      priority: priority + 1,
    })),
    emergencyFund: {
      targetMonths: Number(budget.emergencyFund?.targetMonths || 3),
      currentAmount: Number(budget.emergencyFund?.currentAmountCents || 0) / 100,
      monthlyAmount: Number(budget.emergencyFund?.monthlyAmountCents || 0) / 100,
    },
    goal: primaryBudgetGoal(budget, profile, month),
    context,
  };
}

export function selectedFinanceContext(
  budget,
  debts,
  comparison,
  sections,
  month,
  transactions = [],
) {
  const context = { periodo: month, moneda: 'MXN', secciones: {} };
  const movements = analysisMovements(transactions, sections, month);
  context.movimientosReales = movements.map((item) => ({
    fecha: item.date,
    tipo: item.type,
    categoria: item.category,
    descripcion: item.description || '',
    monto: item.amountCents / 100,
  }));
  if (sections.includes('expenses')) context.desgloseGastos = expenseBreakdown(budget, movements);
  for (const key of sections) {
    if (key === 'debts') {
      context.secciones.deudas = debts;
    } else {
      context.secciones[key] = {
        conceptos: (key === 'savings' ? plannedSavingsRows(budget) : budget[key] || []).map(
          (row) => ({
            concepto: row.name,
            categoria: row.category,
            montoMensual: row.amountCents / 100,
            ...(key === 'expenses' ? { noNegociable: row.essential !== false } : {}),
          }),
        ),
        totales: comparison.find((item) => item.key === key),
      };
    }
  }
  if (sections.includes('savings')) {
    context.secciones.metas = (budget.goals || []).map((goal, index) => ({
      prioridad: index + 1,
      nombre: goal.name,
      costo: goal.targetCents / 100,
      aportacionMensual: goal.monthlyAmountCents / 100,
      fechaObjetivo: goal.targetDate || null,
    }));
    context.secciones.fondoEmergencia = {
      mesesObjetivo: budget.emergencyFund?.targetMonths || 3,
      montoActual: (budget.emergencyFund?.currentAmountCents || 0) / 100,
      aportacionMensual: (budget.emergencyFund?.monthlyAmountCents || 0) / 100,
    };
  }
  return context;
}
