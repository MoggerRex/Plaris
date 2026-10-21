import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { useAdvice } from '../../hooks/useAdvice';
import { toPlannerData } from '../../services/financeAdapter';
import AdviceResult from './AdviceResult';

export default function AgentWorkspace({ month, budget, profile, debts }) {
  const [context, setContext] = useState('');
  const [plan, setPlan] = useState('estandar');
  const { result, error, loading, generate } = useAdvice();

  function submit(event) {
    event.preventDefault();
    generate(toPlannerData(budget, profile, debts, month, context), plan);
  }

  return (
    <section className="agent-workspace">
      <h2>
        ¿Por dónde
        <br />
        empezamos{profile.displayName ? ', ' + profile.displayName : ''}?
      </h2>
      <p className="agent-subtitle">
        Dale un propósito a tu dinero. Plaris te ayuda a encontrar el camino.
      </p>
      <div className="goal-preview">
        <strong>{profile.goalName || 'Aún no has definido una meta'}</strong>
        <Link to={'/perfil/resumen?mes=' + month}>
          Editar mi meta y mis datos <ArrowUpRight size={16} />
        </Link>
      </div>

      <form onSubmit={submit} className="agent-question">
        {/* Barra de chat tipo Gemini */}
        <div className="chat-input-container">
          <textarea
            id="agent-context"
            value={context}
            onChange={(event) => setContext(event.target.value)}
            placeholder="Cuéntale a Plaris qué tienes en mente…"
            disabled={loading}
            rows={1}
          />
          <div className="chat-controls-inline">
            <select
              value={plan}
              onChange={(event) => setPlan(event.target.value)}
              disabled={loading}
              aria-label="Tipo de análisis"
              className="chat-plan-select"
            >
              <option value="estandar">Estándar</option>
              <option value="avanzado">Avanzado</option>
            </select>
            <button
              type="submit"
              className="chat-send-button"
              disabled={loading}
              aria-label="Crear mi plan"
            >
              <ArrowUpRight size={18} />
            </button>
          </div>
        </div>

        {/* Botones inferiores de acciones rápidas totalmente centrados */}
        <div className="agent-quick-actions">
          <Link to={'/dashboard?mes=' + month} className="pill-button">
            <span>Φ</span> Agente
          </Link>
          <Link to={'/perfil/resumen?mes=' + month} className="pill-button">
            <span>✏️</span> Agendar
          </Link>
          <Link to={'/analisis?mes=' + month} className="pill-button">
            <span>📄</span> Historial
          </Link>
          <Link to={'/perfil?mes=' + month} className="pill-button">
            <span>🗂️</span> Mis datos
          </Link>
        </div>
      </form>

      {error && (
        <p role="alert" className="validation-box warning">
          {error}
        </p>
      )}
      {loading && <p role="status">Plaris está preparando tu asesoría con Ollama…</p>}
      <AdviceResult result={result} />
    </section>
  );
}