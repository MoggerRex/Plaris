import { Link } from 'react-router-dom';
import { useMonthBudget } from '../../hooks/useMonthBudget';

export default function TemplateSidebar({ onNavigate }) {
  const { savedTemplates, profile, month } = useMonthBudget();
  return (
    <aside className="template-sidebar" id="template-sidebar">
      <span className="eyebrow">Tu biblioteca</span>
      <h2>Plantillas</h2>
      <Link className="button button-primary" to={'/plantillas?mes=' + month} onClick={onNavigate}>
        Nueva plantilla
      </Link>
      <Link to={'/analisis?mes=' + month} onClick={onNavigate}>
        Análisis de tus datos
      </Link>
      <p>Tus presupuestos guardados</p>
      {savedTemplates.map((item) => (
        <Link
          key={item.id}
          to={'/plantillas?mes=' + month + '#plantilla-' + item.id}
          onClick={onNavigate}
        >
          {item.name}
        </Link>
      ))}
      {!savedTemplates.length && <p>No has guardado plantillas todavía.</p>}
      <Link className="sidebar-profile" to="/perfil/resumen" onClick={onNavigate}>
        {profile.displayName || 'Mi perfil'}
      </Link>
    </aside>
  );
}
