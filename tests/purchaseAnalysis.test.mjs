import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPurchaseAnalysis } from '../src/services/purchaseAnalysis.js';
import { normalizePurchaseAdvice } from '../src/services/purchaseAdvice.js';

const movement = (type, amountCents, category, date = '2026-10-05') => ({
  type,
  amountCents,
  category,
  date,
});

test('usa solo movimientos reales del mes y descuenta ahorro y deudas', () => {
  const analysis = buildPurchaseAnalysis({
    month: '2026-10',
    transactions: [
      movement('income', 3000000, 'Sueldo'),
      movement('expense', 1200000, 'Renta'),
      movement('saving', 100000, 'Ahorro'),
      movement('income', 999999, 'Otro mes', '2026-09-30'),
    ],
    debts: [{ name: 'Tarjeta', balance: 5000, payment: 500, minimum: 400 }],
    purchase: { name: 'Audífonos', priceCents: 200000 },
  });

  assert.equal(analysis.incomeCents, 3000000);
  assert.equal(analysis.expenseCents, 1200000);
  assert.equal(analysis.savingCents, 100000);
  assert.equal(analysis.debtPaymentCents, 50000);
  assert.equal(analysis.availableCents, 1650000);
  assert.equal(analysis.calculo.veredicto, 'puede');
  assert.equal(analysis.calculo.coberturaIngresoPct, 6.7);
});

test('sin ingresos reales no confirma la compra aunque haya ahorros', () => {
  const analysis = buildPurchaseAnalysis({
    month: '2026-10',
    transactions: [movement('saving', 500000, 'Ahorro'), movement('expense', 10000, 'Café')],
    purchase: { name: 'Tablet', priceCents: 100000 },
  });

  assert.equal(analysis.hasRealIncome, false);
  assert.equal(analysis.calculo.veredicto, 'faltan_datos');
  assert.equal(analysis.calculo.coberturaIngresoPct, null);
});

test('marca ajuste cuando la compra solo cabe usando el ahorro separado', () => {
  const analysis = buildPurchaseAnalysis({
    month: '2026-10',
    transactions: [
      movement('income', 100000, 'Sueldo'),
      movement('expense', 20000, 'Transporte'),
      movement('saving', 60000, 'Ahorro'),
    ],
    purchase: { name: 'Mochila', priceCents: 50000 },
  });

  assert.equal(analysis.availableCents, 20000);
  assert.equal(analysis.cashBeforeSavingsCents, 80000);
  assert.equal(analysis.calculo.veredicto, 'puede_con_ajustes');
  assert.equal(analysis.calculo.faltanteCents, 0);
});

test('sin ingresos reales la respuesta explica la falta de ingresos aunque falle el modelo', () => {
  const analysis = buildPurchaseAnalysis({
    month: '2026-10',
    transactions: [movement('expense', 10000, 'Café')],
    purchase: { name: 'Tablet', priceCents: 100000 },
  });
  const advice = normalizePurchaseAdvice({}, analysis);

  assert.equal(advice.veredicto, 'faltan_datos');
  assert.match(advice.titulo, /ingresos reales/i);
  assert.match(advice.explicacion, /no hay ingresos reales registrados/i);
});

test('no alcanza cuando el precio supera el efectivo real del mes', () => {
  const analysis = buildPurchaseAnalysis({
    month: '2026-10',
    transactions: [
      movement('income', 100000, 'Sueldo'),
      movement('expense', 50000, 'Renta'),
      movement('saving', 20000, 'Ahorro'),
    ],
    purchase: { name: 'Celular', priceCents: 60000 },
  });

  assert.equal(analysis.calculo.veredicto, 'no_puede');
  assert.equal(analysis.calculo.faltanteCents, 10000);
});
