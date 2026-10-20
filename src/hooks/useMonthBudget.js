import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useBudget } from '../context/useBudget';
import { currentMonthKey, emptyBudget, totalsForBudget } from '../services/budgetService';
import { buildComparison } from '../services/financeAdapter';

export function useMonthBudget() {
  const [params, setParams] = useSearchParams();
  const state = useBudget();
  const { ensureMonth } = state;
  const requested = params.get('mes');
  const month = /^\d{4}-(0[1-9]|1[0-2])$/.test(requested || '') ? requested : currentMonthKey();

  useEffect(() => {
    ensureMonth(month);
  }, [month, ensureMonth]);

  const budget = state.monthlyBudgets[month] || state.template || emptyBudget();

  function changeMonth(value) {
    if (!value) return;
    const next = new URLSearchParams(params);
    next.set('mes', value);
    setParams(next);
  }

  return {
    ...state,
    month,
    changeMonth,
    budget,
    totals: totalsForBudget(budget),
    comparison: buildComparison(budget, state.transactions, month),
  };
}
