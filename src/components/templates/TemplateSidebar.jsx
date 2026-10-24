import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useMonthBudget } from '../../hooks/useMonthBudget';

export default function TemplateSidebar({ onNavigate, isOpen }) {
  const { savedTemplates, profile, month } = useMonthBudget();
  
  const animationConfig = {
    duration: 0.3,
    ease: [0.4, 0, 0.2, 1]
  };

  return (
    <motion.aside 
      className="template-sidebar" 
      id="template-sidebar"
      initial={false}
      animate={{ x: isOpen ? 0 : "-100%" }}
      transition={animationConfig}
    >
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
    </motion.aside>
  );
}