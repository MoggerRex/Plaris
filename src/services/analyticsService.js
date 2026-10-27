import { sumAmounts, totalsForBudget as budgetTotals } from './budgetService.js';

// Adapt the source charts to main's budget model, including goals and emergency savings.
function totalsForBudget(budget = {}) {
  return { ...budgetTotals(budget), debts: sumAmounts(budget.debts) };
}

function transactionBudgetMonth(transaction) {
  return transaction.type === 'income' &&
    /^\d{4}-(0[1-9]|1[0-2])$/.test(transaction.budgetMonth || '')
    ? transaction.budgetMonth
    : transaction.date?.slice(0, 7);
}

function reservedIncome(transactions, asOf, month) {
  return sumAmounts(
    transactions.filter(
      (item) =>
        item.type === 'income' &&
        item.status !== 'scheduled' &&
        item.date <= asOf &&
        transactionBudgetMonth(item) > month,
    ),
  );
}

function savingsBalance(opening, transactions, cutoff = '9999-12-31') {
  return transactions.reduce(
    (balance, item) => {
      if (item.status === 'scheduled' || item.date > cutoff) return balance;
      return (
        balance +
        (item.type === 'saving'
          ? item.amountCents
          : item.type === 'savings_withdrawal'
            ? -item.amountCents
            : 0)
      );
    },
    opening?.hasFunds ? opening.savingsCents : 0,
  );
}

function spendingNet(items) {
  return items.reduce(
    (sum, item) =>
      sum +
      (['income', 'savings_withdrawal', 'loan_received'].includes(item.type)
        ? item.amountCents
        : ['expense', 'saving', 'debt_payment'].includes(item.type)
          ? -item.amountCents
          : 0),
    0,
  );
}

const monthNames = [
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Sep',
  'Oct',
  'Nov',
  'Dic',
];
export const percentage = (actual, planned) => (planned > 0 ? (actual / planned) * 100 : null);
const net = spendingNet;
const total = (items, type) => sumAmounts(items.filter((item) => item.type === type));

