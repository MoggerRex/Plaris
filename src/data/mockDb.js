export const emptyDbState = {
  configuracion: {
    moneda: "MXN",
    periodo_activo: "2026-10" 
  },

  // opciones que el usuario vera en el menu desplegable
  catalogo_categorias: {
    ingreso: ["Trabajo Fijo", "Freelancer", "Dividendos", "Otros"],
    gasto: ["Vivienda", "Servicios", "Despensa", "Transporte", "Seguros", "Ropa", "Ocio"],
    ahorro: ["Fondo de Emergencia", "Cuenta de Retiro", "Inversiones"],
    deuda: ["Tarjeta de Crédito", "Préstamo Personal", "Préstamo Automotriz"]
  },
  
  deudas_activas: [],
  metas_financieras: [],
  tracking_transacciones: [],
  
  presupuesto_planificado: {} 
};