import { plannedSavingsRows } from './budgetConnections.js';
import { sumAmounts } from './budgetService.js';

export const PURCHASE_VERDICTS = {
  puede: { label: 'Sí puedes comprarlo sin desviar tu plan', tone: 'positive' },
  puede_con_ajustes: { label: 'Solo si ajustas tu plan', tone: 'warning' },
  no_puede: { label: 'No te conviene con tu plan actual', tone: 'negative' },
  faltan_datos: { label: 'Aún no hay ingresos reales registrados', tone: 'neutral' },
};

const toCents = (value) => Math.round((Number(value) || 0) * 100);

const normalizeText = (value) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const isFundSaving = (row) => {
  if (row?.savingsSource === 'emergency') return true;
  return normalizeText(row?.category || row?.name || row?.description || '').includes('fondo');
};

const sumRows = (rows) => rows.reduce((total, row) => total + (Number(row.amountCents) || 0), 0);

function groupByCategory(rows) {
  const grouped = new Map();
  for (const row of rows) {
    const category = String(row.category || row.description || 'Sin categoría').trim();
    grouped.set(category, (grouped.get(category) || 0) + (Number(row.amountCents) || 0));
  }
  return [...grouped.entries()]
    .map(([category, amountCents]) => ({ category, amountCents }))
    .sort((a, b) => b.amountCents - a.amountCents);
}

function mapPlannedRows(budget = {}) {
  const expenses = (budget.expenses || [])
    .map((row) => ({
      name: String(row.name || '').trim(),
      category: String(row.category || row.name || 'Sin categoría').trim(),
      amountCents: Number(row.amountCents) || 0,
      essential: row.essential !== false,
    }))
    .filter((row) => row.amountCents > 0);

  const savings = plannedSavingsRows(budget)
    .map((row) => ({
      name: String(row.name || '').trim(),
      category: String(row.category || row.name || 'Sin categoría').trim(),
      amountCents: Number(row.amountCents) || 0,
      source: row.savingsSource || 'manual',
      isFund: isFundSaving(row),
    }))
    .filter((row) => row.amountCents > 0);

  return { expenses, savings };
}

/**
 * Analiza una compra con los movimientos reales del mes y el plan del usuario.
 * Los gastos y ahorros planeados pendientes se descuentan; el ahorro en fondo se protege.
 */
