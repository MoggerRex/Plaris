import { useState } from 'react';
import GuideContent from '../components/guide/GuideContent';
import { guideTopics } from '../config/guideTopics';

export default function Guide() {
  const [active, setActive] = useState('inicio');
  return (
    <main>

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
