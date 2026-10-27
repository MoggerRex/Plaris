import { applySavingsPlan } from '../services/budgetConnections';
import { normalizeAnalysisRecord } from '../services/analysisHistory';
import { saveTemplate, applyTemplate, deleteTemplate } from '../services/templateService';
import { useCallback, useEffect, useState } from 'react';
import { BudgetContext } from './useBudget';
import {
  cloneBudget,
  createId,
  currentMonthKey,
  emptyBudget,
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
      window.dispatchEvent(
        new CustomEvent('plaris-storage-status', {
          detail: 'No fue posible guardar los cambios en este dispositivo.',
        }),
      );
    }
  }, [data]);

  function updateDraft(section, items) {
    setData((previous) => ({ ...previous, draft: { ...previous.draft, [section]: items } }));
  }

  function completeOnboarding() {
    const budget = data.draft;
    const result = validateZeroBasedBudget(budget, data.deudas_activas);
    if (!result.valid) throw new Error(result.errors.join(' '));
    if (result.pending > 0)
      throw new Error(
        'Asigna todo el ingreso entre gastos, ahorros, metas, fondo de emergencia y pagos de deuda.',
      );
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

  function updateSavingsPlan(month, rows) {
    setData((previous) => ({
      ...previous,
      monthlyBudgets: {
        ...previous.monthlyBudgets,
        [month]: applySavingsPlan(
          previous.monthlyBudgets[month] || cloneBudget(previous.template || emptyBudget()),
          rows,
        ),
      },
    }));
  }

  function updateProfile(profile) {
    setData((previous) => ({ ...previous, profile }));
  }

  function updateDebts(debts) {
    setData((previous) => ({ ...previous, deudas_activas: debts }));
  }

  function saveNamedTemplate(name, month) {
    setData((previous) => saveTemplate(previous, name, month));
  }

  function applyNamedTemplate(id, month) {
    setData((previous) => applyTemplate(previous, id, month));
  }

  function deleteNamedTemplate(id) {
    setData((previous) => deleteTemplate(previous, id));
  }

  const saveAnalysis = useCallback((record) => {
    setData((previous) => ({
      ...previous,
      analysisHistory: [normalizeAnalysisRecord(record), ...(previous.analysisHistory || [])].slice(
        0,
        50,
      ),
    }));
  }, []);

  // Elimina un análisis del historial. Acepta el registro completo o su id,
  // y tolera registros antiguos sin id comparando fecha y mes.
  const deleteAnalysis = useCallback((recordOrId) => {
    const id = typeof recordOrId === 'string' ? recordOrId : recordOrId?.id;
    const fallback =
      typeof recordOrId === 'object' && recordOrId
        ? { createdAt: recordOrId.createdAt, month: recordOrId.month }
        : null;

    setData((previous) => ({
      ...previous,
      analysisHistory: (previous.analysisHistory || []).filter((item) => {
        if (id) return item.id !== id;
        if (fallback?.createdAt) {
          return !(item.createdAt === fallback.createdAt && item.month === fallback.month);
        }
        return true;
      }),
    }));
  }, []);

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
      transactions: previous.transactions.map((item) =>
        item.id === id ? { ...item, ...transaction } : item,
      ),
    }));
  }

  function deleteTransaction(id) {
    setData((previous) => ({
      ...previous,
      transactions: previous.transactions.filter((item) => item.id !== id),
    }));
  }

  return (
    <BudgetContext.Provider
      value={{
        ...data,
        storageError,
        updateProfile,
        updateDebts,
        saveNamedTemplate,
        applyNamedTemplate,
        deleteNamedTemplate,
        saveAnalysis,
        deleteAnalysis,
        updateDraft,
        completeOnboarding,
        ensureMonth,
        updateBudget,
        updateSavingsPlan,
        saveAsTemplate,
        addTransaction,
        updateTransaction,
        deleteTransaction,
      }}
    >
      {children}
    </BudgetContext.Provider>
  );
}
