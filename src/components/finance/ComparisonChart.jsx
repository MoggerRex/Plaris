import ViewportChart from './ViewportChart';
import { Bar, BarChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis } from 'recharts';
import { chartColors, chartTooltipStyle, useChartAnimation } from './chartTheme';
import { money } from '../../domain/planner';

export default function ComparisonChart({
  data,
  title = 'Planeado y real',
  series = ['Planeado', 'Real'],
}) {
  const animation = useChartAnimation();
  return (
    <section className="panel chart-panel">
      <h2>{title}</h2>
      <div className="chart-wrap" role="img" aria-label={title}>
        <ViewportChart width="100%" height="100%">
          <BarChart data={data} margin={{ top: 12, right: 12, left: 0, bottom: 8 }}>
            <CartesianGrid vertical={false} stroke="#dce8e2" />
            <XAxis dataKey="name" tickLine={false} />
            <YAxis
              width={55}
              tickFormatter={(value) => (value >= 1000 ? `${value / 1000}k` : value)}
            />
            <Tooltip formatter={(value) => money(value)} contentStyle={chartTooltipStyle} />
            <Legend />
            {series.map((key) => (
              <Bar
                key={key}
                dataKey={key}
                fill={key === 'Planeado' ? chartColors.planned : chartColors.actual}
                {...animation}
                radius={[5, 5, 0, 0]}
              />
            ))}
          </BarChart>
        </ViewportChart>
      </div>
      {data.every((item) => series.every((key) => !item[key])) && (
        <p className="empty-state">Todavía no hay importes registrados para esta vista.</p>
      )}
    </section>
  );
}
