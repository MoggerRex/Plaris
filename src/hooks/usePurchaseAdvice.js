import { useEffect, useRef, useState } from 'react';
import { advicePlans } from '../domain/advicePlans';
import { requestPurchaseAdvice } from '../services/purchaseAdvice';

export function usePurchaseAdvice() {
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const controller = useRef(null);

  useEffect(() => () => controller.current?.abort(), []);

  async function generate(analysis) {
    controller.current?.abort();
    setError('');
    setResult(null);
    const active = new AbortController();
    controller.current = active;
    setLoading(true);
    const timeout = setTimeout(() => active.abort(), advicePlans.estandar.timeoutMs);
    try {
      const advice = await requestPurchaseAdvice(analysis, active.signal);
      if (controller.current === active)
        setResult({ ...advice, kind: 'purchase', snapshot: analysis });
    } catch (failure) {
      if (controller.current === active) {
        setError(
          failure.name === 'AbortError'
            ? 'El análisis agotó el tiempo disponible. Puedes volver a intentarlo.'
            : failure instanceof TypeError
              ? 'No se pudo conectar con Ollama. Comprueba que esté iniciado en localhost:11434.'
              : failure.message,
        );
      }
    } finally {
      clearTimeout(timeout);
      if (controller.current === active) setLoading(false);
    }
  }

  return { result, error, loading, generate };
}
