import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { useAdvice } from '../../hooks/useAdvice';
import { toPlannerData } from '../../services/financeAdapter';
import AdviceResult from './AdviceResult';

export default function AgentWorkspace({ month, budget, profile, debts }) {
  const [context, setContext] = useState('');
  const { result, error, loading, generate } = useAdvice();

  function submit(event) {
    event.preventDefault();
    generate(toPlannerData(budget, profile, debts, month, context));
  }

  return (
    <section className="agent-workspace">
      <span className="eyebrow">Un plan empieza con una decisión</span>
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
        <label htmlFor="agent-context">¿Qué quieres lograr?</label>
        <textarea
          id="agent-context"
          value={context}
          onChange={(event) => setContext(event.target.value)}
          placeholder="Cuéntale a Plaris qué tienes en mente…"
          disabled={loading}
        />
        <div className="agent-submit">
          <button className="button button-primary" disabled={loading}>
            {loading ? 'Analizando…' : 'Crear mi plan'} <ArrowUpRight size={17} />
          </button>
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
