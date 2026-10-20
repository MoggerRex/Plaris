import { money } from '../../domain/planner';

export default function AdviceResult({ result }) {
  if (!result) return null;
  return (
    <article className="advisor-answer" role="status">
      <span className="eyebrow">Tu plan financiero</span>
      <h3>{result.analysis.risk}</h3>
      <p>{result.resumen}</p>
      {result.ajustesPropuestos.length > 0 && <h4>Ajustes sugeridos</h4>}
      {result.ajustesPropuestos.map((item) => (
        <p key={item.gastoId}>
          {item.explicacion} · {money(item.reduccionMensual)} al mes
        </p>
      ))}
      {result.advertencias.map((item) => (
        <p key={item}>{item}</p>
      ))}
    </article>
  );
}
