import { money } from '../../domain/planner';
import { formatCurrency } from '../../services/budgetService';

const VERDICT_TONE = {
  positive: 'positive',
  warning: 'warning',
  negative: 'negative',
  neutral: 'neutral',
};

function monthLabel(month) {
  if (!/^\d{4}-\d{2}$/.test(month || '')) return month || 'el mes';
  return new Date(`${month}-01T12:00:00`).toLocaleDateString('es-MX', {
    month: 'long',
    year: 'numeric',
  });
}

function PurchaseAdvice({ result }) {
  const snapshot = result.snapshot;
  if (!snapshot) return null;
  const { purchase, calculo } = snapshot;
  const tone = VERDICT_TONE[calculo.tone] || VERDICT_TONE.neutral;

  return (
    <article className={`advisor-answer advisor-purchase advisor-purchase--${tone}`} role="status">
      <span className="eyebrow">Análisis de tu compra · {monthLabel(snapshot.month)}</span>
      <h3>{result.titulo || calculo.etiqueta}</h3>
      <p className="advisor-verdict">{calculo.etiqueta}</p>
      <p className="advisor-purchase-line">
        Comprar <strong>{purchase.name || 'esta compra'}</strong> por{' '}
        <strong>{formatCurrency(purchase.priceCents)}</strong>.
      </p>
      <p>{result.explicacion}</p>

      <dl className="advisor-facts" aria-label="Tus datos reales del mes">
        <div>
          <dt>Ingresos reales</dt>
          <dd>{formatCurrency(snapshot.incomeCents)}</dd>
        </div>
        <div>
          <dt>Gastos reales</dt>
          <dd>{formatCurrency(snapshot.expenseCents)}</dd>
        </div>
        <div>
          <dt>Ahorros reales</dt>
          <dd>{formatCurrency(snapshot.savingCents)}</dd>
        </div>
        <div>
          <dt>Pagos de deuda</dt>
          <dd>{formatCurrency(snapshot.debtPaymentCents)}</dd>
        </div>
        {snapshot.debtBalanceCents > 0 && (
          <div>
            <dt>Deuda total</dt>
            <dd>{formatCurrency(snapshot.debtBalanceCents)}</dd>
          </div>
        )}
        <div>
          <dt>Disponible real</dt>
          <dd className={snapshot.availableCents < 0 ? 'is-negative' : undefined}>
            {formatCurrency(snapshot.availableCents)}
          </dd>
        </div>
      </dl>
      <p className="advisor-source">
        Calculado solo con tus movimientos reales de {monthLabel(snapshot.month)}. No usa el
        presupuesto planeado.
      </p>

      {!snapshot.hasRealIncome && (
        <p className="advisor-warning">
          Aún no hay ingresos reales registrados en {monthLabel(snapshot.month)}. Sin ingresos
          reales no se puede confirmar si la compra es posible; registra al menos un ingreso en
          Movimientos.
        </p>
      )}
      {!snapshot.hasRealExpenses && snapshot.hasRealIncome && (
        <p className="advisor-warning">
          No hay gastos reales registrados este mes. El cálculo puede ser optimista; registra tus
          gastos para medir mejor el impacto.
        </p>
      )}

      {result.impacto && (
        <>
          <h4>¿Cómo te afecta?</h4>
          <p>{result.impacto}</p>
        </>
      )}
      {result.razones?.length > 0 && (
        <>
          <h4>Por qué</h4>
          <ul>
            {result.razones.map((item, index) => (
              <li key={`${item}-${index}`}>{item}</li>
            ))}
          </ul>
        </>
      )}
      {result.recomendacion && (
        <>
          <h4>Qué te recomiendo</h4>
          <p>{result.recomendacion}</p>
        </>
      )}
      {result.datosFaltantes?.length > 0 && (
        <>
          <h4>Datos por completar</h4>
          <ul>
            {result.datosFaltantes.map((item, index) => (
              <li key={`${item}-${index}`}>{item}</li>
            ))}
          </ul>
        </>
      )}
    </article>
  );
}

export default function AdviceResult({ result }) {
  if (!result) return null;
  if (result.kind === 'purchase') return <PurchaseAdvice result={result} />;
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
