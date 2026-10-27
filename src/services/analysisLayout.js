const KEY = 'plaris-analysis-layout-v1';
export const panelIds = ['chat', 'data', 'detail'];
export const defaultAnalysisLayout = { order: panelIds, column: 55, row: 56 };
export const clampSplit = (value) => Math.max(30, Math.min(70, Number(value) || 50));

export function normalizeAnalysisLayout(value) {
  const order = value?.order;
  return {
    order:
      Array.isArray(order) &&
      order.length === 3 &&
      new Set(order).size === 3 &&
      order.every((id) => panelIds.includes(id))
        ? order
        : [...panelIds],
    column: clampSplit(value?.column ?? 55),
    row: clampSplit(value?.row ?? 56),
  };
}

export function readAnalysisLayout(storage) {
  try {
    return normalizeAnalysisLayout(JSON.parse((storage || globalThis.localStorage).getItem(KEY)));
  } catch {
    return normalizeAnalysisLayout(defaultAnalysisLayout);
  }
}

export function saveAnalysisLayout(layout, storage) {
  try {
    (storage || globalThis.localStorage).setItem(KEY, JSON.stringify(normalizeAnalysisLayout(layout)));
    return true;
  } catch {
    return false;
  }
}

export function swapAnalysisPanels(order, source, target) {
  if (!order.includes(source) || !order.includes(target)) return order;
  return order.map((id) => (id === source ? target : id === target ? source : id));
}
