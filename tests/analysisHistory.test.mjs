import test from 'node:test';
import assert from 'node:assert/strict';
import {
  messagesForAnalysis,
  normalizeAnalysisRecord,
  purchaseFromAnalysisRecord,
} from '../src/services/analysisHistory.js';

test('conserva los mensajes del formato canónico y recorta espacios', () => {
  const messages = messagesForAnalysis({
    messages: [
      { role: 'user', content: '  ¿Me conviene comprar?  ' },
      { role: 'assistant', content: '  Depende de tu plan.  ' },
    ],
  });

  assert.deepEqual(messages, [
    { role: 'user', content: '¿Me conviene comprar?' },
    { role: 'assistant', content: 'Depende de tu plan.' },
  ]);
});

test('convierte registros antiguos con question y answer en mensajes', () => {
  const messages = messagesForAnalysis({
    question: 'Quiero comprar audífonos por $2,500.00.',
    answer: 'Solo puedes comprarlos usando el fondo.',
  });

  assert.deepEqual(messages, [
    { role: 'user', content: 'Quiero comprar audífonos por $2,500.00.' },
    { role: 'assistant', content: 'Solo puedes comprarlos usando el fondo.' },
  ]);
});

test('tolera registros incompletos sin lanzar errores', () => {
  assert.deepEqual(messagesForAnalysis(undefined), []);
  assert.deepEqual(messagesForAnalysis({}), []);
  assert.deepEqual(messagesForAnalysis({ messages: 'no-es-array' }), []);
  assert.deepEqual(
    messagesForAnalysis({
      messages: [
        { role: 'user', content: '   ' },
        { role: 'system', content: 'No debe mostrarse' },
        { content: 'Sin rol' },
      ],
    }),
    [],
  );
});

test('normaliza los campos mínimos del historial sin mutar el registro', () => {
  const original = {
    question: '¿Puedo comprar?',
    answer: 'Sí, con ajustes.',
    month: '2026-10',
  };
  const normalized = normalizeAnalysisRecord(original);

  assert.equal(normalized.month, '2026-10');
  assert.ok(normalized.id);
  assert.ok(normalized.createdAt);
  assert.equal(normalized.messages.length, 2);
  assert.equal(normalized.messages[0].role, 'user');
  assert.equal(normalized.messages[1].role, 'assistant');
  assert.equal(original.id, undefined);
  assert.equal(original.createdAt, undefined);
});

test('conserva id, fecha y mes cuando ya existen', () => {
  const normalized = normalizeAnalysisRecord({
    id: 'analisis-1',
    createdAt: '2026-10-27T12:00:00.000Z',
    month: '2026-09',
    messages: [{ role: 'assistant', content: 'Hola' }],
  });

  assert.equal(normalized.id, 'analisis-1');
  assert.equal(normalized.createdAt, '2026-10-27T12:00:00.000Z');
  assert.equal(normalized.month, '2026-09');
  assert.deepEqual(normalized.messages, [{ role: 'assistant', content: 'Hola' }]);
});

test('recupera la compra desde la pregunta de un registro antiguo', () => {
  const purchase = purchaseFromAnalysisRecord({
    type: 'purchase_advice',
    messages: [
      { role: 'user', content: 'Quiero comprar Barbacoa por $500.00.' },
      { role: 'assistant', content: 'Análisis de la compra.' },
    ],
  });

  assert.deepEqual(purchase, { name: 'Barbacoa', priceCents: 50000, note: '' });
});

test('recupera la compra con separador de miles y desde el snapshot', () => {
  assert.deepEqual(
    purchaseFromAnalysisRecord({
      type: 'purchase_advice',
      question: 'Quiero comprar Audífonos inalámbricos por $2,500.50.',
    }),
    { name: 'Audífonos inalámbricos', priceCents: 250050, note: '' },
  );

  assert.deepEqual(
    purchaseFromAnalysisRecord({
      snapshot: { purchase: { name: 'Tablet', priceCents: 800000, note: 'Oferta' } },
    }),
    { name: 'Tablet', priceCents: 800000, note: 'Oferta' },
  );
});

test('no trata una conversación normal como análisis de compra', () => {
  assert.equal(
    purchaseFromAnalysisRecord({
      type: 'finance_chat',
      messages: [{ role: 'user', content: '¿Cuál es mi mayor gasto?' }],
    }),
    null,
  );
  assert.equal(purchaseFromAnalysisRecord({ type: 'purchase_advice', messages: [] }), null);
});
