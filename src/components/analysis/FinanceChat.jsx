import { useEffect, useImperativeHandle, useRef, useState } from 'react';
import { ArrowUp, Check, Save, Sparkles, Square } from 'lucide-react';
import { useFinanceChat } from '../../hooks/useFinanceChat';

const analyzeQuestion =
  'Analiza mis movimientos reales del mes y el presupuesto completo. Identifica oportunidades de ahorro por descripción dentro de cada categoría, incluso las necesarias. Respeta las prioridades de lo planeado. Usa los montos y porcentajes calculados, sugiere ajustes sin eliminar todos mis gustos y pide detalle si falta información.';

export default function FinanceChat({ ref, context, onSave }) {
  const [question, setQuestion] = useState('');
  const [saved, setSaved] = useState(false);
  const { messages, loading, error, send, stop } = useFinanceChat(context);
  const input = useRef(null);
  const log = useRef(null);
  useImperativeHandle(
    ref,
    () => ({
      prepareQuestion(text) {
        setQuestion(text);
        requestAnimationFrame(() => input.current?.focus());
      },
    }),
    [],
  );
  useEffect(() => {
    if (log.current) log.current.scrollTop = log.current.scrollHeight;
  }, [messages, loading]);

  function ask(text) {
    if (!text.trim() || loading) return;
    send(text);
    setQuestion('');
    setSaved(false);
  }

  return (
    <div className="analysis-chat">
      <div className="analysis-chat-context">
        <span>Contexto completo · {context.periodo}</span>
        <span>{context.movimientosReales.length} movimientos · MXN</span>
      </div>
      <div
        ref={log}
        className="analysis-chat-log"
        role="log"
        aria-live="polite"
        aria-label="Conversación con Plaris"
      >
        {!messages.length && (
          <div className="analysis-chat-welcome">
            <div className="analysis-assistant-symbol">Φ</div>
            <h3>
              Cuidemos lo importante.
              <br />
              Ajustemos los gustos.
            </h3>
            <p>
              Veo tu presupuesto, movimientos, deudas y metas del mes. Exploremos qué compras
              podrías ajustar para acercarte a tus objetivos.
            </p>
            <button className="button button-primary" onClick={() => ask(analyzeQuestion)}>
              <Sparkles size={16} />
              Analizar mis gastos
            </button>
            <p className="analysis-cell-note">
              Las descripciones ayudan a distinguir la despensa de las botanas, aunque ambas estén
              en alimentación.
            </p>
          </div>
        )}
        {messages.map((item, index) => (
          <article className={`analysis-message ${item.role}`} key={index}>
            <strong>{item.role === 'user' ? 'Tú' : 'Φ Plaris'}</strong>
            <p>{item.content || (loading ? 'Revisando tus datos…' : '')}</p>
          </article>
        ))}
        {loading && (
          <p role="status" className="analysis-chat-status">
            Plaris está analizando tu contexto…
          </p>
        )}
      </div>
      {error && (
        <p className="form-error analysis-chat-error" role="alert">
          {error}
        </p>
      )}
      <div className="analysis-chat-actions">
        <button
          className="analysis-text-button"
          disabled={loading}
          onClick={() => ask(analyzeQuestion)}
        >
          <Sparkles size={14} />
          Revisar mis gastos
        </button>
        {messages.some((item) => item.role === 'assistant' && item.content) && (
          <button
            className="analysis-text-button"
            disabled={loading || saved}
            onClick={() => {
              onSave({ month: context.periodo, context, messages });
              setSaved(true);
            }}
          >
            {saved ? <Check size={14} /> : <Save size={14} />}
            {saved ? 'Guardado' : 'Guardar análisis'}
          </button>
        )}
      </div>
      <form
        className="analysis-composer"
        onSubmit={(event) => {
          event.preventDefault();
          ask(question);
        }}
      >
        <textarea
          ref={input}
          aria-label="Tu pregunta para Plaris"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Pregúntale a Plaris sobre tus movimientos…"
          rows={2}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
              event.preventDefault();
              ask(question);
            }
          }}
        />
        {loading ? (
          <button
            type="button"
            className="analysis-send"
            aria-label="Detener respuesta"
            onClick={stop}
          >
            <Square size={17} />
          </button>
        ) : (
          <button
            className="analysis-send"
            aria-label="Enviar pregunta a Plaris"
            disabled={!question.trim()}
          >
            <ArrowUp size={20} />
          </button>
        )}
      </form>
      <p className="analysis-chat-footnote">
        Ollama local · Recomendaciones para revisar, sin modificar tus datos.
      </p>
    </div>
  );
}
