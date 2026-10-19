// Extrae los datos por mes
export const prepararContextoFinanciero = (db) => {
  const mesActual = db.configuracion.periodo_activo;
  
  const plan = db.presupuesto_planificado[mesActual] || { ingreso: [], gasto: [], ahorro: [], deuda: [] };
  
  const totalIngresosPlan = plan.ingreso.reduce((sum, item) => sum + item.presupuesto, 0);
  const totalGastosPlan = plan.gasto.reduce((sum, item) => sum + item.presupuesto, 0);
  
  const transaccionesMes = db.tracking_transacciones.filter(t => t.fecha.startsWith(mesActual));
  
  const totalIngresosReales = transaccionesMes
    .filter(t => t.tipo === "ingreso")
    .reduce((sum, t) => sum + t.monto, 0);
    
  const totalGastosReales = transaccionesMes
    .filter(t => t.tipo === "gasto")
    .reduce((sum, t) => sum + t.monto, 0);

  return {
    periodo: mesActual,
    ingresos: {
      proyectado: totalIngresosPlan,
      real: totalIngresosReales
    },
    gastos: {
      proyectado: totalGastosPlan,
      real: totalGastosReales
    },
    balanceActual: totalIngresosReales - totalGastosReales
  };
};