// Monthly averages: 52 weeks, 26 fortnights and 12 months per year.
export const frequencies = { semanal: 52 / 12, quincenal: 26 / 12, mensual: 1, anual: 1 / 12, unico: 0 };
export const money = value => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);
const round = value => Math.round((value + Number.EPSILON) * 100) / 100;
export function monthly(item) { return item.amount * frequencies[item.frequency]; }

export function debtProjection(debt) {
  const rate = debt.rateType === 'mensual' ? debt.rate / 100 : debt.rate / 1200;
  let balance = debt.balance;
  let interest = 0;
  let months = 0;
  const firstInterest = round(balance * rate);
  const grows = balance > 0 && debt.payment <= firstInterest && debt.payment < balance + firstInterest;
  while (balance > 0.005 && months < 600 && !grows) {
    const charge = round(balance * rate);
    interest = round(interest + charge);
    balance = round(Math.max(0, balance + charge - debt.payment));
    months++;
  }
  return { id: debt.id, name: debt.name, firstInterest, grows, belowMinimum: debt.payment < debt.minimum, months: balance <= 0.005 ? months : null, interest, remaining: balance };
}

export function analyze(data) {
  const errors = [];
  const valid = value => typeof value === 'number' && Number.isFinite(value) && value >= 0;
  const validDate = value => /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(`${value}T00:00:00Z`)) && new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;
  if (!validDate(data.startDate)) errors.push('La fecha inicial no es válida.');
  if (!Number.isInteger(data.goal.days) || data.goal.days < 1 || data.goal.days > 36500) errors.push('El plazo debe ser un número entero de 1 a 36500 días.');
  for (const item of [...data.incomes, ...data.expenses]) {
    if (!item.name.trim() || !valid(item.amount) || !(item.frequency in frequencies)) errors.push('Completa los conceptos, montos y frecuencias.');
    if (item.frequency === 'unico' && !validDate(item.date)) errors.push('Indica una fecha válida para cada gasto único.');
  }
  for (const debt of data.debts) {
    if (!debt.name.trim() || !['balance', 'rate', 'payment', 'minimum'].every(key => valid(debt[key])) || !['mensual', 'anual'].includes(debt.rateType)) errors.push('Completa los datos de las deudas con números no negativos.');
  }
  if (![data.savings, data.reserve, data.goal.cost, data.goal.days].every(valid) || data.goal.days <= 0 || data.goal.cost <= 0 || !data.goal.name.trim()) errors.push('La meta necesita nombre, costo y plazo positivos; los ahorros no pueden ser negativos.');
  if (data.reserve > data.savings) errors.push('La reserva protegida no puede superar el ahorro actual.');
  if (!data.incomes.length) errors.push('Agrega al menos una fuente de ingreso.');
  if (errors.length) return { errors: [...new Set(errors)] };

  const income = round(data.incomes.reduce((sum, item) => sum + monthly(item), 0));
  const expenses = round(data.expenses.reduce((sum, item) => sum + monthly(item), 0));
  const payments = round(data.debts.reduce((sum, debt) => sum + debt.payment, 0));
  const free = round(income - expenses - payments);
  const available = round(data.savings - data.reserve);
  const start = new Date(`${data.startDate}T00:00:00Z`);
  const end = new Date(start); end.setUTCDate(end.getUTCDate() + data.goal.days);
  const dated = data.expenses.filter(item => item.frequency === 'unico');
  const future = dated.filter(item => item.date >= data.startDate);
  const oneOff = round(future.filter(item => item.date <= end.toISOString().slice(0, 10)).reduce((sum, item) => sum + item.amount, 0));
  const projected = round(available + free * data.goal.days / (365 / 12) - oneOff);
  // Conservative alternative: keep all declared debt payments and reserve every known future one-off expense.
  const futureCosts = future.reduce((sum, item) => sum + item.amount, 0);
  const missing = Math.max(0, data.goal.cost + futureCosts - available);
  const daysNeeded = missing === 0 ? 0 : free > 0 ? Math.ceil(missing / free * (365 / 12)) : null;
  const debts = data.debts.map(debtProjection);
  const reasons = [];
  if (free < 0) reasons.push('Los gastos y pagos superan tus ingresos.');
  if (debts.some(debt => debt.grows)) reasons.push('Un pago de deuda no reduce el saldo bajo el modelo estimado.');
  if (debts.some(debt => debt.belowMinimum)) reasons.push('Hay pagos previstos inferiores al mínimo declarado.');
  if (available < data.goal.cost) reasons.push('Comprar hoy requiere usar la reserva o conseguir financiamiento.');
  const margin = round(projected - data.goal.cost);
  let risk = 'Viable según los datos';
  if (free < 0 || debts.some(debt => debt.grows || debt.belowMinimum)) risk = 'Riesgoso';
  else if (margin < 0) risk = 'No alcanza en el plazo';
  else if (margin < data.goal.cost * 0.1) risk = 'Ajustado';
  if (margin < 0) reasons.push(`Faltan ${money(-margin)} en el plazo solicitado.`);
  if (risk === 'Ajustado') reasons.push('El margen es inferior al 10% del costo de la meta.');
  if (!data.expenses.length) { risk = 'Información incompleta'; reasons.push('No registraste gastos; completa el presupuesto antes de decidir.'); }
  return { errors: [], income, expenses, payments, free, available, oneOff, projected, margin, daysNeeded, risk, reasons, debts,
    assumptions: ['Moneda: MXN. Se usan promedios de 52 semanas o 26 quincenas por año; no representan el calendario de cobros.', 'Ingresos y gastos constantes. Los gastos únicos se descuentan por fecha en el plazo solicitado.', 'Plazo alternativo conservador: conserva pagos de deuda y aparta todos los gastos únicos futuros conocidos.', 'Interés nominal estimado sobre saldo al inicio del mes, pago al cierre; sin IVA, comisiones ni cálculo diario del banco.', 'La etiqueta evalúa el plazo solicitado. Un margen menor al 10% del costo se considera ajustado; no garantiza seguridad.'] };
}

export function validateAdvice(advice, data) {
  if (!advice || typeof advice.resumen !== 'string' || !Array.isArray(advice.ajustesPropuestos)) throw new Error('La IA devolvió una estructura inválida.');
  const used = new Set();
  for (const proposal of advice.ajustesPropuestos) {
    const expense = data.expenses.find(item => item.id === proposal.gastoId);
    if (!expense || expense.essential || expense.frequency === 'unico' || used.has(expense.id) || !Number.isFinite(proposal.reduccionMensual) || proposal.reduccionMensual <= 0 || proposal.reduccionMensual > monthly(expense) || typeof proposal.explicacion !== 'string') throw new Error('La IA propuso un ajuste que no respeta el presupuesto.');
    used.add(expense.id);
  }
  return advice;
}

