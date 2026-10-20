import { Link } from 'react-router-dom';

export default function GuideContent({ topic }) {
  return (
    <article className="panel guide-content">
      <span className="eyebrow">Aprende a usar tu espacio financiero</span>
      <h2>{topic.title}</h2>
      <p>{topic.text}</p>
      {topic.link && (
        <Link className="button button-primary" to={topic.link}>
          {topic.action}
        </Link>
      )}
    </article>
  );
}
