import assert from 'node:assert/strict';
import { test } from 'node:test';
import { prepararContextoFinanciero } from './selectores.js';

test('filtra por mes, convierte centavos y conserva los detalles sin modificar el estado', () => {
  const data = {
    monthlyBudgets: { '2026-10': {
      incomes: [{ amountCents: 1500000 }],
      expenses: [{ amountCents: 1000000 }],
      savings: [{ amountCents: 500000 }],
    } },
    transactions: [
      { id: '1', date: '2026-10-15', type: 'income', amountCents: 1500000 },
      { id: '2', date: '2026-10-16', type: 'expense', amountCents: 600025, category: 'Despensa', description: 'Compra semanal' },
      { id: '3', date: '2026-10-17', type: 'saving', amountCents: 200000 },
      { id: '4', date: '2026-11-01', type: 'expense', amountCents: 999999 },
    ],
  };
  const original = JSON.stringify(data);
  const result = prepararContextoFinanciero(data, '2026-10');
  assert.deepEqual(result.ingresos, { proyectado: 15000, real: 15000 });
  assert.deepEqual(result.gastos, { proyectado: 10000, real: 6000.25 });
  assert.deepEqual(result.ahorros, { proyectado: 5000, real: 2000 });
  assert.equal(result.balanceActual, 8999.75);
  assert.equal(result.disponibleActual, 6999.75);
  assert.equal(result.movimientos.length, 3);
  assert.equal(result.movimientos[1].descripcion, 'Compra semanal');
  assert.equal(result.movimientos[1].categoria, 'Despensa');
  assert.equal(result.movimientos[1].monto, 6000.25);
  assert.equal(JSON.stringify(data), original);
});

test('un mes sin presupuesto ni movimientos devuelve ceros', () => {
  const result = prepararContextoFinanciero({ monthlyBudgets: {}, transactions: [] }, '2026-12');
  assert.deepEqual(result.ingresos, { proyectado: 0, real: 0 });
  assert.deepEqual(result.gastos, { proyectado: 0, real: 0 });
  assert.deepEqual(result.ahorros, { proyectado: 0, real: 0 });
  assert.equal(result.disponibleActual, 0);
  assert.deepEqual(result.movimientos, []);
});
