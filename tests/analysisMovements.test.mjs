import test from 'node:test';
import assert from 'node:assert/strict';
import { selectedFinanceContext, buildComparison } from '../src/services/financeAdapter.js';
import { analysisMovements } from '../src/services/analysisMovements.js';

const budget = {
  expenses: [{ name: 'Comida', amountCents: 100000, essential: true }],
  incomes: [],
  savings: [],
};
const transactions = [
  {
    id: 'a',
    date: '2026-10-02',
    type: 'expense',
    category: 'Comida',
    description: 'Papitas Sabritas',
    amountCents: 20000,
  },
  {
    id: 'b',
    date: '2026-10-03',
    type: 'expense',
    category: ' comida ',
    description: 'papitas sabritas',
    amountCents: 10000,
  },
  {
    id: 'c',
    date: '2026-10-04',
    type: 'expense',
    category: 'Comida',
    description: 'Despensa básica',
    amountCents: 70000,
    essential: true,
  },
  {
    id: 'd',
    date: '2026-09-01',
    type: 'expense',
    category: 'Comida',
    description: 'Mes anterior',
    amountCents: 99999,
  },
  {
    id: 'e',
    date: '2026-10-02',
    type: 'income',
    category: 'Trabajo',
    description: 'Privado',
    amountCents: 500000,
  },
];

test('analysis distinguishes 300 of snacks within 1000 of essential food without changing protections', () => {
  const before = JSON.stringify({ budget, transactions });
  const context = selectedFinanceContext(
    budget,
    [],
    buildComparison(budget, transactions, '2026-10'),
    ['expenses'],
    '2026-10',
    transactions,
  );
  assert.equal(context.movimientosReales.length, 3);
  assert.equal(context.desgloseGastos.length, 1);
  const category = context.desgloseGastos[0];
  assert.equal(category.categoriaNecesaria, true);
  assert.equal(category.planeado, 1000);
  assert.equal(category.totalReal, 1000);
  const snacks = category.detalles.find(
    (item) => item.descripcion.toLowerCase() === 'papitas sabritas',
  );
  assert.equal(snacks.monto, 300);
  assert.equal(snacks.porcentajeCategoria, 30);
  assert.equal(snacks.movimientos, 2);
  assert.equal(snacks.escenarioReducirMitad, 150);
  const basicFood = category.detalles.find((item) => item.descripcion === 'Despensa básica');
  assert.equal(basicFood.monto, 700);
  assert.ok(category.detalles.every((item) => !('noNegociable' in item)));
  assert.ok(context.movimientosReales.every((item) => !('noNegociable' in item)));
  assert.equal(context.secciones.expenses.conceptos[0].noNegociable, true);
  assert.equal(JSON.stringify(context).includes('Privado'), false);
  assert.equal(JSON.stringify(context).includes('Mes anterior'), false);
  assert.equal(JSON.stringify({ budget, transactions }), before);
});

test('empty selections and debt-only selections never expose movements', () => {
  assert.deepEqual(analysisMovements(transactions, [], '2026-10'), []);
  const context = selectedFinanceContext(budget, [], [], ['debts'], '2026-10', transactions);
  assert.deepEqual(context.movimientosReales, []);
  assert.equal(context.desgloseGastos, undefined);
});

test('missing descriptions stay unknown and legacy movement flags do not override planned priority', () => {
  const items = [
    { ...transactions[0], description: '', amountCents: 101 },
    { ...transactions[0], id: 'protected', description: '', amountCents: 200, essential: true },
  ];
  const context = selectedFinanceContext(budget, [], [], ['expenses'], '2026-10', items);
  const details = context.desgloseGastos[0].detalles;
  assert.equal(details.length, 1);
  assert.ok(details.every((item) => item.descripcion === 'Sin descripción'));
  assert.equal(details[0].monto, 3.01);
  assert.equal(details[0].escenarioReducirMitad, 1.51);
  assert.equal(context.desgloseGastos[0].categoriaNecesaria, true);
});
