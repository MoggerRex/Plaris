import { Suspense, useLayoutEffect, useRef, useState } from 'react';
import SymbolIntro from '../../animations/SymbolIntro';
import { Outlet } from 'react-router-dom';
import Navbar from '../Navbar';
import TemplateSidebar from '../templates/TemplateSidebar';
import { useBudget } from '../../context/useBudget';

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
  const rootRef = useRef(null);
  const readyRef = useRef(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { storageError, onboardingComplete } = useBudget();
  return (
    <div className="app-layout" ref={rootRef}>
      <SymbolIntro rootRef={rootRef} readyRef={readyRef} />
      <div className="app-content">
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
            <Suspense fallback={<p role="status">Cargando contenido…</p>}>
              <ReadyContent readyRef={readyRef}>
                <Outlet />
              </ReadyContent>
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
