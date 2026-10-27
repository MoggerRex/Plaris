export const PURCHASE_VERDICTS = {
  puede: { label: 'Sí puedes comprarlo', tone: 'positive' },
  puede_con_ajustes: { label: 'Puedes comprarlo con ajustes', tone: 'warning' },
  no_puede: { label: 'No te alcanza con tu dinero real', tone: 'negative' },
  faltan_datos: { label: 'Aún no hay ingresos reales registrados', tone: 'neutral' },
};

const toCents = (value) => Math.round((Number(value) || 0) * 100);

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

/**
 * Analiza una compra con los movimientos reales del mes seleccionado.
 * No usa el presupuesto planeado: solo transacciones registradas y deudas vigentes.
 */
export function buildPurchaseAnalysis({
  month,
  transactions = [],
  debts = [],
  purchase = {},
} = {}) {
  const monthRows = (Array.isArray(transactions) ? transactions : []).filter(
    (item) => item?.date?.slice(0, 7) === month,
  );
  const rowsByType = (type) => monthRows.filter((item) => item.type === type);

  const incomeRows = rowsByType('income');
  const expenseRows = rowsByType('expense');
  const savingRows = rowsByType('saving');

  const sum = (rows) => rows.reduce((total, row) => total + (Number(row.amountCents) || 0), 0);
  const incomeCents = sum(incomeRows);
  const expenseCents = sum(expenseRows);
  const savingCents = sum(savingRows);

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

  const availableCents = incomeCents - expenseCents - savingCents - debtPaymentCents;
  const cashBeforeSavingsCents = incomeCents - expenseCents - debtPaymentCents;

  const priceCents = Math.max(0, Math.round(Number(purchase.priceCents) || 0));
  const hasRealIncome = incomeCents > 0;
  const hasRealExpenses = expenseCents > 0;
  const hasRealSavings = savingCents > 0;

  let veredicto = 'faltan_datos';
  if (hasRealIncome) {
    if (priceCents <= availableCents) veredicto = 'puede';
    else if (priceCents <= cashBeforeSavingsCents) veredicto = 'puede_con_ajustes';
    else veredicto = 'no_puede';
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
    incomeCents,
    expenseCents,
    savingCents,
    debtPaymentCents,
    debtBalanceCents,
    availableCents,
    cashBeforeSavingsCents,
    incomeCategories: groupByCategory(incomeRows),
    expenseCategories: groupByCategory(expenseRows),
    savingCategories: groupByCategory(savingRows),
    debts: debtRows,
    calculo: {
      veredicto,
      etiqueta: PURCHASE_VERDICTS[veredicto].label,
      tone: PURCHASE_VERDICTS[veredicto].tone,
      coberturaIngresoPct: hasRealIncome
        ? Math.round((priceCents / incomeCents) * 1000) / 10
        : null,
      disponibleDespuesCents: availableCents - priceCents,
      faltanteCents: Math.max(0, priceCents - cashBeforeSavingsCents),
      requiereAjustarAhorro: veredicto === 'puede_con_ajustes',
    },
  };
}
