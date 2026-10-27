import { Suspense, useLayoutEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../Navbar';
import SymbolIntro from '../../animations/SymbolIntro';
import TemplateSidebar from '../templates/TemplateSidebar';
import { useBudget } from '../../context/useBudget';
import { useMonthBudget } from '../../hooks/useMonthBudget';
import AgentSummary from '../agent/AgentSummary';

function MonthlySummary() {
  const { month, changeMonth, budget, deudas_activas, totals } = useMonthBudget();
  return (
    <AgentSummary
      month={month}
      changeMonth={changeMonth}
      budget={budget}
      debts={deudas_activas}
      totals={totals}
    />
  );
}

function ReadyContent({ readyRef, children }) {
  useLayoutEffect(() => {
    readyRef.current = true;
    return () => {
      readyRef.current = false;
    };
  }, [readyRef]);
  return children;
}

export default function AppLayout() {
  const { pathname } = useLocation();
  const rootRef = useRef(null);
  const readyRef = useRef(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { storageError, onboardingComplete } = useBudget();

  // La misma función para el logo "Plaris" del Navbar y el botón "Cerrar menú"
  const toggleSidebar = () => setSidebarOpen((open) => !open);

  return (
    <div className={`app-layout${pathname === '/analisis' ? ' analysis-route' : ''}`} ref={rootRef}>
      <SymbolIntro rootRef={rootRef} readyRef={readyRef} />
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
          {onboardingComplete && <MonthlySummary />}
          {storageError && (
            <p role="alert" className="validation-box warning">
              {storageError}
            </p>
          )}
          <Suspense fallback={<p role="status">Cargando contenido...</p>}>
            <ReadyContent readyRef={readyRef}>
              <Outlet />
            </ReadyContent>
          </Suspense>
        </div>
      </div>
    </div>
  );
}
