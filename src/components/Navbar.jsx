import { LayoutDashboard } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import { useBudget } from '../context/useBudget';

export default function Navbar() {
  const { onboardingComplete } = useBudget();

  return (
    <header className="app-header">
      <Link to={onboardingComplete ? '/dashboard' : '/onboarding/ingresos'} className="brand">
        <span className="brand-mark">P</span>
        <span>plaris</span>
      </Link>
      <nav className="main-nav" aria-label="Navegación principal">
        {onboardingComplete && (
          <NavLink to="/dashboard"><LayoutDashboard size={17} /> Presupuesto</NavLink>
        )}
      </nav>
    </header>
  );
}
