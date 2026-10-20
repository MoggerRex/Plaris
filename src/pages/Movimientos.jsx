import { useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Check, Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import BudgetRowsEditor from '../components/BudgetRowsEditor';
import SummaryCard from '../components/SummaryCard';
import { useBudget } from '../context/useBudget';
import { prepararContextoFinanciero } from '../utils/selectores';
import { generarPlanAvanzadoCoT } from '../services/ollamaService';
import {
  amountToCents,
  centsToInput,
  currentMonthKey,
  formatCurrency,
  sumAmounts,
  totalsForBudget,
} from '../services/budgetService';

const TRANSACTION_TYPES = [
  { value: 'income', label: 'Ingreso', section: 'incomes' },
  { value: 'expense', label: 'Gasto', section: 'expenses' },
  { value: 'saving', label: 'Ahorro', section: 'savings' },
];

export default function Dashboard() {
  const {
    monthlyBudgets, template, transactions, ensureMonth, updateBudget, saveAsTemplate,
    addTransaction, updateTransaction, deleteTransaction, storageError,
    deudas_activas, metas_financieras,
  } = useBudget();
  const [month, setMonth] = useState(currentMonthKey);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [newTransactionType, setNewTransactionType] = useState('expense');
  const [message, setMessage] = useState('');
  const [advisorLoading, setAdvisorLoading] = useState(false);
  const [advisorResult, setAdvisorResult] = useState(null);

  async function consultarAsesor() {
    setAdvisorLoading(true);
    setAdvisorResult(null);
    try {
      const contexto = prepararContextoFinanciero({ monthlyBudgets, transactions }, month);
      const meta = metas_financieras[0] || { nombre: 'Ajuste de presupuesto', costo: 0, plazoDias: 30 };
      const resultado = await generarPlanAvanzadoCoT(contexto, deudas_activas, meta);
      setAdvisorResult({ periodo: month, resultado });
    } catch {
      setAdvisorResult({ periodo: month, resultado: { error: 'No se pudo consultar al asesor. Intenta nuevamente.' } });
    } finally {
      setAdvisorLoading(false);
    }
  }

  useEffect(() => ensureMonth(month), [month, ensureMonth]);

  const budget = monthlyBudgets[month] || template || { incomes: [], expenses: [], savings: [] };
  const monthTransactions = useMemo(
    () => transactions.filter((item) => item.date?.slice(0, 7) === month),
    [transactions, month],
  );
  const planned = totalsForBudget(budget);
  const actual = {
    income: sumAmounts(monthTransactions.filter((item) => item.type === 'income')),
    expenses: sumAmounts(monthTransactions.filter((item) => item.type === 'expense')),
    savings: sumAmounts(monthTransactions.filter((item) => item.type === 'saving')),
  };

  function saveTransaction(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const amountCents = amountToCents(form.get('amount'));
    if (amountCents <= 0) {
      setMessage('El monto del movimiento debe ser mayor a cero.');
      return;
    }
    const transaction = {
      type: String(form.get('type')),
      category: String(form.get('category')).trim(),
      description: String(form.get('description')).trim(),
      date: String(form.get('date')),
      amountCents,
    };
    if (!transaction.category || !transaction.date) {
      setMessage('Completa la categoría y la fecha del movimiento.');
      return;
    }
    if (editingTransaction?.id) updateTransaction(editingTransaction.id, transaction);
    else addTransaction(transaction);
    setEditingTransaction(null);
    setNewTransactionType('expense');
    setMessage('Movimiento guardado.');
  }

  function startEdit(transaction) {
    setEditingTransaction(transaction);
    setMessage('');
  }

  function changeType(type) {
    if (editingTransaction) setEditingTransaction((previous) => ({ ...previous, type, category: '' }));
    else setNewTransactionType(type);
  }

  const categoriesFor = (type) => {
    const section = TRANSACTION_TYPES.find((item) => item.value === type)?.section;
    return [...new Set((budget[section] || []).map((item) => item.category || item.name).filter(Boolean))];
  };

  const chartData = makeYearData(month, transactions, monthlyBudgets);

  return (
    <main className="page-shell dashboard-shell">
      <div className="dashboard-heading">
        <div><span className="eyebrow">Tu dinero, en perspectiva</span><h1>Resumen financiero</h1><p>Planea cada peso y compara con tus movimientos reales.</p></div>
        <label className="field month-picker"><span>Mes del presupuesto</span><input type="month" value={month} onChange={(event) => {
          if (event.target.value) { setMonth(event.target.value); setMessage(''); }
        }} /></label>
      </div>
      {storageError && <div className="validation-box warning" role="alert">{storageError}</div>}
      <div className="summary-grid">
        <SummaryCard label="Ingresos planeados" value={formatCurrency(planned.income)} detail={`Real: ${formatCurrency(actual.income)}`} tone="income" />
        <SummaryCard label="Gastos planeados" value={formatCurrency(planned.expenses)} detail={`Real: ${formatCurrency(actual.expenses)}`} tone="expense" />
        <SummaryCard label="Ahorro planeado" value={formatCurrency(planned.savings)} detail={`Real: ${formatCurrency(actual.savings)}`} tone="saving" />
        <SummaryCard
          label="Disponible planeado"
          value={formatCurrency(planned.income - planned.expenses - planned.savings)}
          detail={`Disponible real: ${formatCurrency(actual.income - actual.expenses - actual.savings)}`}
          tone="available"
        />
      </div>

      <section className="panel budget-panel">
        <div className="section-heading">
          <div><h2>Presupuesto mensual</h2><p>Este mes se edita de forma independiente a meses anteriores.</p></div>
          <button type="button" className="button button-secondary" onClick={() => { saveAsTemplate(month); setMessage('Plantilla predeterminada actualizada.'); }}>
            <Save size={16} /> Guardar como plantilla
          </button>
        </div>
        <div className="budget-editors">
          {TRANSACTION_TYPES.map(({ section, label }) => (
            <BudgetRowsEditor
              key={section}
              label={label === 'Ingreso' ? 'Ingresos planeados' : label === 'Gasto' ? 'Gastos planeados' : 'Ahorros planeados'}
              section={section}
              rows={budget[section] || []}
              onChange={(rows) => updateBudget(month, section, rows)}
              showCategory={section === 'incomes'}
            />
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="section-heading"><div><h2>Planeado vs. real</h2><p>Los movimientos reales no modifican los montos planeados.</p></div></div>
        <div className="table-scroll">
          <table>
            <thead><tr><th>Tipo</th><th>Categoría</th><th>Planeado</th><th>Real</th><th>Diferencia</th></tr></thead>
            <tbody>
              {TRANSACTION_TYPES.flatMap(({ value, label, section }) => {
                const rows = budget[section] || [];
                const plannedRows = rows.length ? rows : [{ name: 'Sin categorías', category: '', amountCents: 0 }];
                return plannedRows.map((row, index) => {
                  const category = row.category || row.name;
                  const spent = monthTransactions
                    .filter((item) => item.type === value && (item.category === category || (index === 0 && !category)))
                    .reduce((total, item) => total + item.amountCents, 0);
                  return <tr key={`${value}-${row.id || index}`}><td>{label}</td><td>{category || 'Sin categorías'}</td><td>{formatCurrency(row.amountCents)}</td><td>{formatCurrency(spent)}</td><td className={spent > row.amountCents ? 'text-danger' : ''}>{formatCurrency(row.amountCents - spent)}</td></tr>;
                });
              })}
            </tbody>
          </table>
        </div>
      </section>

      <TransactionPanel
        month={month}
        transactions={monthTransactions}
        categoriesFor={categoriesFor}
        editingTransaction={editingTransaction}
        newTransactionType={newTransactionType}
        setEditingTransaction={setEditingTransaction}
        saveTransaction={saveTransaction}
        startEdit={startEdit}
        changeType={changeType}
        deleteTransaction={(id) => { deleteTransaction(id); setMessage('Movimiento eliminado.'); }}
        message={message}
      />
      <YearlyChart data={chartData} />
      <section className="panel">
        <div className="section-heading">
          <div><h2>Asesor financiero</h2><p>Consulta el presupuesto y los movimientos del mes seleccionado con Ollama local.</p></div>
          <button type="button" className="button button-primary" onClick={consultarAsesor} disabled={advisorLoading}>
            {advisorLoading ? 'Analizando…' : 'Consultar a Ollama'}
          </button>
        </div>
        {advisorResult && (
          <div role="status">
            <p>Análisis de {advisorResult.periodo}</p>
            {advisorResult.resultado.error
              ? <p className="form-error" role="alert">{advisorResult.resultado.error}</p>
              : <pre>{JSON.stringify(advisorResult.resultado, null, 2)}</pre>}
          </div>
        )}
      </section>
    </main>
  );
}

function TransactionPanel({ month, transactions, categoriesFor, editingTransaction, newTransactionType, setEditingTransaction, saveTransaction, startEdit, changeType, deleteTransaction, message }) {
  const today = getTodayKey();
  const selected = editingTransaction || {
    type: newTransactionType,
    date: month === today.slice(0, 7) ? today : `${month}-01`,
    category: '',
  };
  const categories = categoriesFor(selected.type);

  return (
    <section className="panel">
      <div className="section-heading"><div><h2>Movimientos</h2><p>Agrega ingresos, gastos y aportaciones de ahorro.</p></div></div>
      <form className="transaction-form" onSubmit={saveTransaction}>
        <label className="field"><span>Tipo</span><select name="type" value={selected.type} onChange={(event) => changeType(event.target.value)}>{TRANSACTION_TYPES.map((item) => <option value={item.value} key={item.value}>{item.label}</option>)}</select></label>
        <label className="field"><span>Categoría</span><input name="category" list="transaction-categories" defaultValue={selected.category} key={`${editingTransaction?.id || 'new'}-${selected.type}`} placeholder="Ej. Alimentación" required /><datalist id="transaction-categories">{categories.map((category) => <option key={category} value={category} />)}</datalist></label>
        <label className="field"><span>Descripción</span><input name="description" defaultValue={selected.description || ''} key={`${editingTransaction?.id || 'new'}-description`} placeholder="Detalle (opcional)" /></label>
        <label className="field"><span>Monto (MXN)</span><input name="amount" type="number" min="0.01" step="0.01" defaultValue={editingTransaction ? centsToInput(editingTransaction.amountCents) : ''} key={`${editingTransaction?.id || 'new'}-amount`} required /></label>
        <label className="field"><span>Fecha</span><input name="date" type="date" defaultValue={selected.date || today} key={`${editingTransaction?.id || 'new'}-date`} required /></label>
        <div className="form-buttons"><button className="button button-primary" type="submit">{editingTransaction ? <Check size={16} /> : <Plus size={16} />}{editingTransaction ? 'Guardar' : 'Agregar'}</button>{editingTransaction && <button className="button button-quiet" type="button" onClick={() => setEditingTransaction(null)}><X size={16} /> Cancelar</button>}</div>
      </form>
      {message && <p className={message.includes('debe') || message.includes('Completa') ? 'form-error' : 'form-success'} role="status">{message}</p>}
      <div className="table-scroll">
        <table>
          <thead><tr><th>Fecha</th><th>Tipo</th><th>Categoría</th><th>Descripción</th><th>Monto</th><th>Acciones</th></tr></thead>
          <tbody>{transactions.slice().sort((a, b) => b.date.localeCompare(a.date)).map((item) => (
            <tr key={item.id}><td>{new Date(`${item.date}T12:00:00`).toLocaleDateString('es-MX')}</td><td>{TRANSACTION_TYPES.find((type) => type.value === item.type)?.label}</td><td>{item.category}</td><td>{item.description || '—'}</td><td>{formatCurrency(item.amountCents)}</td><td><div className="table-actions"><button type="button" className="icon-button" aria-label="Editar movimiento" onClick={() => startEdit(item)}><Pencil size={16} /></button><button type="button" className="icon-button danger" aria-label="Eliminar movimiento" onClick={() => deleteTransaction(item.id)}><Trash2 size={16} /></button></div></td></tr>
          ))}</tbody>
        </table>
        {transactions.length === 0 && <p className="empty-state">No hay movimientos registrados para este mes.</p>}
      </div>
    </section>
  );
}

function YearlyChart({ data }) {
  return (
    <section className="panel chart-panel">
      <div className="section-heading"><div><h2>Evolución anual</h2><p>Comparativo mensual de planeación y movimientos reales.</p></div></div>
      <div className="chart-wrap">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: 4, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} />
            <YAxis tickFormatter={(value) => `$${Math.round(value / 1000)}k`} tickLine={false} axisLine={false} width={48} />
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Legend />
            <Bar dataKey="plannedIncome" name="Ingreso planeado" fill="#a7ded2" radius={[4, 4, 0, 0]} />
            <Bar dataKey="realIncome" name="Ingreso real" fill="#147b69" radius={[4, 4, 0, 0]} />
            <Bar dataKey="plannedExpense" name="Gasto planeado" fill="#f4c791" radius={[4, 4, 0, 0]} />
            <Bar dataKey="realExpense" name="Gasto real" fill="#d77b34" radius={[4, 4, 0, 0]} />
            <Bar dataKey="plannedSaving" name="Ahorro planeado" fill="#bdc8ea" radius={[4, 4, 0, 0]} />
            <Bar dataKey="realSaving" name="Ahorro real" fill="#657bb8" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

function makeYearData(selectedMonth, transactions, monthlyBudgets) {
  const year = Number(selectedMonth.slice(0, 4));
  return Array.from({ length: 12 }, (_, index) => {
    const key = `${year}-${String(index + 1).padStart(2, '0')}`;
    const budget = monthlyBudgets[key] || { incomes: [], expenses: [] };
    const monthItems = transactions.filter((item) => item.date?.slice(0, 7) === key);
    return {
      month: new Date(year, index, 1).toLocaleDateString('es-MX', { month: 'short' }),
      plannedIncome: sumAmounts(budget.incomes),
      realIncome: sumAmounts(monthItems.filter((item) => item.type === 'income')),
      plannedExpense: sumAmounts(budget.expenses),
      realExpense: sumAmounts(monthItems.filter((item) => item.type === 'expense')),
      plannedSaving: sumAmounts(budget.savings),
      realSaving: sumAmounts(monthItems.filter((item) => item.type === 'saving')),
    };
  });
}

function getTodayKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}
