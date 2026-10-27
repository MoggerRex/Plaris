import { useState, useEffect, useRef } from 'react';
import { useMonthBudget } from '../../hooks/useMonthBudget';
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
  const { saveAnalysis, addTransaction } = useMonthBudget();
  const [decision, setDecision] = useState(null);

  // Ref para asegurarnos de que el análisis solo se guarde una vez en el historial
  const hasSavedToHistory = useRef(false);

  const snapshot = result.snapshot;

  // Efecto para guardar automáticamente este análisis en el historial de Plaris
  useEffect(() => {
    if (!snapshot || hasSavedToHistory.current) return;

    const { purchase } = snapshot;
    const question = `Quiero comprar ${purchase.name || 'un producto'} por ${formatCurrency(purchase.priceCents)}.${purchase.note ? ' ' + purchase.note : ''}`;
    const answer = [result.titulo, result.explicacion].filter(Boolean).join('\n\n');

    saveAnalysis({
      month: snapshot.month,
      type: 'purchase_advice',
      messages: [
        { role: 'user', content: question },
        { role: 'assistant', content: answer },
      ],
    });
    hasSavedToHistory.current = true;
  }, [snapshot, result, saveAnalysis]);

  if (!snapshot) return null;
  const { purchase, calculo } = snapshot;
  const tone = VERDICT_TONE[calculo.tone] || VERDICT_TONE.neutral;

  const handleBuy = () => {
    addTransaction({
      type: 'expense',
      category: 'Compras',
      description: purchase.name || 'Compra analizada',
      amountCents: purchase.priceCents,
      date: new Date().toISOString().slice(0, 10),
    });
    setDecision('bought');
  };

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
      </dl>

      {snapshot.hasPlannedData && (
        <>
          <h4>Tu plan del mes</h4>
          <dl className="advisor-facts" aria-label="Tu plan del mes">
            <div>
              <dt>Ingreso planeado</dt>
              <dd>{formatCurrency(snapshot.plannedIncomeCents)}</dd>
            </div>
            <div>
              <dt>Gastos planeados</dt>
              <dd>{formatCurrency(snapshot.plannedExpenseCents)}</dd>
            </div>
            <div>
              <dt>Ahorro planeado</dt>
              <dd>{formatCurrency(snapshot.plannedSavingCents)}</dd>
            </div>
            <div>
              <dt>Ahorro en fondo</dt>
              <dd>{formatCurrency(snapshot.plannedFundSavingCents)}</dd>
            </div>
          </dl>
        </>
      )}

      <div className="advisor-available">
        <span>Disponible después de cubrir tu plan</span>
        <strong className={snapshot.availableCents < 0 ? 'is-negative' : undefined}>
          {formatCurrency(snapshot.availableCents)}
        </strong>
      </div>
      <p className="advisor-source">
        Usa tus movimientos reales y tu plan del mes. Los gastos y ahorros planeados pendientes se
        descuentan; el ahorro en fondo se trata como protegido.
      </p>

      {!snapshot.hasRealIncome && (
        <p className="advisor-warning">
          Aún no hay ingresos reales registrados en {monthLabel(snapshot.month)}.
          {snapshot.hasPlannedData
            ? ` Tu plan contempla ${formatCurrency(snapshot.plannedIncomeCents)} de ingreso, ${formatCurrency(snapshot.plannedExpenseCents)} de gastos y ${formatCurrency(snapshot.plannedSavingCents)} de ahorro.`
            : ''}{' '}
          Sin ingresos reales no se puede confirmar si la compra es posible; registra al menos un
          ingreso en Movimientos.
        </p>
      )}
      {!snapshot.hasRealExpenses && snapshot.hasRealIncome && (
        <p className="advisor-warning">
          No hay gastos reales registrados. El cálculo usa{' '}
          {formatCurrency(snapshot.projectedExpenseCents)} de gastos planeados para no tratar ese
          dinero como libre.
        </p>
      )}
      {calculo.requiereIngresoPlaneado && (
        <p className="advisor-warning">
          Este resultado depende de {formatCurrency(snapshot.pendingIncomeCents)} de ingreso
          planeado que aún no registras como real.
        </p>
      )}
      {calculo.requiereFondo && (
        <p className="advisor-warning">
          Para esta compra tendrías que usar {formatCurrency(calculo.montoFondoCents)} de tu ahorro
          en fondo, bajando tu cantidad ahorrada.
        </p>
      )}
      {calculo.requiereUsarAhorro && (
        <p className="advisor-warning">
          La compra solo cabe reduciendo {formatCurrency(calculo.montoAjusteAhorroCents)} de ahorro
          planeado no protegido o de gastos opcionales.
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

      {/* BOTONES INTERACTIVOS DE DECISIÓN */}
      <div className="advisor-decision">
        {!decision ? (
          <>
            <h4>¿Qué decides?</h4>
            <div className="advisor-decision-actions">
              <button type="button" className="button button-primary" onClick={handleBuy}>
                Sí lo compré
              </button>
              <button
                type="button"
                className="button button-secondary"
                onClick={() => setDecision('rejected')}
              >
                No lo compré
              </button>
            </div>
          </>
        ) : decision === 'bought' ? (
          <p className="advisor-decision-feedback success">
            ✅ ¡Movimiento registrado! Se ha guardado como gasto real en tus Movimientos de este
            mes.
          </p>
        ) : (
          <p className="advisor-decision-feedback neutral">
            🚫 Compra descartada. ¡Bien hecho cuidando tu plan financiero!
          </p>
        )}
      </div>
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
