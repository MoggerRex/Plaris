import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useMonthBudget } from '../hooks/useMonthBudget';
import { amountToCents } from '../services/budgetService';
import { transactionTypes } from '../config/transactionTypes';
import PageHeading from '../components/common/PageHeading';
import MonthPicker from '../components/common/MonthPicker';
import TransactionPanel from '../components/transactions/TransactionPanel';

export default function Movimientos() {
  const state = useMonthBudget();
  return (
    <main className="page-shell">
      <Link className="back-link" to={'/graficas?mes=' + state.month}>
        <ArrowLeft size={18} /> Volver a tablas y gráficas
      </Link>
      <PageHeading title="Movimientos reales">
        <MonthPicker month={state.month} onChange={state.changeMonth} />
      </PageHeading>
      <p>
        Registra lo que ya recibiste, gastaste o ahorraste. Estos movimientos actualizan la serie
        Real del mes de su fecha, sin cambiar tu presupuesto planeado.
      </p>
      <MonthlyTransactions key={state.month} state={state} />
      <Link className="button button-secondary" to={'/graficas?mes=' + state.month}>
        Ver mis gráficas actualizadas
      </Link>
    </main>
  );
}

function MonthlyTransactions({ state }) {
  const [editing, setEditing] = useState(null);
  const [type, setType] = useState('expense');
  const [message, setMessage] = useState('');
  const transactions = state.transactions.filter((item) => item.date?.slice(0, 7) === state.month);

  function save(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const transaction = {
      type: String(form.get('type')),
      category: String(form.get('category')).trim(),
      description: String(form.get('description')).trim(),
      date: String(form.get('date')),
      amountCents: amountToCents(form.get('amount')),
    };
    if (!transaction.category || !transaction.date || transaction.amountCents <= 0) {
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
    const section = transactionTypes.find((item) => item.value === selectedType)?.section;
    return [
      ...new Set(
        (state.budget[section] || []).map((item) => item.category || item.name).filter(Boolean),
      ),
    ];
  }

  function changeType(next) {
    if (editing) setEditing({ ...editing, type: next, category: '' });
    else setType(next);
  }

  return (
    <TransactionPanel
      month={state.month}
      transactions={transactions}
      categoriesFor={categoriesFor}
      editingTransaction={editing}
      newTransactionType={type}
      setEditingTransaction={setEditing}
      saveTransaction={save}
      startEdit={setEditing}
      changeType={changeType}
      deleteTransaction={(id) => {
        state.deleteTransaction(id);
        setMessage('Movimiento eliminado.');
      }}
      message={message}
    />
  );
}
