export const financeSections = [
  { key: 'incomes', label: 'Ingresos', singular: 'Ingreso', type: 'income', color: '#176b55' },
  { key: 'expenses', label: 'Gastos', singular: 'Gasto', type: 'expense', color: '#67854a' },
  { key: 'savings', label: 'Ahorros', singular: 'Ahorro', type: 'saving', color: '#3e8c78' },
  { key: 'debts', label: 'Deudas', singular: 'Deuda', color: '#8b9655' },
];

export function profileLink(section, month) {
  return `/perfil/${section}?mes=${month}`;
}

export function budgetLink(section, month) {
  return `/presupuesto/${section}?mes=${month}`;
}
