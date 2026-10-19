import { sumAmounts } from '../services/budgetService.js';

// El estado usa centavos. Este contexto para el asesor devuelve importes en MXN.
export function prepararContextoFinanciero(data, mes) {
  const plan = data.monthlyBudgets[mes] || {};
  const movimientos = data.transactions.filter((item) => item.date?.slice(0, 7) === mes);
  const real = (tipo) => sumAmounts(movimientos.filter((item) => item.type === tipo)) / 100;
  const ingresos = real('income');
  const gastos = real('expense');
  const ahorros = real('saving');

  return {
    periodo: mes,
    moneda: 'MXN',
    ingresos: { proyectado: sumAmounts(plan.incomes) / 100, real: ingresos },
    gastos: { proyectado: sumAmounts(plan.expenses) / 100, real: gastos },
    ahorros: { proyectado: sumAmounts(plan.savings) / 100, real: ahorros },
    balanceActual: ingresos - gastos,
    disponibleActual: ingresos - gastos - ahorros,
    movimientos: movimientos.map((item) => ({
      id: item.id,
      tipo: item.type,
      fecha: item.date,
      descripcion: item.description,
      categoria: item.category,
      monto: item.amountCents / 100,
    })),
  };
}
