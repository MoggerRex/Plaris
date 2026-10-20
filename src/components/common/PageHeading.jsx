export default function PageHeading({ eyebrow, title, children }) {
  return (
    <header className="page-heading">
      <div>
        <span className="eyebrow">{eyebrow || 'Tu espacio financiero'}</span>
        <h1>{title}</h1>
      </div>
      <div className="heading-actions">{children}</div>
    </header>
  );
}
