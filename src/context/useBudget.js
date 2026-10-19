import { createContext, useContext } from 'react';

export const BudgetContext = createContext(null);

export const useBudget = () => {
  const context = useContext(BudgetContext);
  if (!context) throw new Error('useBudget debe usarse dentro de BudgetProvider.');
  return context;
};
