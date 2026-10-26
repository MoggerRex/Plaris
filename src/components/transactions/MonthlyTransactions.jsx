import { useState } from 'react';
import { amountToCents } from '../../services/budgetService';
import { categoriesForBudget, plannedMovementAmount } from '../../services/transactionCategories';
import TransactionPanel from './BudgetTransactionPanel';

export default function MonthlyTransactions({ state, plannedContent }) {
  const [editing, setEditing] = useState(null);
  const [type, setType] = useState('expense');
  const [message, setMessage] = useState('');
  const transactions = state.transactions.filter((item) => item.date?.slice(0, 7) === state.month);

  function save(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const transaction = {
      type: String(form.get('type')),
      category: String(form.get('category') || '').trim(),
      description: editing?.description || '',
      date: String(form.get('date')),
      amountCents: amountToCents(form.get('amount')),
    };
    if (
      !transaction.category ||
      !transaction.date ||
      !Number.isFinite(transaction.amountCents) ||
      transaction.amountCents <= 0
    ) {
      setMessage('Completa la categoría, fecha y un monto mayor a cero.');
      return;
    }
    if (editing?.id) state.updateTransaction(editing.id, transaction);
    else state.addTransaction(transaction);
    event.currentTarget.reset();
    setEditing(null);
    setType('expense');
    setMessage('Movimiento guardado. Puedes verlo en el mes ' + transaction.date.slice(0, 7) + '.');
  }

  function categoriesFor(selectedType) {
    return categoriesForBudget(state.budget, selectedType, editing);
  }

  function changeType(next) {
    if (editing) setEditing({ ...editing, type: next, category: '' });
    else setType(next);
  }

  return (
    <TransactionPanel
      plannedContent={plannedContent}
      month={state.month}
      transactions={transactions}
      categoriesFor={categoriesFor}
      autofillEnabled={Boolean(state.templateAutofillMonths?.[state.month])}
      amountForCategory={(selectedType, category) =>
        plannedMovementAmount(state, selectedType, category)
      }
      editingTransaction={editing}
      newTransactionType={type}
      setEditingTransaction={setEditing}
      saveTransaction={save}
      startEdit={setEditing}
      changeType={changeType}
      deleteTransaction={(id) => {
        state.deleteTransaction(id);
        if (editing?.id === id) setEditing(null);
        setMessage('Movimiento eliminado.');
      }}
      message={message}
    />
  );
}
