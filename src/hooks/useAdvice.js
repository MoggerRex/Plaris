import { useEffect, useRef, useState } from 'react';
import { analyze } from '../domain/planner';
import { requestAdvice } from '../services/plannerAdvice';
import { advicePlans } from '../domain/advicePlans';

export function useAdvice() {
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const controller = useRef(null);

  useEffect(() => () => controller.current?.abort(), []);

  async function generate(data, plan) {
    controller.current?.abort();
    setError('');
    setResult(null);
    const analysis = analyze(data);
    if (analysis.errors.length) {
      setLoading(false);
      setError(analysis.errors.join(' '));
      return;
    }
    const active = new AbortController();
    controller.current = active;
    setLoading(true);
    const timeout = setTimeout(() => active.abort(), advicePlans[plan].timeoutMs);
    try {
      const advice = await requestAdvice(data, analysis, plan, active.signal);
      if (controller.current === active) setResult({ ...advice, analysis });
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
