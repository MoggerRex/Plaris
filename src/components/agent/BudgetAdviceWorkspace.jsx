import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Pencil, FileClock, FolderUser, CornerDownLeft } from 'lucide-react';
import { useAdvice } from '../../hooks/useAdvice';
import { toPlannerData } from '../../services/financeAdapter';
import { primaryBudgetGoal } from '../../services/budgetConnections';
import AdviceResult from './AdviceResult';

export default function BudgetAdviceWorkspace({ month, budget, profile, debts }) {
  const activeGoal = primaryBudgetGoal(budget, profile, month);
  const goals = (budget.goals || []).filter((goal) => goal.name?.trim());
  const goalNames = goals.length ? goals.map((goal) => goal.name).join(' · ') : activeGoal.name;
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
        <strong>{goalNames || 'Aún no has definido una meta'}</strong>
        <Link to={(goals.length ? '/presupuesto/savings?mes=' : '/perfil/resumen?mes=') + month}>
          Ver mis metas y datos <ArrowUpRight size={16} />
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
              <CornerDownLeft size={18} />
            </button>
          </div>
        </div>

        {/* Botones inferiores de acciones rápidas con iconos de Lucide */}
        <div className="agent-quick-actions">
          <Link to={'/dashboard?mes=' + month} className="pill-button">
            <span>Φ</span> Agente
          </Link>
          <Link to={'/perfil/resumen?mes=' + month} className="pill-button">
            <Pencil size={16} /> Agendar
          </Link>
          <Link to={'/analisis?mes=' + month} className="pill-button">
            <FileClock size={16} /> Historial
          </Link>
          <Link to={'/perfil?mes=' + month} className="pill-button">
            <FolderUser size={16} /> Mis datos
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
