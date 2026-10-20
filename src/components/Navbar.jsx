import { BarChart3, BookOpen, Menu, MessageSquare, ScanSearch, UserRound } from 'lucide-react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useBudget } from '../context/useBudget';

const navigation = [
  { path: '/dashboard', label: 'Agente', icon: MessageSquare },
  { path: '/graficas', label: 'Tablas y gráficas', icon: BarChart3 },
  { path: '/analisis', label: 'Análisis y chat', icon: ScanSearch },
  { path: '/guia', label: 'Guía', icon: BookOpen },
  { path: '/perfil', label: 'Mi perfil', icon: UserRound },
];

export default function Navbar({ sidebarOpen, onToggleSidebar }) {
  const { onboardingComplete } = useBudget();
  const location = useLocation();
  return (
    <header className="app-header">
      <Link
        to={onboardingComplete ? '/dashboard' : '/onboarding/ingresos'}
        className="brand"
        aria-label="Plaris, inicio"
      >
        Φ <span>Plaris</span>
      </Link>
      {onboardingComplete && (
        <button
          type="button"
          className="menu-toggle"
          onClick={onToggleSidebar}
          aria-expanded={sidebarOpen}
          aria-controls="template-sidebar"
          aria-label="Abrir o cerrar plantillas"
        >
          <Menu />
        </button>
      )}
      <nav aria-label="Navegación principal">
        {onboardingComplete &&
          navigation.map(({ path, label, icon: Icon }) => (
            <NavLink key={path} to={path + location.search} title={label}>
              <Icon />
              <span>{label}</span>
            </NavLink>
          ))}
      </nav>
      <p>Formula planes financieros con nuestro agente Plaris</p>
    </header>
  );
}
