import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../Navbar';
import TemplateSidebar from '../templates/TemplateSidebar';
import { useBudget } from '../../context/useBudget';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { storageError, onboardingComplete } = useBudget();
  return (
    <div className="app-layout">
      <Navbar sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className={'app-body' + (sidebarOpen && onboardingComplete ? ' sidebar-open' : '')}>
        {sidebarOpen && onboardingComplete && (
          <TemplateSidebar onNavigate={() => setSidebarOpen(false)} />
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
