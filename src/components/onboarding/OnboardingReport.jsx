import { Check, LineChart as LineChartIcon, Sparkles } from 'lucide-react';
import {
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatCurrency } from '../../services/budgetService';

const COLORS = ['#106057', '#2eb6aa', '#c43785', '#4169c5', '#e3a227', '#7f5aa2'];

export default function OnboardingReport({ result, applied, onApply }) {
  if (!result) return null;
  const { analysis } = result;
  const projection = result.projection || [];
  const goalNames = analysis.goals.map((goal) => goal.name);

  return (
    <section className="onboarding-report panel">
      <div className="section-heading">
        <div>
          <span className="eyebrow"><Sparkles size={14} /> Reporte de tu plan</span>
          <h2>Así se ve tu distribución</h2>
          <p>{result.resumen}</p>
        </div>
        <div className="report-source">{result.source === 'ollama' ? 'Analizado por Plaris + Ollama' : 'Proyección local disponible'}</div>
      </div>

      <div className="report-charts">
        <section className="report-chart">
          <h3>Distribución mensual</h3>
          {analysis.distribution.length ? (
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={analysis.distribution} dataKey="value" nameKey="name" innerRadius="42%" outerRadius="72%">
                    {analysis.distribution.map((item, index) => <Cell key={item.name} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value) * 100)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : <p className="empty-state">Aún no hay importes para graficar.</p>}
        </section>
        <section className="report-chart">
          <h3>Proyección de metas y emergencia</h3>
          {projection.length ? (
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={projection} margin={{ top: 10, right: 12, left: 0, bottom: 8 }}>
                  <XAxis dataKey="month" tickLine={false} />
                  <YAxis tickFormatter={(value) => value >= 1000 ? `${value / 1000}k` : value} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value) * 100)} />
                  <Legend />
                  {[...goalNames, 'Fondo de emergencia'].map((name, index) => (
                    <Line key={name} type="monotone" dataKey={name} stroke={COLORS[index % COLORS.length]} strokeWidth={2} dot={false} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : <p className="empty-state">Agrega aportaciones mensuales para ver una proyección.</p>}
        </section>
      </div>

      <div className="report-findings">
        <div>
          <h3>Metas por prioridad</h3>
          {result.metas?.length ? result.metas.map((goal) => (
            <article className="report-finding" key={goal.id}>
              <strong>{analysis.goals.find((item) => item.id === goal.id)?.name || goal.id}</strong>
              <span className={`status-tag ${goal.estado}`}>{goal.estado.replace('_', ' ')}</span>
              <p>{goal.explicacion}</p>
              <small>{goal.recomendacion}</small>
            </article>
          )) : <p className="empty-state">No registraste metas todavía.</p>}
        </div>
        <div>
          <h3>Fondo de emergencia</h3>
          <article className="report-finding">
            <strong>{formatCurrency(analysis.emergency.currentCents)} de {formatCurrency(analysis.emergency.targetCents)}</strong>
            <p>{result.emergencia?.explicacion}</p>
            <small>{result.emergencia?.recomendacion}</small>
          </article>
          {result.siguientesPasos?.length > 0 && <>
            <h3>Siguientes pasos</h3>
            <ul className="report-next-steps">{result.siguientesPasos.map((step) => <li key={step}><Check size={15} /> {step}</li>)}</ul>
          </>}
        </div>
      </div>

      {result.warning && <p className="validation-box warning">{result.warning} Se muestra el cálculo local y puedes finalizar sin perder tus datos.</p>}
      <div className="report-actions">
        <LineChartIcon size={18} />
        <span>Las proyecciones son estimaciones con tus aportaciones mensuales actuales.</span>
        <button type="button" className="button button-secondary" onClick={onApply} disabled={applied}>
          {applied ? <><Check size={16} /> Ajustes aplicados</> : 'Aplicar sugerencias de Plaris'}
        </button>
      </div>
    </section>
  );
}