import { useState } from 'react';
import { useMonthBudget } from '../hooks/useMonthBudget';
import AgentSummary from '../components/agent/AgentSummary';
import GuideContent from '../components/guide/GuideContent';
import { guideTopics } from '../config/guideTopics';

export default function Guide() {
  const state = useMonthBudget();
  const [active, setActive] = useState('inicio');
  return (
    <main>
      {/* Misma barra de métricas y selector de mes que la pantalla del agente */}
      <AgentSummary
        month={state.month}
        changeMonth={state.changeMonth}
        budget={state.budget}
        debts={state.deudas_activas}
        totals={state.totals}
      />

      {/* Categorías: pegadas a la barra y repartidas en todo el ancho */}
      <div className="guide-tabs" role="group" aria-label="Temas de la guía">
        {guideTopics.map((topic) => (
          <button
            key={topic.id}
            type="button"
            aria-pressed={topic.id === active}
            onClick={() => setActive(topic.id)}
          >
            {topic.title}
          </button>
        ))}
      </div>

      <GuideContent topic={guideTopics.find((topic) => topic.id === active)} />
    </main>
  );
}