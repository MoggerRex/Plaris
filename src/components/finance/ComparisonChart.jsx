import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { money } from '../../domain/planner';

export default function ComparisonChart({
  data,
  title = 'Planeado y real',
  series = ['Planeado', 'Real'],
}) {
  return (
    <section className="panel chart-panel">
      <h2>{title}</h2>
      <div className="chart-wrap" role="img" aria-label={title}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 12, right: 12, left: 0, bottom: 8 }}>
            <CartesianGrid vertical={false} stroke="#dce8e2" />
            <XAxis dataKey="name" tickLine={false} />
            <YAxis
              width={55}
              tickFormatter={(value) => (value >= 1000 ? `${value / 1000}k` : value)}
            />
            <Tooltip formatter={(value) => money(value)} />
            <Legend />
            {series.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                fill={index === 0 ? '#106057' : '#36b8aa'}
                radius={[5, 5, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
      {data.every((item) => series.every((key) => !item[key])) && (
        <p className="empty-state">Todavía no hay importes registrados para esta vista.</p>
      )}
    </section>
  );
}
