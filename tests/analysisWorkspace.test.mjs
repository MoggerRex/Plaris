import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeAnalysisLayout,
  readAnalysisLayout,
  saveAnalysisLayout,
  swapAnalysisPanels,
} from '../src/services/analysisLayout.js';
import { readChatStream } from '../src/services/chatService.js';

test('layout restores valid arrangements and rejects corrupt or repeated panels', () => {
  const saved = new Map();
  const storage = {
    getItem: (key) => saved.get(key),
    setItem: (key, value) => saved.set(key, value),
  };
  const layout = { order: ['data', 'chat', 'detail'], column: 62, row: 45 };
  assert.equal(saveAnalysisLayout(layout, storage), true);
  assert.deepEqual(readAnalysisLayout(storage), layout);
  assert.deepEqual(
    normalizeAnalysisLayout({ order: ['chat', 'chat', 'data'], column: 1000, row: -5 }),
    { order: ['chat', 'data', 'detail'], column: 70, row: 30 },
  );
  assert.deepEqual(swapAnalysisPanels(layout.order, 'chat', 'detail'), ['data', 'detail', 'chat']);
  assert.deepEqual(layout.order, ['data', 'chat', 'detail']);
  assert.deepEqual(
    readAnalysisLayout({
      getItem() {
        throw new Error('blocked');
      },
    }).order,
    ['chat', 'data', 'detail'],
  );
  assert.equal(
    saveAnalysisLayout(layout, {
      setItem() {
        throw new Error('quota');
      },
    }),
    false,
  );
});

test('Ollama stream handles fragmented JSON, UTF-8 and a final line without newline', async () => {
  const encoder = new TextEncoder();
  const data = encoder.encode(
    JSON.stringify({ message: { content: 'Puedes reducir las ' } }) +
      '\n' +
      JSON.stringify({ message: { content: 'papitas: ahorrarías $150.' } }) +
      '\n' +
      JSON.stringify({ done: true }),
  );
  const stream = new ReadableStream({
    start(controller) {
      for (let i = 0; i < data.length; i += 3) controller.enqueue(data.slice(i, i + 3));
      controller.close();
    },
  });
  const updates = [];
  assert.equal(
    await readChatStream(stream, (text) => updates.push(text)),
    'Puedes reducir las papitas: ahorrarías $150.',
  );
  assert.equal(updates.length, 2);
});

test('Ollama stream reports model errors and empty answers', async () => {
  const stream = (text) =>
    new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(text));
        controller.close();
      },
    });
  await assert.rejects(
    readChatStream(stream('{"error":"Modelo no disponible"}\n'), () => {}),
    /Modelo no disponible/,
  );
  await assert.rejects(
    readChatStream(stream('{"done":true}'), () => {}),
    /respuesta vacía/,
  );
});
