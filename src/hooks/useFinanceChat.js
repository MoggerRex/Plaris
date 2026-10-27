import { useEffect, useRef, useState } from 'react';
import { requestChat } from '../services/chatService';

export function useFinanceChat(context) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const controller = useRef(null);
  useEffect(() => () => controller.current?.abort(), []);

  async function send(text) {
    if (!text.trim() || loading) return;
    const next = [...messages, { role: 'user', content: text.trim() }];
    setMessages(next);
    setError('');
    setLoading(true);
    const active = new AbortController();
    controller.current = active;
    let timedOut = false;
    const timeout = setTimeout(() => {
      timedOut = true;
      active.abort();
    }, 120000);
    try {
      const answer = await requestChat(next, context, active.signal, (content) => {
        if (!active.signal.aborted && controller.current === active)
          setMessages([...next, { role: 'assistant', content }]);
      });
      if (!active.signal.aborted) setMessages([...next, { role: 'assistant', content: answer }]);
    } catch (failure) {
      if (controller.current === active) {
        setError(
          failure.name === 'AbortError'
            ? timedOut
              ? 'Se agotó el tiempo de respuesta. Puedes volver a intentarlo.'
              : 'Respuesta detenida. Puedes hacer otra pregunta.'
            : failure instanceof TypeError
              ? 'No se pudo conectar con Ollama en localhost:11434.'
              : failure.message,
        );
      }
    } finally {
      clearTimeout(timeout);
      if (controller.current === active) setLoading(false);
    }
  }
  return { messages, loading, error, send, stop: () => controller.current?.abort() };
}
