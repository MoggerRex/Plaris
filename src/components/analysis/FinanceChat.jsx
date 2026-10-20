import { useState } from 'react';
import { useFinanceChat } from '../../hooks/useFinanceChat';

export default function FinanceChat({ context, disabled, onSave }) {
  const [question, setQuestion] = useState('');
  const [saved, setSaved] = useState(false);
  const { messages, loading, error, send } = useFinanceChat(context);

  function submit(event) {
    event.preventDefault();
    send(question);
    setQuestion('');
    setSaved(false);
  }

  return (
    <section className="panel chat-panel">
      <span className="eyebrow">Comprende tus datos</span>
      <h2>¿Qué análisis necesitas?</h2>
      <p>
        Selecciona las secciones que quieres analizar. El chat usa Ollama local y recibe únicamente
        esos campos.
      </p>
      <div
        className="chat-messages"
        role="log"
        aria-live="polite"
        aria-label="Conversación con Plaris"
      >
        {!messages.length && (
          <p className="empty-state">
            Prueba: “¿Cuál es mi mayor gasto?” o “Explícame la diferencia entre planeado y real”.
          </p>
        )}
        {messages.map((item, index) => (
          <article className={'chat-message ' + item.role} key={index}>
            <strong>{item.role === 'user' ? 'Tú' : 'Plaris'}</strong>
            <p>{item.content}</p>
          </article>
        ))}
        {loading && <p role="status">Plaris está revisando tus datos…</p>}
      </div>
      <form onSubmit={submit}>
        <label className="field">
          <span>Tu pregunta</span>
          <textarea
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            required
            disabled={disabled || loading}
          />
        </label>
        <div className="form-buttons">
          <button className="button button-primary" disabled={disabled || loading}>
            {loading ? 'Analizando…' : 'Preguntar a Plaris'}
          </button>
        </div>
      </form>
      {disabled && <p>Selecciona al menos una sección para comenzar.</p>}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {messages.some((item) => item.role === 'assistant') && (
        <button
          className="button button-secondary"
          disabled={loading || saved}
          onClick={() => {
            onSave({ month: context.periodo, context, messages });
            setSaved(true);
          }}
        >
          {saved ? 'Análisis guardado' : 'Guardar este análisis'}
        </button>
      )}
    </section>
  );
}
