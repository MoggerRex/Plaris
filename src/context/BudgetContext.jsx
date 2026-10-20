import { useCallback, useEffect, useState } from 'react';
import { BudgetContext } from './useBudget';
import {
  cloneBudget,
  createId,
  currentMonthKey,
  emptyBudget,
  applySurplusAllocation,
  readBudgetState,
  validateZeroBasedBudget,
  writeBudgetState,
} from '../services/budgetService';

export function BudgetProvider({ children }) {
  const [data, setData] = useState(readBudgetState);
  const [storageError, setStorageError] = useState('');

  useEffect(() => {
    const handleStorageStatus = (event) => setStorageError(event.detail);
    window.addEventListener('plaris-storage-status', handleStorageStatus);
    return () => window.removeEventListener('plaris-storage-status', handleStorageStatus);
  }, []);

  useEffect(() => {
    try {
      writeBudgetState(data);
      window.dispatchEvent(new CustomEvent('plaris-storage-status', { detail: '' }));
    } catch (error) {
      console.error('No se pudieron guardar los datos del presupuesto:', error);
      window.dispatchEvent(new CustomEvent('plaris-storage-status', {
        detail: 'No fue posible guardar los cambios en este dispositivo.',
      }));
    }
  }, [data]);

  function updateDraft(section, items) {
    setData((previous) => ({ ...previous, draft: { ...previous.draft, [section]: items } }));
  }

  function updateMetasFinancieras(metas) {
    setData((previous) => ({ ...previous, metas_financieras: metas }));
  }

  function completeOnboarding() {
    const budget = applySurplusAllocation(data.draft, data.draft.surplusAllocation);
    const result = validateZeroBasedBudget(budget);
    if (!result.valid) throw new Error(result.errors.join(' '));
    if (result.pending > 0) throw new Error('Elige cómo quieres usar el dinero que queda sin asignar.');
    const template = cloneBudget(budget);
    const month = currentMonthKey();
    setData((previous) => ({
      ...previous,
      onboardingComplete: true,
      template,
      monthlyBudgets: { ...previous.monthlyBudgets, [month]: cloneBudget(budget) },
    }));
  }

  const ensureMonth = useCallback((month) => {
    setData((previous) => {
      if (previous.monthlyBudgets[month]) return previous;
      return {
        ...previous,
        monthlyBudgets: {
          ...previous.monthlyBudgets,
          [month]: cloneBudget(previous.template || emptyBudget()),
        },
      };
    });
  }, []);

  function updateBudget(month, section, items) {
    setData((previous) => ({
      ...previous,
      monthlyBudgets: {
        ...previous.monthlyBudgets,
        [month]: {
          ...(previous.monthlyBudgets[month] || cloneBudget(previous.template || emptyBudget())),
          [section]: items,
        },
      },
    }));
  }

  function saveAsTemplate(month) {
    const budget = data.monthlyBudgets[month];
    if (budget) setData((previous) => ({ ...previous, template: cloneBudget(budget) }));
  }

  function addTransaction(transaction) {
    setData((previous) => ({
      ...previous,
      transactions: [{ ...transaction, id: createId() }, ...previous.transactions],
    }));
  }

  function updateTransaction(id, transaction) {
    setData((previous) => ({
      ...previous,
      transactions: previous.transactions.map((item) => item.id === id ? { ...item, ...transaction } : item),
    }));
  }

  function deleteTransaction(id) {
    setData((previous) => ({
      ...previous,
      transactions: previous.transactions.filter((item) => item.id !== id),
    }));
  }

  return (
    <BudgetContext.Provider value={{
      ...data,
      storageError,
      updateDraft,
      updateMetasFinancieras,
      completeOnboarding,
      ensureMonth,
      updateBudget,
      saveAsTemplate,
      addTransaction,
      updateTransaction,
      deleteTransaction,
    }}>
      {children}
    </BudgetContext.Provider>
  );
}
