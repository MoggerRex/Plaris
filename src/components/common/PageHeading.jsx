export default function PageHeading({ title, children }) {
  return (
    <div className="page-heading">
      <div>
        <h1>{title}</h1>
      </div>
      {children && <div className="heading-actions">{children}</div>}
    </div>
  );
}