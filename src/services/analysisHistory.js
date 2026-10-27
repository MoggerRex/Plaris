import { createId, currentMonthKey } from './budgetService.js';

/**
 * Devuelve los mensajes de un análisis guardado.
 * Acepta el formato canónico ({ messages }) y el formato antiguo
 * ({ question, answer }) para que el historial nunca falle al renderizar.
 */
export function messagesForAnalysis(record = {}) {
  const messages = Array.isArray(record.messages)
    ? record.messages
        .filter(
          (item) =>
            item &&
            typeof item.content === 'string' &&
            item.content.trim() &&
            (item.role === 'user' || item.role === 'assistant'),
        )
        .map((item) => ({ role: item.role, content: item.content.trim() }))
    : [];

  if (messages.length) return messages;

  const legacy = [];
  if (typeof record.question === 'string' && record.question.trim())
    legacy.push({ role: 'user', content: record.question.trim() });
  if (typeof record.answer === 'string' && record.answer.trim())
    legacy.push({ role: 'assistant', content: record.answer.trim() });
  return legacy;
}

/** Completa los campos mínimos que necesita el historial del menú lateral. */
export function normalizeAnalysisRecord(record = {}) {
  return {
    ...record,
    id: record.id || createId(),
    createdAt: record.createdAt || new Date().toISOString(),
    month: record.month || currentMonthKey(),
    messages: messagesForAnalysis(record),
  };
}

/**
 * Recupera la compra de un análisis guardado.
 * Los registros nuevos incluyen snapshot; los antiguos solo tienen la pregunta.
 */
export function purchaseFromAnalysisRecord(record = {}) {
  if (record.type && record.type !== 'purchase_advice') return null;
  if (record.snapshot?.purchase?.name) {
    return {
      name: record.snapshot.purchase.name,
      priceCents: Number(record.snapshot.purchase.priceCents) || 0,
      note: record.snapshot.purchase.note || '',
    };
  }

  const question = messagesForAnalysis(record).find((item) => item.role === 'user')?.content || '';
  const match = question.match(/Quiero comprar (.+?) por \$?\s*([\d.,]+)/i);
  if (!match) return null;

  const amount = Number.parseFloat(match[2].replace(/,/g, ''));
  if (!Number.isFinite(amount) || amount <= 0) return null;

  return {
    name: match[1].trim(),
    priceCents: Math.round(amount * 100),
    note: '',
  };
}
