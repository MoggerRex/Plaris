import ViewportChart from './ViewportChart';
import { Cell, Legend, Pie, PieChart, Tooltip } from 'recharts';
import { chartTooltipStyle, useChartAnimation } from './chartTheme';
import { money } from '../../domain/planner';

export default function CategoryChart({ rows, title, color }) {
  const animation = useChartAnimation();
  const data = rows
    .filter((row) => row.amountCents > 0)
    .map((row) => ({
      name: row.name,
      value: row.amountCents / 100,
    }));

  return (
    <section className="panel chart-panel">
      <h2>{title}</h2>
      {data.length ? (
        <div className="chart-wrap" role="img" aria-label={`Distribución de ${title}`}>
          <ViewportChart width="100%" height="100%">
            <PieChart>
              <Pie
                {...animation}
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius="40%"
                outerRadius="72%"
              >
                {data.map((item, index) => (
                  <Cell
                    key={index}
                    fill={color}
                    fillOpacity={Math.max(0.3, 1 - (index % 5) * 0.15)}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value) => money(value)} contentStyle={chartTooltipStyle} />
              <Legend />
            </PieChart>
          </ViewportChart>
        </div>
      ) : (
        <p className="empty-state">Agrega conceptos en tu perfil para ver esta gráfica.</p>
      )}
    </section>
  );
}
