import { useState } from 'react';
import { Link, Navigate, useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import BudgetRowsEditor from '../components/BudgetRowsEditor';
import { useBudget } from '../context/useBudget';
import { currentMonthKey, emptyBudget } from '../services/budgetService';
const labels = { incomes: 'Ingresos', expenses: 'Gastos', savings: 'Ahorros' };
export default function BudgetForm() {
 const { section } = useParams();
 const [params] = useSearchParams();
 const requested = params.get('mes');
 const month = /^\d{4}-(0[1-9]|1[0-2])$/.test(requested || '') ? requested : currentMonthKey();
 const { monthlyBudgets, template, updateBudget, storageError } = useBudget();
 const [rows, setRows] = useState(() => (monthlyBudgets[month] || template || emptyBudget())[section]?.map(row => ({ ...row })) || []);
 const [error, setError] = useState('');
 const navigate = useNavigate();
 if (!labels[section]) return <Navigate to="/dashboard" replace />;
 const back = '/dashboard?mes=' + month;
 function save(event) {
  event.preventDefault();
  if (rows.some(row => !row.name.trim() || !Number.isFinite(row.amountCents) || row.amountCents < 0)) { setError('Completa el concepto y un monto v?lido en cada fila, o elimina las filas vac?as.'); return; }
  updateBudget(month, section, rows);
  navigate(back);
 }
 return <main className="page-shell form-shell"><Link className="back-link" to={back}><ArrowLeft size={17}/> Volver al agente</Link><span className="eyebrow">Tu presupuesto ? {month}</span><h1>Todos tus {labels[section].toLowerCase()}, en un lugar.</h1><p>Agrega los conceptos que necesites. Al guardar, el agente mostrar? ?nicamente el total mensual.</p><form onSubmit={save}><BudgetRowsEditor section={section} label={labels[section]} rows={rows} onChange={setRows} showCategory={section === 'incomes'} />{error && <p role="alert" className="form-error">{error}</p>}{storageError && <p role="alert">{storageError}</p>}<div className="step-actions"><Link className="button button-secondary" to={back}>Cancelar</Link><button className="button button-primary" type="submit"><Check size={17}/> Guardar {labels[section].toLowerCase()}</button></div></form></main>;
}
