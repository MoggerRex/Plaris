import { useState } from 'react';
import PageHeading from '../components/common/PageHeading';
import GuideContent from '../components/guide/GuideContent';
import { guideTopics } from '../config/guideTopics';

export default function Guide() {
  const [active, setActive] = useState('inicio');
  return (
    <main className="page-shell">
      <PageHeading title="Guía Plaris" />
      <div className="section-tabs" role="group" aria-label="Temas de la guía">
        {guideTopics.map((topic) => (
          <button
            key={topic.id}
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
