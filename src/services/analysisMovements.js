import { financeSections } from '../config/financeSections.js';

const normalize = (value) =>
  String(value || '')
    .trim()
    .toLocaleLowerCase('es-MX');

export function analysisMovements(transactions, sections, month) {
  const types = financeSections
    .filter((item) => sections.includes(item.key))
    .map((item) => item.type)
    .filter(Boolean);
  return transactions
    .filter((item) => types.includes(item.type) && item.date?.slice(0, 7) === month)
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function expenseBreakdown(budget, transactions) {
  const categories = new Map();
  for (const item of transactions.filter((row) => row.type === 'expense')) {
    const key = normalize(item.category);
    if (!categories.has(key)) {
      const planned = (budget.expenses || []).filter(
        (row) => normalize(row.category || row.name) === key,
      );
      categories.set(key, {
        categoria: item.category || 'Sin categoría',
        planeadoCents: planned.reduce((sum, row) => sum + row.amountCents, 0),
        categoriaNecesaria: planned.some((row) => row.essential !== false),
        totalCents: 0,
        detalles: new Map(),
      });
    }
    const category = categories.get(key);
    category.totalCents += item.amountCents;
    const detailKey = normalize(item.description);
    const detail = category.detalles.get(detailKey) || {
      descripcion: item.description?.trim() || 'Sin descripción',
      montoCents: 0,
      cantidad: 0,
    };
    detail.montoCents += item.amountCents;
    detail.cantidad += 1;
    category.detalles.set(detailKey, detail);
  }
  return [...categories.values()]
    .sort((a, b) => b.totalCents - a.totalCents)
    .map((category) => ({
      categoria: category.categoria,
      planeado: category.planeadoCents / 100,
      categoriaNecesaria: category.categoriaNecesaria,
      totalReal: category.totalCents / 100,
      detalles: [...category.detalles.values()]
        .sort((a, b) => b.montoCents - a.montoCents)
        .map((detail) => ({
          descripcion: detail.descripcion,
          monto: detail.montoCents / 100,
          movimientos: detail.cantidad,
          porcentajeCategoria: category.totalCents
            ? Math.round((detail.montoCents / category.totalCents) * 10000) / 100
            : 0,
          escenarioReducirMitad: Math.round(detail.montoCents / 2) / 100,
        })),
    }));
}
