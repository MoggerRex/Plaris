import { financeSections } from '../config/financeSections.js';
import { sumAmounts } from './budgetService.js';

export function buildComparison(budget, transactions, month) {
  return financeSections
    .filter((section) => section.type)
    .map((section) => ({
      key: section.key,
      name: section.label,
      Planeado: sumAmounts(budget[section.key]) / 100,
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

  return {
    startDate: `${month}-01`,
    incomes: mapRows(budget.incomes),
    expenses: mapRows(budget.expenses),
    debts,
    savings: Number(profile.savings || 0),
    reserve: Number(profile.reserve || 0),
    goal: {
      name: profile.goalName || '',
      cost: Number(profile.cost || 0),
      days: Number(profile.days || 90),
    },
    context,
  };
}

export function selectedFinanceContext(budget, debts, comparison, sections, month) {
  const context = { periodo: month, moneda: 'MXN', secciones: {} };
  for (const key of sections) {
    if (key === 'debts') {
      context.secciones.deudas = debts;
    } else {
      context.secciones[key] = {
        conceptos: (budget[key] || []).map((row) => ({
          concepto: row.name,
          categoria: row.category,
          montoMensual: row.amountCents / 100,
        })),
        totales: comparison.find((item) => item.key === key),
      };
    }
  }
  return context;
}
