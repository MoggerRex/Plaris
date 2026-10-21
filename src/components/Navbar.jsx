import { BarChart3, BookOpen, MessageSquare, PanelLeftClose, ScanSearch, UserRound, MessageSquareText } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
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

  return (
    <header className="app-header">
      {/* SECCIÓN 1: Logo y Toggle desplegable con alineación precisa */}
      <div className={`header-brand-section ${sidebarOpen ? 'sidebar-expanded' : ''}`}>
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
      </div>

      {/* SECCIÓN 2: Navegación de botones */}
      <nav className="header-nav-section" aria-label="Navegación principal">
        {onboardingComplete &&
          navigation.map(({ path, label, icon: Icon }) => (
            <NavLink key={path} to={path + location.search} title={label}>
              <Icon />
              <span>{label}</span>
            </NavLink>
          ))}
      </nav>

      {/* SECCIÓN 3: Frase totalmente centrada */}
      <div className="header-tagline-section">
        <p>FORMULA PLANES FINANCIEROS CON NUESTRO AGENTE PLARIS</p>
      </div>
    </header>
  );
}