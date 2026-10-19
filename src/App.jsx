import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import { BudgetProvider } from './context/BudgetContext.jsx';
import { useBudget } from './context/useBudget';
import Onboarding from './pages/onboarding/Onboarding';

const Dashboard = lazy(() => import('./pages/Dashboard'));

function OnboardingOnly() {
  const { onboardingComplete } = useBudget();
  return onboardingComplete ? <Navigate to="/dashboard" replace /> : <Outlet />;
}

function CompletedOnboarding() {
  const { onboardingComplete } = useBudget();
  return onboardingComplete ? <Outlet /> : <Navigate to="/onboarding/ingresos" replace />;
}

function AppLayout() {
  return <><Navbar /><Outlet /></>;
}

export default function App() {
  return (
    <BrowserRouter>
      <BudgetProvider>
        <Suspense fallback={<main><p>Cargando Plaris…</p></main>}>
          <Routes>
            <Route element={<AppLayout />}>
              <Route element={<OnboardingOnly />}>
                <Route path="/onboarding/:step?" element={<Onboarding />} />
              </Route>
              <Route element={<CompletedOnboarding />}>
                <Route path="/dashboard" element={<Dashboard />} />
              </Route>
            </Route>
            <Route path="/" element={<Navigate to="/onboarding/ingresos" replace />} />
            <Route path="*" element={<Navigate to="/onboarding/ingresos" replace />} />
          </Routes>
        </Suspense>
      </BudgetProvider>
    </BrowserRouter>
  );
}