export function buildAnalytics({
  month,
  transactions,
  monthlyBudgets,
  scope = 'month',
  today,
  openingFunds,
  debts = [],
}) {
  monthlyBudgets = { ...monthlyBudgets };
  if (debts.length && !monthlyBudgets[month]?.debts) {
    monthlyBudgets[month] = {
      ...monthlyBudgets[month],
      debts: debts.map((debt) => ({ amountCents: Math.round(Number(debt.payment || 0) * 100) })),
    };
  }
  const year = month.slice(0, 4);
  const endDay = new Date(Number(year), Number(month.slice(5)), 0).getDate();
  const monthEnd = `${month}-${endDay}`;
  const cutoff = monthEnd < today ? monthEnd : today;
  const confirmed = transactions.filter(
    (item) => item.status !== 'scheduled' && item.date <= cutoff,
  );
  const yearItems = confirmed.filter((item) => item.date?.slice(0, 4) === year);
  const monthItems = confirmed.filter((item) => transactionBudgetMonth(item) === month);
  const budgetYearItems = confirmed.filter(
    (item) => transactionBudgetMonth(item)?.slice(0, 4) === year,
  );
  const selected = scope === 'year' ? budgetYearItems : monthItems;
  const budget = monthlyBudgets[month] || {};
  const planned = totalsForBudget(budget);
  const actual = {
    income: total(monthItems, 'income'),
    expenses: total(monthItems, 'expense'),
    savings: total(monthItems, 'saving') - total(monthItems, 'savings_withdrawal'),
    debts: total(monthItems, 'debt_payment'),
  };
  const excess = Math.max(0, actual.expenses - planned.expenses);
  const complianceParts = [
    {
      label: 'Ingresos recibidos',
      value: percentage(actual.income, planned.income),
      rule: 'Recibidos / planeados',
    },
    {
      label: 'Gastos dentro del límite',
      value:
        planned.expenses > 0
          ? actual.expenses <= planned.expenses
            ? 100
            : (planned.expenses / actual.expenses) * 100
          : actual.expenses > 0
            ? 0
            : null,
      rule: '100% si no excedes; si excedes, planeado / real',
    },
    {
      label: 'Meta de ahorro',
      value: percentage(actual.savings, planned.savings),
      rule: 'Ahorro real / planeado',
    },
    {
      label: 'Pagos de deuda',
      value: percentage(actual.debts, planned.debts),
      rule: 'Pagado / planeado',
    },
  ].map((part) => ({
    ...part,
    value: part.value === null ? null : Math.max(0, Math.min(100, part.value)),
  }));
  const scored = complianceParts.filter((part) => part.value !== null);
  const compliance =
    Object.hasOwn(monthlyBudgets, month) && scored.length
      ? scored.reduce((sum, part) => sum + part.value, 0) / scored.length
      : null;
  const categories = new Map();
  selected
    .filter((item) => item.type === 'expense')
    .forEach((item) => {
      const category = item.category?.trim() || 'Sin categoría';
      categories.set(category, (categories.get(category) || 0) + item.amountCents);
    });
  const expenses = total(selected, 'expense');
  const categoryData = [...categories]
    .map(([category, amount]) => ({ category, amount, share: percentage(amount, expenses) }))
    .sort((a, b) => b.amount - a.amount);

  // La proyección parte del ahorro registrado y completa el plan pendiente, sin rendimientos.
  const cutoffMonth = cutoff.slice(0, 7);
  let cumulative = savingsBalance(openingFunds, confirmed, `${Number(year) - 1}-12-31`);
  let projected = cumulative;
  let plannedCumulative = 0;
  const referencePlan = monthlyBudgets[cutoffMonth] || budget;
  const fallbackSavings = totalsForBudget(referencePlan).savings;
  const hasProjection =
    cutoff.slice(0, 4) === year &&
    (savingsBalance(openingFunds, confirmed, cutoff) > 0 ||
      fallbackSavings > 0 ||
      yearItems.some((item) => item.type === 'saving') ||
      Object.entries(monthlyBudgets).some(
        ([key, value]) =>
          key.startsWith(`${year}-`) && key >= cutoffMonth && totalsForBudget(value).savings > 0,
      ));
  const annual = monthNames.map((label, index) => {
    const key = `${year}-${String(index + 1).padStart(2, '0')}`;
    const items = yearItems.filter((item) => item.date.slice(0, 7) === key);
    const assignedIncome = total(
      budgetYearItems.filter((item) => transactionBudgetMonth(item) === key),
      'income',
    );
    const p = totalsForBudget(monthlyBudgets[key] || {});
    const contributions = total(items, 'saving');
    const withdrawals = total(items, 'savings_withdrawal');
    const savings = contributions - withdrawals;
    cumulative += savings;
    plannedCumulative += p.savings;
    const future = key > cutoffMonth;
    if (!future) projected = cumulative;
    if (hasProjection && key >= cutoffMonth) {
      const expected = monthlyBudgets[key] ? p.savings : fallbackSavings;
      const partial =
        key === cutoffMonth && cutoff < `${key}-${new Date(Number(year), index + 1, 0).getDate()}`;
      projected += future ? expected : partial ? Math.max(0, expected - contributions) : 0;
    }
    return {
      month: label,
      key,
      plannedIncome: p.income,
      realIncome: future && assignedIncome === 0 ? null : assignedIncome,
      plannedExpense: p.expenses,
      realExpense: future ? null : total(items, 'expense'),
      plannedDebt: p.debts,
      realDebt: future ? null : total(items, 'debt_payment'),
      plannedSaving: p.savings,
      realSaving: future ? null : savings,
      contributions: future ? null : contributions,
      withdrawals: future ? null : withdrawals,
      cumulative: future ? null : cumulative,
      plannedCumulative,
      projected: hasProjection && key >= cutoffMonth ? projected : null,
    };
  });

  // Bloques de días 1–7, 8–14…; saldo basado en todos los movimientos registrados anteriores.
  const opening = net(confirmed.filter((item) => item.date < `${month}-01`));
  let balance = opening;
  const weeks = Array.from({ length: Math.ceil(endDay / 7) }, (_, index) => {
    const start = index * 7 + 1;
    const end = Math.min(start + 6, endDay);
    const startDate = `${month}-${String(start).padStart(2, '0')}`;
    const endDate = `${month}-${String(end).padStart(2, '0')}`;
    const items = confirmed.filter((item) => item.date >= startDate && item.date <= endDate);
    const flow = net(items);
    balance += flow;
    const reserved = reservedIncome(confirmed, endDate < cutoff ? endDate : cutoff, month);
    return {
      label: `${start}–${end}`,
      income: total(items, 'income'),
      borrowed: total(items, 'loan_received'),
      expenses: total(items, 'expense'),
      savings: total(items, 'saving') - total(items, 'savings_withdrawal'),
      debts: total(items, 'debt_payment'),
      flow: startDate > cutoff ? null : flow,
      balance: startDate > cutoff ? null : balance,
      reserved: startDate > cutoff ? null : reserved,
      available: startDate > cutoff ? null : balance - reserved,
    };
  });
  return {
    cutoff,
    planned,
    actual,
    compliance,
    complianceParts,
    excess,
    excessPercent: percentage(excess, planned.expenses),
    savingRate: percentage(
      total(selected, 'saving') - total(selected, 'savings_withdrawal'),
      total(selected, 'income'),
    ),
    selectedSavings: total(selected, 'saving') - total(selected, 'savings_withdrawal'),
    selectedIncome: total(selected, 'income'),
    categoryData,
    annual,
    weeks,
    opening,
    projection: hasProjection ? annual[11].projected : null,
    savedToDate: total(yearItems, 'saving') - total(yearItems, 'savings_withdrawal'),
    savingsStock: savingsBalance(openingFunds, confirmed, cutoff),
    fallbackSavings,
    hasMonthData: monthItems.some((item) => item.type !== 'transfer'),
    hasYearData: yearItems.some((item) => item.type !== 'transfer'),
  };
}
