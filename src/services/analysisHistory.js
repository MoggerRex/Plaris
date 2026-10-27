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
