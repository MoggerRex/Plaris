import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowUpRight, Send, SlidersHorizontal } from 'lucide-react';
import { BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useBudget } from '../context/useBudget';
import { currentMonthKey, formatCurrency, sumAmounts, totalsForBudget } from '../services/budgetService';
import { analyze, money } from '../domain/planner';
import { requestAdvice } from '../services/plannerAdvice';
import { advicePlans } from '../domain/advicePlans';
function readSettings() { try { return JSON.parse(localStorage.getItem('plaris-agent-goal')) || {}; } catch { return {}; } }
export default function Dashboard() {
 const { monthlyBudgets, template, transactions, ensureMonth, storageError } = useBudget();
 const [params, setParams] = useSearchParams();
 const requested = params.get('mes');
 const month = /^\d{4}-(0[1-9]|1[0-2])$/.test(requested || '') ? requested : currentMonthKey();
 const [settings, setSettings] = useState(readSettings);
 const [plan, setPlan] = useState('estandar');
 const [context, setContext] = useState('');
 const [advice, setAdvice] = useState(null);
 const [error, setError] = useState('');
 const [loading, setLoading] = useState(false);
 const controller = useRef(null);
 useEffect(() => { ensureMonth(month); }, [month, ensureMonth]);
 const budget = monthlyBudgets[month] || template || { incomes: [], expenses: [], savings: [] };
 const signature = JSON.stringify({ month, budget, settings, plan });
 useEffect(() => { return () => { controller.current?.abort(); controller.current = null; }; }, [signature]);
 function clearAnalysis() { controller.current?.abort(); controller.current = null; setLoading(false); setAdvice(null); setError(''); }
 const planned = totalsForBudget(budget);
 const actualSavings = sumAmounts(transactions.filter(t => t.date?.slice(0,7) === month && t.type === 'saving'));
 const savingsRate = planned.income > 0 ? planned.savings / planned.income * 100 : 0;
 const chart = ['incomes','expenses','savings'].map((section, index) => ({ name: ['Ingresos','Gastos','Ahorro'][index], Planeado: sumAmounts(budget[section]) / 100, Real: sumAmounts(transactions.filter(t => t.date?.slice(0,7) === month && t.type === ['income','expense','saving'][index])) / 100 }));
 function update(key, value) { clearAnalysis(); const next = { ...settings, [key]: value }; setSettings(next); try { localStorage.setItem('plaris-agent-goal', JSON.stringify(next)); } catch { setError('No fue posible guardar tu meta en este dispositivo.'); } }
 async function ask(event) {
  event.preventDefault();
  const mapRows = rows => rows.filter(row => row.amountCents > 0).map(row => ({ id: row.id, name: row.name, amount: row.amountCents / 100, frequency: 'mensual', essential: row.essential !== false, category: row.category || row.name }));
  const data = { startDate: month + '-01', incomes: mapRows(budget.incomes), expenses: mapRows(budget.expenses), debts: [], savings: Number(settings.savings || 0), reserve: Number(settings.reserve || 0), goal: { name: settings.name || '', cost: Number(settings.cost || 0), days: Number(settings.days || 90) }, context };
  const analysis = analyze(data);
  if (analysis.errors.length) { setError(analysis.errors.join(' ')); return; }
  const active = new AbortController(); controller.current = active;
  setLoading(true); setError(''); setAdvice(null);
  const timeout = setTimeout(() => active.abort(), advicePlans[plan].timeoutMs);
  try { const result = await requestAdvice(data, analysis, plan, active.signal); if (controller.current === active) setAdvice({ ...result, analysis }); }
  catch (failure) { if (controller.current === active) setError(failure.name === 'AbortError' ? 'Se agot? el tiempo del an?lisis. Puedes volver a intentarlo.' : failure instanceof TypeError ? 'No se pudo conectar con Ollama. Comprueba que est? iniciado en localhost:11434.' : failure.message); }
  finally { clearTimeout(timeout); if (controller.current === active) { setLoading(false); controller.current = null; } }
 }
 return <main className="agent-shell"><section className="agent-summary"><div className="agent-title"><span className="eyebrow">Tu espacio financiero</span><h1>Agente</h1></div><div className="agent-metrics"><Link to={'/presupuesto/incomes?mes='+month}><span>Ingresos</span><strong>{formatCurrency(planned.income)}</strong><ArrowUpRight size={17}/></Link><div><span>Balance</span><strong>{formatCurrency(planned.income-planned.expenses)}</strong></div><label className="period-control"><span>Periodo</span><input aria-label="Mes del presupuesto" type="month" value={month} onChange={e => { if(e.target.value) { clearAnalysis(); setParams({ mes: e.target.value }); } }}/></label><Link to={'/presupuesto/expenses?mes='+month}><span>Gastos</span><strong>{formatCurrency(planned.expenses)}</strong><ArrowUpRight size={17}/></Link><Link to={'/presupuesto/savings?mes='+month} className="saving-metric"><span>Ahorro ? planeado / real</span><strong>{formatCurrency(planned.savings)} / {formatCurrency(actualSavings)}</strong><ArrowUpRight size={17}/></Link></div></section>{storageError && <p role="alert">{storageError}</p>}<div className="agent-body"><aside className="agent-charts"><span className="eyebrow">El panorama de tu mes</span><h2>Cada peso cuenta.</h2><p>Tu presupuesto y tus movimientos, en perspectiva.</p><BudgetChart data={chart} dataKey="Planeado" title="Lo que planeas"/><BudgetChart data={chart} dataKey="Real" title="Lo que llevas"/><div className="rate-note"><strong>{savingsRate.toFixed(1)}%</strong><span>de tus ingresos destinado al ahorro</span></div><Link className="back-link" to="/movimientos">Registrar movimientos reales <ArrowUpRight size={16}/></Link></aside><section className="agent-workspace"><span className="eyebrow">Un plan empieza con una decisi?n</span><h2>?Por d?nde<br/>empezamos?</h2><p className="agent-subtitle">Dale un prop?sito a tu dinero. Plaris te ayuda a encontrar el camino.</p><form onSubmit={ask} className="agent-question"><label htmlFor="agent-context">?Qu? quieres lograr?</label><div className="question-input"><input id="agent-context" value={context} onChange={e=> { setContext(e.target.value); controller.current?.abort(); controller.current=null; setLoading(false); setAdvice(null); }} placeholder="Cu?ntale a Plaris qu? tienes en mente?"/><button type="submit" disabled={loading} aria-label="Generar asesor?a"><Send size={20}/></button></div><details className="goal-settings" open><summary><SlidersHorizontal size={16}/> Tu meta y tu punto de partida</summary><div className="goal-grid">{[['name','Nombre de la meta','text'],['cost','Costo de la meta (MXN)','number'],['days','Plazo (d?as)','number'],['savings','Ahorro actual (MXN)','number'],['reserve','Reserva protegida (MXN)','number']].map(([key,label,type])=><label className="field" key={key}><span>{label}</span><input type={type} min={key==='days'?1:0} step={key==='days'?1:'any'} value={settings[key] ?? (key==='days'?90:'')} onChange={e=>update(key,e.target.value)} required={['name','cost','days'].includes(key)}/></label>)}</div><p>Los ahorros son el saldo que ya tienes, no la aportaci?n planeada. Este an?lisis usa el presupuesto mensual; registra los pagos de tus deudas entre tus gastos.</p></details><div className="agent-submit"><label className="field"><span>Tipo de an?lisis</span><select value={plan} onChange={e=>{ clearAnalysis(); setPlan(e.target.value); }}><option value="estandar">Est?ndar</option><option value="avanzado">Avanzado</option></select></label><button className="button button-primary" disabled={loading}>{loading?'Analizando?':'Crear mi plan'}<ArrowUpRight size={17}/></button></div></form>{error && <p className="validation-box warning" role="alert">{error}</p>}{loading && <p role="status">Plaris est? preparando tu asesor?a con Ollama?</p>}{advice && <article className="advisor-answer" role="status"><span className="eyebrow">Tu plan ? {advicePlans[plan].label}</span><h3>{advice.analysis.risk}</h3><p>{advice.resumen}</p>{advice.ajustesPropuestos.length>0 && <><h4>Ajustes sugeridos</h4>{advice.ajustesPropuestos.map(item=><p key={item.gastoId}>{item.explicacion} ? {money(item.reduccionMensual)} al mes</p>)}</>}{advice.advertencias.map(item=><p key={item}>{item}</p>)}</article>}</section></div></main>;
}
function BudgetChart({ data, dataKey, title }) { return <section className="mini-chart"><h3>{title}</h3><div style={{height:180,width:'100%'}}><ResponsiveContainer><BarChart data={data} margin={{left:0,right:8}}><CartesianGrid vertical={false} stroke="#e1e9e6"/><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize:11}}/><YAxis width={48} axisLine={false} tickLine={false} tick={{fontSize:10}} tickFormatter={v=>v>=1000?(v/1000)+'k':v}/><Tooltip formatter={v=>money(v)}/><Bar dataKey={dataKey} fill={dataKey==='Planeado'?'#2eb6aa':'#106057'} radius={[7,7,0,0]}/></BarChart></ResponsiveContainer></div>{data.every(item=>item[dataKey]===0) && <p className="chart-empty">{dataKey==='Real'?'Registra movimientos para ver tu avance.':'Agrega tu presupuesto para comenzar.'}</p>}</section>; }
