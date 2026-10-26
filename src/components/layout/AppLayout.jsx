import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../Navbar';
import TemplateSidebar from '../templates/TemplateSidebar';
import { useBudget } from '../../context/useBudget';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { storageError, onboardingComplete } = useBudget();

  // La misma función para el logo "Plaris" del Navbar y el botón "Cerrar menú"
  const toggleSidebar = () => setSidebarOpen((open) => !open);

  return (
    <div className="app-layout">
      <Navbar sidebarOpen={sidebarOpen} onToggleSidebar={toggleSidebar} />
      <div className={'app-body' + (sidebarOpen && onboardingComplete ? ' sidebar-open' : '')}>
        {onboardingComplete && (
          <TemplateSidebar
            isOpen={sidebarOpen}
            onNavigate={() => setSidebarOpen(false)}
            onToggle={toggleSidebar}
          />
        )}
        <div className="route-content">
          {storageError && (
            <p role="alert" className="validation-box warning">
              {storageError}
            </p>
          )}
          <Outlet />
        </div>
      </div>
    </div>
  );
}