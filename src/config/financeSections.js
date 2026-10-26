export const financeSections = [
  { key: 'incomes', label: 'Ingresos', singular: 'Ingreso', type: 'income', color: '#106057' },
  { key: 'expenses', label: 'Gastos', singular: 'Gasto', type: 'expense', color: '#c43785' },
  { key: 'savings', label: 'Ahorros', singular: 'Ahorro', type: 'saving', color: '#4169c5' },
  { key: 'debts', label: 'Deudas', singular: 'Deuda', color: '#ad7630' },
];

export function profileLink(section, month) {
  return `/perfil/${section}?mes=${month}`;
}

export function budgetLink(section, month) {
  return `/presupuesto/${section}?mes=${month}`;
}
