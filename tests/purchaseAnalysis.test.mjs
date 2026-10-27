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

const budgetWith = ({
  incomes = [],
  expenses = [],
  savings = [],
  goals = [],
  emergencyFund,
} = {}) => ({
  incomes,
  expenses,
  savings,
  goals,
  emergencyFund,
});

test('descuenta ahorro y deudas de los movimientos reales del mes', () => {
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

test('usa gastos planeados cuando no hay gastos reales y no los cuenta como dinero libre', () => {
  const analysis = buildPurchaseAnalysis({
    month: '2026-10',
    transactions: [movement('income', 3000000, 'Sueldo')],
    budget: budgetWith({
      incomes: [{ amountCents: 3000000 }],
      expenses: [{ name: 'Renta', category: 'Renta', amountCents: 1600000 }],
    }),
    purchase: { name: 'Audífonos', priceCents: 200000 },
  });

  assert.equal(analysis.hasRealExpenses, false);
  assert.equal(analysis.plannedExpenseCents, 1600000);
  assert.equal(analysis.projectedExpenseCents, 1600000);
  assert.equal(analysis.pendingExpenseCents, 1600000);
  assert.equal(analysis.availableCents, 1400000);
  assert.equal(analysis.calculo.veredicto, 'puede');
});

test('no confirma la compra si los gastos planeados consumen todo el ingreso', () => {
  const analysis = buildPurchaseAnalysis({
    month: '2026-10',
    transactions: [movement('income', 3000000, 'Sueldo')],
    budget: budgetWith({
      incomes: [{ amountCents: 3000000 }],
      expenses: [{ name: 'Renta', category: 'Renta', amountCents: 3000000 }],
    }),
    purchase: { name: 'Audífonos', priceCents: 200000 },
  });

  assert.equal(analysis.availableCents, 0);
  assert.equal(analysis.calculo.veredicto, 'no_puede');
  assert.equal(analysis.calculo.faltanteCents, 200000);
});

test('protege el ahorro en fondo y solo permite la compra advirtiéndolo', () => {
  const analysis = buildPurchaseAnalysis({
    month: '2026-10',
    transactions: [movement('income', 3000000, 'Sueldo'), movement('saving', 100000, 'Fondo')],
    budget: budgetWith({
      incomes: [{ amountCents: 3000000 }],
      expenses: [{ name: 'Gastos del mes', category: 'Gastos', amountCents: 1600000 }],
      savings: [{ name: 'Fondo', category: 'Fondo', amountCents: 1400000 }],
    }),
    purchase: { name: 'Audífonos', priceCents: 200000 },
  });

  assert.equal(analysis.projectedSavingCents, 1400000);
  assert.equal(analysis.pendingSavingCents, 1300000);
  assert.equal(analysis.pendingFundSavingCents, 1300000);
  assert.equal(analysis.pendingNonFundSavingCents, 0);
  assert.equal(analysis.availableCents, 0);
  assert.equal(analysis.availableWithNonFundSavingsCents, 0);
  assert.equal(analysis.availableWithAllSavingsCents, 1300000);
  assert.equal(analysis.calculo.veredicto, 'puede_con_ajustes');
  assert.equal(analysis.calculo.requiereFondo, true);
  assert.equal(analysis.calculo.montoFondoCents, 200000);
  assert.equal(analysis.calculo.etiqueta, 'Usando tu ahorro en fondo');
  assert.equal(analysis.calculo.tone, 'warning');
});

test('no trata el ahorro real ya separado como dinero libre', () => {
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
  assert.equal(analysis.availableWithAllSavingsCents, 20000);
  assert.equal(analysis.calculo.veredicto, 'no_puede');
  assert.equal(analysis.calculo.faltanteCents, 30000);
  assert.equal(analysis.calculo.requiereAjustarAhorro, false);
});

test('permite ajustar solo el ahorro planeado no protegido', () => {
  const analysis = buildPurchaseAnalysis({
    month: '2026-10',
    transactions: [movement('income', 3000000, 'Sueldo')],
    budget: budgetWith({
      incomes: [{ amountCents: 3000000 }],
      expenses: [{ name: 'Gastos del mes', category: 'Gastos', amountCents: 2000000 }],
      goals: [
        {
          id: 'meta-1',
          name: 'Viaje',
          monthlyAmountCents: 500000,
        },
      ],
    }),
    purchase: { name: 'Mochila', priceCents: 800000 },
  });

  assert.equal(analysis.availableCents, 500000);
  assert.equal(analysis.pendingNonFundSavingCents, 500000);
  assert.equal(analysis.availableWithAllSavingsCents, 1000000);
  assert.equal(analysis.calculo.veredicto, 'puede_con_ajustes');
  assert.equal(analysis.calculo.requiereFondo, false);
  assert.equal(analysis.calculo.requiereAjustarAhorro, true);
  assert.equal(analysis.calculo.requiereUsarAhorro, true);
  assert.equal(analysis.calculo.montoAjusteAhorroCents, 300000);
  assert.equal(analysis.calculo.etiqueta, 'Solo si ajustas tu plan');
});

test('advierte cuando la compra depende de ingreso planeado pendiente', () => {
  const analysis = buildPurchaseAnalysis({
    month: '2026-10',
    transactions: [movement('income', 1000000, 'Sueldo')],
    budget: budgetWith({
      incomes: [{ amountCents: 3000000 }],
    }),
    purchase: { name: 'Celular', priceCents: 1500000 },
  });

  assert.equal(analysis.pendingIncomeCents, 2000000);
  assert.equal(analysis.availableRealOnlyCents, 1000000);
  assert.equal(analysis.calculo.veredicto, 'puede_con_ajustes');
  assert.equal(analysis.calculo.requiereIngresoPlaneado, true);
  assert.equal(analysis.calculo.etiqueta, 'Solo cuando llegue el ingreso planeado');
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

test('la respuesta de fondo advierte que ese ahorro está protegido', () => {
  const analysis = buildPurchaseAnalysis({
    month: '2026-10',
    transactions: [movement('income', 3000000, 'Sueldo'), movement('saving', 100000, 'Fondo')],
    budget: budgetWith({
      incomes: [{ amountCents: 3000000 }],
      expenses: [{ name: 'Gastos del mes', category: 'Gastos', amountCents: 1600000 }],
      savings: [{ name: 'Fondo', category: 'Fondo', amountCents: 1400000 }],
    }),
    purchase: { name: 'Audífonos', priceCents: 200000 },
  });
  const advice = normalizePurchaseAdvice({}, analysis);

  assert.equal(advice.veredicto, 'puede_con_ajustes');
  assert.match(advice.titulo, /fondo/i);
  assert.match(advice.explicacion, /2,000/);
  assert.match(advice.impacto, /ahorros/i);
});

test('reemplaza textos del modelo que confunden el fondo total con el monto usado', () => {
  const analysis = buildPurchaseAnalysis({
    month: '2026-10',
    transactions: [movement('income', 3000000, 'Sueldo'), movement('saving', 100000, 'Fondo')],
    budget: budgetWith({
      incomes: [{ amountCents: 3000000 }],
      expenses: [{ name: 'Gastos del mes', category: 'Gastos', amountCents: 1600000 }],
      savings: [{ name: 'Fondo', category: 'Fondo', amountCents: 1400000 }],
    }),
    purchase: { name: 'Audífonos', priceCents: 200000 },
  });
  const advice = normalizePurchaseAdvice(
    {
      titulo: 'Puedes comprarlo usando el fondo',
      explicacion: 'Usa $1,400 del fondo.',
      impacto: 'Te quedan $1,100 en el fondo.',
      razones: ['El ahorro en fondo protegido es $1,400.'],
      recomendacion: 'Ajusta tus gastos y cómpralo.',
    },
    analysis,
  );

  assert.match(advice.titulo, /usando tu fondo/i);
  assert.match(advice.explicacion, /2,000/);
  assert.doesNotMatch(advice.explicacion, /1,400/);
  assert.match(advice.impacto, /ahorros/i);
  assert.doesNotMatch(advice.recomendacion, /Ajusta tus gastos/);
  assert.ok(advice.razones.some((razon) => /fondo/i.test(razon)));
  assert.ok(!advice.razones.some((razon) => razon.includes('$1,400')));
});
