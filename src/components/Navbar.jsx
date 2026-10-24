import { BarChart3, BookOpen, MessageSquare, PanelLeftClose, ScanSearch, UserRound, MessageSquareText } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useBudget } from '../context/useBudget';

const navigation = [
  { path: '/dashboard', label: 'Agente', icon: MessageSquareText },
  { path: '/graficas', label: 'Tablas y gráficas', icon: BarChart3 },
  { path: '/analisis', label: 'Análisis gráfico', icon: ScanSearch },
  { path: '/guia', label: 'Guía', icon: BookOpen },
  { path: '/perfil', label: 'Mi perfil', icon: UserRound },
];

export default function Navbar({ sidebarOpen, onToggleSidebar }) {
  const { onboardingComplete } = useBudget();
  const location = useLocation();
  const isOpen = sidebarOpen && onboardingComplete;

  const animationConfig = {
    duration: 0.3,
    ease: [0.4, 0, 0.2, 1]
  };

  return (
    <motion.header 
      className="app-header"
      initial={false}
      animate={{
        gridTemplateColumns: isOpen ? "260px auto 1fr" : "80px auto 1fr"
      }}
      transition={animationConfig}
    >
      <motion.div 
        className="header-brand-section"
        initial={false}
        animate={{
          width: isOpen ? "260px" : "80px"
        }}
        transition={animationConfig}
      >
        {onboardingComplete ? (
          <div className="brand-controls-wrapper">
            <button
              type="button"
              className="brand-toggle-button"
              onClick={onToggleSidebar}
              aria-expanded={sidebarOpen}
              aria-controls="template-sidebar"
              aria-label={sidebarOpen ? "Cerrar menú" : "Abrir menú"}
            >
              <span className="phi-logo">Φ</span>
              {sidebarOpen && <span className="brand-title-large">PLARIS</span>}
            </button>
          </div>
        ) : (
          <div className="brand">
            <span className="phi-logo">Φ</span> <span className="brand-title-large">PLARIS </span>
          </div>
        )}
      </motion.div>

      <nav className="header-nav-section" aria-label="Navegación principal">
        {onboardingComplete &&
          navigation.map(({ path, label, icon: Icon }) => (
            <NavLink key={path} to={path + location.search} title={label}>
              <Icon />
              <span>{label}</span>
            </NavLink>
          ))}
      </nav>

      <div className="header-tagline-section">
        <p>FORMULA PLANES FINANCIEROS CON NUESTRO AGENTE PLARIS</p>
      </div>
    </motion.header>
  );
}