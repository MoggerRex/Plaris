import ViewportChart from './ViewportChart';
import { chartColors, chartTooltipStyle, useChartAnimation } from './chartTheme';
import { useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { buildAnalytics } from '../../services/analyticsService';
import { formatCurrency } from '../../services/budgetService';

const percent = (value) =>
  value === null
    ? 'Sin base de cálculo'
    : `${value.toLocaleString('es-MX', { maximumFractionDigits: 1 })}%`;
const axisMoney = (value) =>
  new Intl.NumberFormat('es-MX', {
    notation: 'compact',
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 1,
  }).format(value / 100);
const moneyTooltip = (value) => formatCurrency(value);
const series = {
  income: ['plannedIncome', 'realIncome', 'Ingresos'],
  expense: ['plannedExpense', 'realExpense', 'Gastos'],
  debt: ['plannedDebt', 'realDebt', 'Pagos de deuda'],
};

function Metric({ label, value, children }) {
  return (
    <article className="analytics-metric">
      <h4>{label}</h4>
      <strong>{value}</strong>
      <p>{children}</p>
    </article>
  );
}

function DataTable({ caption, headers, rows }) {
  return (
    <details className="analytics-data">
      <summary>Ver datos de {caption.toLowerCase()}</summary>
      <div className="analytics-scroll">
        <table>
          <caption>{caption}</caption>
          <thead>
            <tr>
              {headers.map((header) => (
                <th scope="col" key={header}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index}>
                {row.map((cell, column) => (
                  <td key={column}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}

function WeeklyTooltip({ active, payload }) {
  const week = payload?.[0]?.payload;
  if (!active || !week) return null;
  return (
    <div className="weekly-tooltip">
      <strong>{week.periodLabel}</strong>
      <p>
        Dinero disponible: <strong>{formatCurrency(week.available)}</strong>
      </p>
      <dl>
        <dt>Saldo antes de esta semana</dt>
        <dd>{formatCurrency(week.balance - week.flow)}</dd>
        <dt>Ingresos recibidos</dt>
        <dd>{formatCurrency(week.income)}</dd>
        <dt>Dinero recibido de préstamos</dt>
        <dd>{formatCurrency(week.borrowed || 0)}</dd>
        <dt>Gastos</dt>
        <dd>{formatCurrency(week.expenses)}</dd>
        <dt>Ahorro neto (aportaciones − retiros)</dt>
        <dd>{formatCurrency(week.savings)}</dd>
        <dt>Pagos de deuda</dt>
        <dd>{formatCurrency(week.debts)}</dd>
        <dt>Reservado para próximos meses</dt>
        <dd>{formatCurrency(week.reserved)}</dd>
      </dl>
    </div>
  );
}

export default function AnnualAnalytics({
  month,
  transactions,
  monthlyBudgets,
  openingFunds,
  debts,
  overview,
  children,
}) {
  const animation = useChartAnimation();
  const [comparison, setComparison] = useState('expense');
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const data = buildAnalytics({
    month,
    transactions,
    monthlyBudgets,
    scope: 'month',
    today,
    openingFunds,
    debts,
  });
  const monthLabel = new Date(`${month}-01T12:00:00`).toLocaleDateString('es-MX', {
    month: 'short',
  });
  const weeks = data.weeks
    .filter((week) => week.available !== null)
    .map((week) => {
      const [start, end] = week.label.split('–').map(Number);
      const isCurrent =
        month === today.slice(0, 7) &&
        Number(today.slice(8)) >= start &&
        Number(today.slice(8)) <= end;
      return {
        ...week,
        periodLabel: `${start}–${isCurrent ? Number(today.slice(8)) : end} ${monthLabel}${isCurrent ? ' · Hasta hoy' : ''}`,
      };
    });
  const period = month;
  const [plannedKey, actualKey, seriesLabel] = series[comparison];
  const hasData = data.hasMonthData;
  return (
    <section className="annual-analytics" aria-label="Gráficas e indicadores financieros">
      <header className="analytics-header">
        <div>
          <p>
            Mes de referencia: {month}. Registros hasta {data.cutoff}. Se excluyen movimientos
            programados y depósitos con fecha futura. Presupuesto: mes asignado del ingreso. Balance
            semanal: fecha real.
          </p>
        </div>
      </header>

      <div className="analytics-metrics">
        <Metric
          label="Ahorro proyectado al cierre del año"
          value={data.projection === null ? 'Sin proyección' : formatCurrency(data.projection)}
        >
          Registrado este año: {formatCurrency(data.savedToDate)}. Saldo de ahorro actual:{' '}
          {formatCurrency(data.savingsStock)}. La proyección incluye el ahorro inicial y descuenta
          retiros, sin rendimientos.
        </Metric>
        <Metric
          label={`Cumplimiento del plan · ${month}`}
          value={!data.hasMonthData ? 'Sin movimientos reales' : percent(data.compliance)}
        >
          Índice orientativo: promedio de ingresos, límite de gastos, ahorro y pagos de deuda; cada
          componente tiene un máximo de 100%.
        </Metric>
        <Metric
          label={`Exceso de gastos · ${month}`}
          value={
            data.planned.expenses === 0 && data.actual.expenses > 0
              ? 'Gasto sin presupuesto'
              : percent(data.excessPercent)
          }
        >
          {formatCurrency(data.excess)} por encima de {formatCurrency(data.planned.expenses)}{' '}
          planeados. Sin presupuesto no se calcula un porcentaje.
        </Metric>
        <Metric label={`Ingresos ahorrados · ${period}`} value={percent(data.savingRate)}>
          {formatCurrency(data.selectedSavings)} de ahorro neto (aportaciones menos retiros) /{' '}
          {formatCurrency(data.selectedIncome)} de ingresos recibidos y asignados al periodo. Puede
          ser negativo al retirar ahorros previos o superar 100% si ahorras dinero de otros
          periodos.
        </Metric>
      </div>

      <details className="analytics-method">
        <summary>Cómo se calculan el cumplimiento y la proyección</summary>
        <p>
          El cumplimiento no es una calificación financiera ni mide el paso del mes. Las metas se
          comparan completas, por lo que al inicio del mes puede ser bajo. Se omiten componentes sin
          objetivo; un gasto sin presupuesto cuenta como 0% en gastos.
        </p>
        <ul>
          {data.complianceParts.map((part) => (
            <li key={part.label}>
              {part.label}: {percent(part.value)}. {part.rule}, limitado a 100%.
            </li>
          ))}
        </ul>
        <p>
          Proyección = saldo de ahorro al corte (saldo inicial + aportaciones − retiros) + ahorro
          pendiente del plan del mes en curso + planes de ahorro de los meses restantes. Cuando un
          mes futuro no tiene presupuesto, se repite el plan de ahorro de referencia:{' '}
          {formatCurrency(data.fallbackSavings)} al mes. No se extrapola un mes parcial como si
          estuviera completo. El escenario supone que cumplirás esas aportaciones; no garantiza que
          haya ingresos suficientes.
        </p>
      </details>

      <section className="analytics-group" aria-labelledby="monthly-charts-title">
        <div className="analytics-group-heading">
          <h2 id="monthly-charts-title">Tu mes en perspectiva</h2>
          <p>Compara tu plan con lo registrado y revisa en qué gastas y cuánto te queda.</p>
        </div>
        <div className="analytics-grid">
          {overview}
          <article className="analytics-chart">
            <h3>¿En qué gastas? · {period}</h3>
            <p>
              Gastos reales por categoría; incluye categorías creadas después del onboarding. Las
              deudas se muestran por separado.
            </p>
            {data.categoryData.length === 0 ? (
              <p className="analytics-empty">Todavía no hay gastos reales en este periodo.</p>
            ) : (
              <>
                <ViewportChart
                  initialDimension={{ width: 640, height: 300 }}
                  width="100%"
                  height={Math.max(260, data.categoryData.length * 42)}
                >
                  <BarChart
                    data={data.categoryData}
                    layout="vertical"
                    margin={{ left: 12, right: 24 }}
                    accessibilityLayer
                  >
                    <CartesianGrid
                      stroke={chartColors.grid}
                      strokeDasharray="3 3"
                      horizontal={false}
                    />
                    <XAxis type="number" tickFormatter={axisMoney} />
                    <YAxis type="category" dataKey="category" width={110} tick={{ fontSize: 12 }} />
                    <Tooltip formatter={moneyTooltip} contentStyle={chartTooltipStyle} />
                    <Bar
                      {...animation}
                      dataKey="amount"
                      name="Gasto real"
                      fill={chartColors.expense}
                      radius={[0, 5, 5, 0]}
                    />
                  </BarChart>
                </ViewportChart>
                <DataTable
                  caption="Gastos por categoría"
                  headers={['Categoría', 'Gasto', '% del gasto']}
                  rows={data.categoryData.map((row) => [
                    row.category,
                    formatCurrency(row.amount),
                    percent(row.share),
                  ])}
                />
              </>
            )}
          </article>
          <article className="analytics-chart analytics-wide">
            <h3>Dinero disponible por semana · {month}</h3>
            <p>
              Cada barra muestra cuánto dinero te queda al final del periodo, incluyendo lo que
              traes de semanas anteriores y descontando lo reservado para próximos meses. Verde:
              saldo disponible. Rojo: saldo negativo. La semana actual muestra lo registrado hasta
              hoy.
            </p>
            {weeks.length === 0 ? (
              <p className="analytics-empty">
                Este mes todavía no comienza. El balance aparecerá conforme avance el mes.
              </p>
            ) : (
              <>
                <div className="weekly-chart-scroll">
                  <div className="weekly-chart-canvas">
                    <ViewportChart
                      initialDimension={{ width: 640, height: 320 }}
                      width="100%"
                      height={320}
                    >
                      <BarChart
                        data={weeks}
                        margin={{ top: 35, right: 30, bottom: 15, left: 10 }}
                        accessibilityLayer
                      >
                        <CartesianGrid
                          stroke={chartColors.grid}
                          strokeDasharray="3 3"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="periodLabel"
                          interval={0}
                          tick={{ fontSize: 12 }}
                          height={50}
                        />
                        <YAxis
                          tickFormatter={axisMoney}
                          width={85}
                          domain={['auto', 'auto']}
                          padding={{ top: 20, bottom: 25 }}
                        />
                        <Tooltip content={<WeeklyTooltip />} />
                        <ReferenceLine y={0} stroke="#64748b" />
                        <Bar
                          {...animation}
                          dataKey="available"
                          name="Dinero disponible"
                          maxBarSize={75}
                        >
                          {weeks.map((week) => (
                            <Cell
                              key={week.label}
                              fill={week.available < 0 ? chartColors.negative : chartColors.actual}
                            />
                          ))}
                          <LabelList
                            dataKey="available"
                            position="top"
                            formatter={formatCurrency}
                            fontSize={12}
                            fill="#172b3a"
                          />
                        </Bar>
                      </BarChart>
                    </ViewportChart>
                  </div>
                </div>
                <DataTable
                  caption="Dinero disponible por semana"
                  headers={['Periodo', 'Dinero disponible']}
                  rows={weeks.map((row) => [row.periodLabel, formatCurrency(row.available)])}
                />
              </>
            )}
            <p>
              Calculado con tus movimientos registrados. Pasa sobre una barra para ver los ingresos,
              gastos, ahorro y pagos de deuda del periodo.
            </p>
          </article>
        </div>
      </section>
      <section className="analytics-group" aria-labelledby="distribution-charts-title">
        <div className="analytics-group-heading">
          <h2 id="distribution-charts-title">Cómo distribuyes tu presupuesto</h2>
          <p>Desglose de tus ingresos, gastos y ahorros planeados, y del saldo de tus deudas.</p>
        </div>
        <div className="analytics-grid">{children}</div>
      </section>
      <section className="analytics-group" aria-labelledby="year-charts-title">
        <div className="analytics-group-heading">
          <h2 id="year-charts-title">Tu progreso durante {month.slice(0, 4)}</h2>
          <p>Revisa el ahorro mes a mes y el escenario proyectado al cierre del año.</p>
        </div>
        <div className="analytics-grid">
          <article className="analytics-chart">
            <h3>Ahorro mensual · {month.slice(0, 4)}</h3>
            <p>
              Compara el ahorro neto (aportaciones menos retiros) con el plan mensual. El saldo
              inicial no cuenta como ahorro nuevo.
            </p>
            <ViewportChart initialDimension={{ width: 640, height: 300 }} width="100%" height={300}>
              <BarChart data={data.annual} accessibilityLayer>
                <CartesianGrid stroke={chartColors.grid} strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={axisMoney} width={75} />
                <Tooltip formatter={moneyTooltip} contentStyle={chartTooltipStyle} />
                <Legend />
                <Bar
                  {...animation}
                  dataKey="plannedSaving"
                  name="Planeado"
                  fill={chartColors.planned}
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  {...animation}
                  dataKey="realSaving"
                  name="Ahorro neto"
                  fill={chartColors.actual}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ViewportChart>
            <DataTable
              caption="Ahorro mensual"
              headers={['Mes', 'Planeado', 'Aportaciones', 'Retiros', 'Ahorro neto']}
              rows={data.annual.map((row) => [
                row.month,
                formatCurrency(row.plannedSaving),
                ...['contributions', 'withdrawals', 'realSaving'].map((key) =>
                  row[key] === null ? 'Fuera del corte' : formatCurrency(row[key]),
                ),
              ])}
            />
          </article>
          <article className="analytics-chart">
            <h3>Tu ahorro hacia diciembre · {month.slice(0, 4)}</h3>
            <p>
              La línea continua muestra el saldo de ahorro, incluido el saldo inicial y descontando
              retiros. La línea discontinua completa el escenario del plan.
            </p>
            <ViewportChart initialDimension={{ width: 640, height: 300 }} width="100%" height={300}>
              <LineChart data={data.annual} accessibilityLayer>
                <CartesianGrid stroke={chartColors.grid} strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={axisMoney} width={75} />
                <Tooltip formatter={moneyTooltip} contentStyle={chartTooltipStyle} />
                <Legend />
                <Line
                  {...animation}
                  type="linear"
                  dataKey="cumulative"
                  name="Saldo de ahorro"
                  stroke={chartColors.actual}
                  strokeWidth={3}
                  connectNulls={false}
                />
                <Line
                  {...animation}
                  type="linear"
                  dataKey="projected"
                  name="Escenario del plan"
                  stroke={chartColors.projection}
                  strokeWidth={3}
                  strokeDasharray="6 4"
                  connectNulls={false}
                />
              </LineChart>
            </ViewportChart>
            {data.projection === null && (
              <p>No hay base de ahorro para proyectar en el año seleccionado.</p>
            )}
            <DataTable
              caption="Proyección de ahorro"
              headers={['Mes', 'Saldo de ahorro', 'Escenario del plan']}
              rows={data.annual.map((row) => [
                row.month,
                row.cumulative === null ? 'Fuera del corte' : formatCurrency(row.cumulative),
                row.projected === null ? '—' : formatCurrency(row.projected),
              ])}
            />
          </article>
          <article className="analytics-chart analytics-wide">
            <h3>Planeado y real · {month.slice(0, 4)}</h3>
            <p>Ingresos por mes de presupuesto asignado; gastos y deudas por fecha real.</p>
            <label>
              Comparar{' '}
              <select value={comparison} onChange={(e) => setComparison(e.target.value)}>
                <option value="expense">Gastos</option>
                <option value="income">Ingresos</option>
                <option value="debt">Pagos de deuda</option>
              </select>
            </label>
            <ViewportChart initialDimension={{ width: 640, height: 300 }} width="100%" height={300}>
              <BarChart data={data.annual} accessibilityLayer>
                <CartesianGrid stroke={chartColors.grid} strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={axisMoney} width={75} />
                <Tooltip formatter={moneyTooltip} contentStyle={chartTooltipStyle} />
                <Legend />
                <Bar
                  {...animation}
                  dataKey={plannedKey}
                  name={`${seriesLabel} planeados`}
                  fill={chartColors.planned}
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  {...animation}
                  dataKey={actualKey}
                  name={`${seriesLabel} reales`}
                  fill={chartColors.actual}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ViewportChart>
            <DataTable
              caption={seriesLabel}
              headers={['Mes', 'Planeado', 'Real']}
              rows={data.annual.map((row) => [
                row.month,
                formatCurrency(row[plannedKey]),
                row[actualKey] === null ? 'Fuera del corte' : formatCurrency(row[actualKey]),
              ])}
            />
          </article>
        </div>
      </section>

      {!hasData && (
        <p className="analytics-empty">
          No hay movimientos reales en el mes seleccionado. Registra o confirma movimientos para
          alimentar las estadísticas.
        </p>
      )}
    </section>
  );
}
