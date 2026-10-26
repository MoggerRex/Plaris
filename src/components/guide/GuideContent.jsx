import { Link } from 'react-router-dom';

function GuideSection({ section }) {
  const List = section.ordered ? 'ol' : 'ul';
  return (
    <section className="guide-section">
      <h3>{section.heading}</h3>
      {section.paragraphs?.map((paragraph, index) => (
        <p key={index}>{paragraph}</p>
      ))}
      {section.items?.length > 0 && (
        <List className="guide-list">
          {section.items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </List>
      )}
      {section.callout && (
        <aside className="guide-callout">
          <strong>{section.callout.label}</strong>
          <p>{section.callout.text}</p>
        </aside>
      )}
    </section>
  );
}

export default function GuideContent({ topic }) {
  return (
    <article className="guide-content">
      <header className="guide-header">
        <span className="eyebrow">Aprende a usar tu espacio financiero</span>
        <h2>{topic.title}</h2>
        <p className="guide-intro">{topic.text}</p>
      </header>

      {/* Las secciones se reparten en columnas según el ancho disponible */}
      <div className="guide-sections">
        {topic.sections?.map((section) => (
          <GuideSection key={section.heading} section={section} />
        ))}
      </div>

      {topic.link && (
        <Link className="button button-primary" to={topic.link}>
          {topic.action}
        </Link>
      )}
    </article>
  );
}