export function buildPurchaseAnalysis({
  month,
  transactions = [],
  debts = [],
  budget = {},
  purchase = {},
} = {}) {
  const monthRows = (Array.isArray(transactions) ? transactions : []).filter(
    (item) => item?.date?.slice(0, 7) === month,
  );
  const rowsByType = (type) => monthRows.filter((item) => item.type === type);

  const incomeRows = rowsByType('income');
  const expenseRows = rowsByType('expense');
  const savingRows = rowsByType('saving');

  const incomeCents = sumRows(incomeRows);
  const expenseCents = sumRows(expenseRows);
  const savingCents = sumRows(savingRows);
  const realFundSavingCents = sumRows(savingRows.filter(isFundSaving));

  const plannedIncomeCents = sumAmounts(budget.incomes);
  const plannedRows = mapPlannedRows(budget);
  const plannedExpenseCents = sumRows(plannedRows.expenses);
  const plannedSavingCents = sumRows(plannedRows.savings);
  const plannedFundSavingCents = sumRows(plannedRows.savings.filter((row) => row.isFund));

  const debtRows = (Array.isArray(debts) ? debts : [])
    .filter((debt) => debt && String(debt.name || '').trim())
    .map((debt) => ({
      name: String(debt.name).trim(),
      balanceCents: toCents(debt.balance),
      paymentCents: toCents(debt.payment),
      minimumCents: toCents(debt.minimum),
      rate: Number(debt.rate) || 0,
    }));
  const debtPaymentCents = debtRows.reduce((total, debt) => total + debt.paymentCents, 0);
  const debtBalanceCents = debtRows.reduce((total, debt) => total + debt.balanceCents, 0);

  // El plan mensual manda cuando supera lo ya registrado: evita contar dos veces
  // un gasto o ahorro que ya ocurrió y que también está previsto para el mes.
  const projectedExpenseCents = Math.max(plannedExpenseCents, expenseCents);
  const projectedSavingCents = Math.max(plannedSavingCents, savingCents);
  const projectedFundSavingCents = Math.min(
    projectedSavingCents,
    Math.max(plannedFundSavingCents, realFundSavingCents),
  );

  // Si el plan contempla más ingreso del que ya registraste, se usa como ingreso
  // esperado del mes, pero el veredicto avisa que depende de que llegue.
  const expectedIncomeCents = Math.max(incomeCents, plannedIncomeCents);
  const pendingIncomeCents = Math.max(0, plannedIncomeCents - incomeCents);
  const pendingExpenseCents = Math.max(0, projectedExpenseCents - expenseCents);
  const pendingSavingCents = Math.max(0, projectedSavingCents - savingCents);
  const pendingFundSavingCents = Math.min(
    pendingSavingCents,
    Math.max(0, projectedFundSavingCents - realFundSavingCents),
  );
  const pendingNonFundSavingCents = pendingSavingCents - pendingFundSavingCents;

  const availableCents =
    expectedIncomeCents - projectedExpenseCents - projectedSavingCents - debtPaymentCents;
  const availableRealOnlyCents =
    incomeCents - projectedExpenseCents - projectedSavingCents - debtPaymentCents;
  const availableWithNonFundSavingsCents = availableCents + pendingNonFundSavingCents;
  const availableWithAllSavingsCents = availableCents + pendingSavingCents;

  const priceCents = Math.max(0, Math.round(Number(purchase.priceCents) || 0));
  const hasRealIncome = incomeCents > 0;
  const hasRealExpenses = expenseCents > 0;
  const hasRealSavings = savingCents > 0;

  const requiereIngresoPlaneado = pendingIncomeCents > 0 && priceCents > availableRealOnlyCents;
  const requiereAjustarAhorro =
    priceCents > availableCents && priceCents <= availableWithAllSavingsCents;
  const requiereFondo =
    priceCents > availableWithNonFundSavingsCents && priceCents <= availableWithAllSavingsCents;
  const montoAjusteAhorroCents = requiereAjustarAhorro
    ? Math.max(0, priceCents - availableCents)
    : 0;
  const montoFondoCents = requiereFondo
    ? Math.max(0, priceCents - availableWithNonFundSavingsCents)
    : 0;
  const faltanteCents = Math.max(0, priceCents - availableWithAllSavingsCents);

  let veredicto = 'faltan_datos';
  if (hasRealIncome) {
    if (priceCents <= availableRealOnlyCents) veredicto = 'puede';
    else if (priceCents <= availableCents) veredicto = 'puede_con_ajustes';
    else if (priceCents <= availableWithNonFundSavingsCents) veredicto = 'puede_con_ajustes';
    else if (priceCents <= availableWithAllSavingsCents) veredicto = 'puede_con_ajustes';
    else veredicto = 'no_puede';
  }

  let etiqueta = PURCHASE_VERDICTS[veredicto].label;
  if (veredicto === 'puede_con_ajustes') {
    if (requiereFondo) etiqueta = 'Usando tu ahorro en fondo';
    else if (priceCents > availableCents) etiqueta = 'Solo si ajustas tu plan';
    else if (requiereIngresoPlaneado) etiqueta = 'Solo cuando llegue el ingreso planeado';
  }

  return {
    month,
    purchase: {
      name: String(purchase.name || '').trim(),
      priceCents,
      note: String(purchase.note || '').trim(),
    },
    hasTransactions: monthRows.length > 0,
    hasRealIncome,
    hasRealExpenses,
    hasRealSavings,
    hasPlannedData: plannedIncomeCents > 0 || plannedExpenseCents > 0 || plannedSavingCents > 0,
    incomeCents,
    expenseCents,
    savingCents,
    realFundSavingCents,
    debtPaymentCents,
    debtBalanceCents,
    plannedIncomeCents,
    plannedExpenseCents,
    plannedSavingCents,
    plannedFundSavingCents,
    plannedExpenses: plannedRows.expenses,
    plannedSavings: plannedRows.savings,
    projectedExpenseCents,
    projectedSavingCents,
    projectedFundSavingCents,
    pendingIncomeCents,
    pendingExpenseCents,
    pendingSavingCents,
    pendingFundSavingCents,
    pendingNonFundSavingCents,
    expectedIncomeCents,
    availableCents,
    availableRealOnlyCents,
    availableWithNonFundSavingsCents,
    availableWithAllSavingsCents,
    incomeCategories: groupByCategory(incomeRows),
    expenseCategories: groupByCategory(expenseRows),
    savingCategories: groupByCategory(savingRows),
    debts: debtRows,
    calculo: {
      veredicto,
      etiqueta,
      tone: requiereFondo ? 'warning' : PURCHASE_VERDICTS[veredicto].tone,
      coberturaIngresoPct:
        expectedIncomeCents > 0 ? Math.round((priceCents / expectedIncomeCents) * 1000) / 10 : null,
      coberturaIngresoRealPct: hasRealIncome
        ? Math.round((priceCents / incomeCents) * 1000) / 10
        : null,
      disponibleDespuesCents: availableCents - priceCents,
      faltanteCents,
      montoAjusteAhorroCents,
      montoFondoCents,
      requiereAjustarAhorro,
      requiereFondo,
      requiereIngresoPlaneado,
      requiereUsarAhorro: requiereAjustarAhorro && !requiereFondo,
    },
  };
}