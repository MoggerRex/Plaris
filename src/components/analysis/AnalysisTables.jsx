import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import ComparisonTable from '../finance/ComparisonTable';
import { ArrowLeft, ArrowRight, MessageSquarePlus, Search } from 'lucide-react';
import { formatCurrency } from '../../services/budgetService';
import { plannedSavingsRows } from '../../services/budgetConnections';
import { financeSections } from '../../config/financeSections';
import { transactionTypes } from '../../config/transactionTypes';

const money = (value) => formatCurrency(Math.round(value * 100));

function DataTable({
  columns,
  rows,
  empty = 'No hay datos para esta vista.',
  pageSize = 3,
  label,
}) {
  const [page, setPage] = useState(0);
  const pages = Math.max(1, Math.ceil(rows.length / pageSize));
  const current = Math.min(page, pages - 1);
  return (
    <div className="analysis-table-container">
      <div className="analysis-table-scroll" role="region" tabIndex={0} aria-label={label}>
        <table>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key} className={column.money ? 'money-cell' : ''}>
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.slice(current * pageSize, (current + 1) * pageSize).map((row) => (
              <tr key={row.id} className={row.selected ? 'analysis-row-selected' : ''}>
                {columns.map((column) => (
                  <td key={column.key} className={column.money ? 'money-cell' : ''}>
                    {row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && <p className="empty-state">{empty}</p>}
      </div>
      <footer className="analysis-table-footer">
        <span>
          {rows.length
            ? `${current * pageSize + 1}–${Math.min((current + 1) * pageSize, rows.length)} de ${rows.length}`
            : '0 registros'}
        </span>
        <div>
          <button
            className="icon-button"
            aria-label={`Página anterior de ${label}`}
            disabled={current === 0}
            onClick={() => setPage(current - 1)}
          >
            <ArrowLeft size={15} />
          </button>
          <span>
            {current + 1} / {pages}
          </span>
          <button
            className="icon-button"
            aria-label={`Página siguiente de ${label}`}
            disabled={current + 1 >= pages}
            onClick={() => setPage(current + 1)}
          >
            <ArrowRight size={15} />
          </button>
        </div>
      </footer>
    </div>
  );
}

export function AnalysisDataTable({
  comparison,
  movements,
  budget,
  debts,
  breakdown,
  selectedIds,
  onToggle,
  onClear,
  onAsk,
}) {
  const [tab, setTab] = useState('comparison');
  const reducedMotion = useReducedMotion();
  const [query, setQuery] = useState('');
  const [type, setType] = useState('all');
  const [section, setSection] = useState('expenses');
  const selected = movements.filter((item) => selectedIds.includes(item.id));
  const filtered = movements.filter(
    (item) =>
      (type === 'all' || item.type === type) &&
      `${item.category} ${item.description || ''}`
        .toLocaleLowerCase('es-MX')
        .includes(query.toLocaleLowerCase('es-MX')),
  );
  const selectionPrompt = `Revisa estos movimientos dentro del contexto de mi mes. ¿Dónde podría ahorrar sin afectar mis necesidades?\n${selected.map((item) => `• ${item.date} · ${item.category}: ${item.description || 'Sin descripción'} — ${formatCurrency(item.amountCents)} MXN`).join('\n')}`;
  const planned =
    section === 'debts'
      ? debts
      : section === 'savings'
        ? plannedSavingsRows(budget)
        : budget[section] || [];
  return (
    <div className="analysis-data-view">
      <div className="analysis-tabs" role="tablist" aria-label="Vistas de tus datos">
        {[
          ['comparison', 'Planeado vs. real'],
          ['movements', 'Movimientos'],
          ['categories', 'Categorías'],
          ['planned', 'Planeado'],
        ].map(([id, label]) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            aria-controls="analysis-table-view"
            id={`analysis-tab-${id}`}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>
      <motion.div
        key={tab}
        id="analysis-table-view"
        role="tabpanel"
        aria-labelledby={`analysis-tab-${tab}`}
        initial={reducedMotion ? false : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {tab === 'comparison' && (
          <div className="analysis-comparison-view">
            <p>Tu plan mensual frente a los movimientos registrados en el mes.</p>
            <ComparisonTable compact data={comparison} />
            <button
              className="analysis-text-button"
              onClick={() =>
                onAsk(
                  'Compara mi presupuesto planeado contra los movimientos reales del mes en ingresos, gastos y ahorros. Explica las diferencias con sus montos, respeta mis prioridades y considera que el mes puede no estar completo.',
                )
              }
            >
              <MessageSquarePlus size={15} />
              Pedir a Plaris que explique la comparación
            </button>
          </div>
        )}
        {tab === 'movements' && (
          <>
            <div className="analysis-table-filters">
              <label className="analysis-search">
                <Search size={15} />
                <input
                  aria-label="Buscar movimientos"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Buscar descripción o categoría"
                />
              </label>
              <select
                aria-label="Tipo de movimiento"
                value={type}
                onChange={(event) => setType(event.target.value)}
              >
                <option value="all">Todos los tipos</option>
                {transactionTypes.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
            <DataTable
              key={`${tab}-${query}-${type}`}
              label="Movimientos"
              columns={[
                { key: 'select', title: '' },
                { key: 'date', title: 'Fecha' },
                { key: 'description', title: 'Descripción / categoría' },
                { key: 'amount', title: 'Monto', money: true },
              ]}
              rows={filtered.map((item) => ({
                id: item.id,
                selected: selectedIds.includes(item.id),
                select: (
                  <input
                    type="checkbox"
                    aria-label={`Seleccionar ${item.description || item.category} del ${item.date}`}
                    checked={selectedIds.includes(item.id)}
                    onChange={() => onToggle(item.id)}
                  />
                ),
                date: new Date(`${item.date}T12:00:00`).toLocaleDateString('es-MX', {
                  day: 'numeric',
                  month: 'short',
                }),
                description: (
                  <>
                    {item.description || 'Sin descripción'}
                    <small className="analysis-cell-note">
                      {item.category} ·{' '}
                      {transactionTypes.find((type) => type.value === item.type)?.label}
                    </small>
                  </>
                ),
                amount: formatCurrency(item.amountCents),
              }))}
            />
            <div className="analysis-selection-bar">
              <span>
                {selected.length
                  ? `${selected.length} seleccionado(s)`
                  : 'Selecciona movimientos para consultarlos con Plaris.'}
              </span>
              <div>
                {selected.length > 0 && (
                  <button className="analysis-text-button" onClick={onClear}>
                    Limpiar
                  </button>
                )}
                <button
                  className="button button-secondary"
                  disabled={!selected.length}
                  onClick={() => onAsk(selectionPrompt)}
                >
                  <MessageSquarePlus size={15} />
                  Consultar selección
                </button>
              </div>
            </div>
          </>
        )}
        {tab === 'categories' && (
          <DataTable
            key={tab}
            label="Categorías"
            columns={[
              { key: 'category', title: 'Categoría' },
              { key: 'planned', title: 'Planeado', money: true },
              { key: 'actual', title: 'Real', money: true },
              { key: 'ask', title: '' },
            ]}
            rows={breakdown.map((item) => ({
              id: item.categoria,
              category: (
                <>
                  {item.categoria}
                  <small className="analysis-cell-note">
                    {item.categoriaNecesaria
                      ? 'No negociable en el plan'
                      : 'Sin prioridad protegida en el plan'}
                  </small>
                </>
              ),
              planned: money(item.planeado),
              actual: money(item.totalReal),
              ask: (
                <button
                  className="icon-button"
                  aria-label={`Consultar categoría ${item.categoria}`}
                  onClick={() =>
                    onAsk(
                      `Analiza los movimientos de la categoría ${JSON.stringify(item.categoria)}. Distingue sus compras por descripción y respeta su prioridad en el presupuesto.`,
                    )
                  }
                >
                  <MessageSquarePlus size={16} />
                </button>
              ),
            }))}
          />
        )}
        {tab === 'planned' && (
          <>
            <div className="analysis-table-filters">
              <select
                aria-label="Sección del presupuesto"
                value={section}
                onChange={(event) => setSection(event.target.value)}
              >
                {financeSections.map((item) => (
                  <option key={item.key} value={item.key}>
                    {item.label}
                  </option>
                ))}
              </select>
              <span>Presupuesto mensual · MXN</span>
            </div>
            <DataTable
              key={`${tab}-${section}`}
              label="Planeado"
              columns={[
                { key: 'name', title: 'Concepto' },
                { key: 'priority', title: section === 'debts' ? 'Saldo' : 'Prioridad / categoría' },
                {
                  key: 'amount',
                  title: section === 'debts' ? 'Pago mensual' : 'Monto mensual',
                  money: true,
                },
              ]}
              rows={planned.map((item) => ({
                id: item.id,
                name: item.name || 'Sin nombre',
                priority:
                  section === 'debts'
                    ? money(item.balance)
                    : section === 'expenses'
                      ? item.essential !== false
                        ? 'No negociable'
                        : 'Ajustable'
                      : item.category || item.name,
                amount:
                  section === 'debts' ? money(item.payment) : formatCurrency(item.amountCents),
              }))}
            />
          </>
        )}
      </motion.div>
    </div>
  );
}

export function AnalysisCategoryDetail({ breakdown, onAsk }) {
  const [category, setCategory] = useState('');
  const active = breakdown.find((item) => item.categoria === category) || breakdown[0];
  return (
    <div className="analysis-detail-view">
      <div className="analysis-table-filters">
        <select
          aria-label="Categoría para desglosar"
          value={active?.categoria || ''}
          onChange={(event) => setCategory(event.target.value)}
        >
          {!breakdown.length && <option value="">Sin gastos registrados</option>}
          {breakdown.map((item) => (
            <option key={item.categoria}>{item.categoria}</option>
          ))}
        </select>
        <span>
          {active
            ? `${money(active.totalReal)} en gastos reales`
            : 'Agrega movimientos en Presupuesto'}
        </span>
      </div>
      <DataTable
        key={active?.categoria || 'empty'}
        label="Detalle de la categoría"
        pageSize={3}
        columns={[
          { key: 'description', title: 'Descripción' },
          { key: 'actual', title: 'Real', money: true },
          { key: 'share', title: '% del total', money: true },
        ]}
        rows={(active?.detalles || []).map((item, index) => ({
          id: index,
          description: item.descripcion,
          actual: money(item.monto),
          share: `${item.porcentajeCategoria}%`,
        }))}
      />
      <div className="analysis-selection-bar">
        <span>La prioridad se define en lo planeado.</span>
        <button
          className="button button-secondary"
          disabled={!active}
          onClick={() =>
            onAsk(
              `Revisa el desglose de ${JSON.stringify(active.categoria)}. ¿Qué compras podría ajustar, según sus descripciones, sin afectar mis necesidades?`,
            )
          }
        >
          <MessageSquarePlus size={15} />
          Consultar categoría
        </button>
      </div>
    </div>
  );
}
