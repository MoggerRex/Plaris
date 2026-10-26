import { lazy, Suspense } from 'react';
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
  useParams,
} from 'react-router-dom';
import { BudgetProvider } from './context/BudgetContext';
import { useBudget } from './context/useBudget';
import AppLayout from './components/layout/AppLayout';
import Onboarding from './pages/onboarding/Onboarding';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Profile = lazy(() => import('./pages/Profile'));
const Budget = lazy(() => import('./pages/Budget'));
const Charts = lazy(() => import('./pages/Charts'));
const Analysis = lazy(() => import('./pages/Analysis'));
const Guide = lazy(() => import('./pages/Guide'));
const Templates = lazy(() => import('./pages/Templates'));
const Movimientos = lazy(() => import('./pages/Movimientos'));

function OnboardingOnly() {
  const { onboardingComplete } = useBudget();
  return onboardingComplete ? <Navigate to="/dashboard" replace /> : <Outlet />;
}

function CompletedOnboarding() {
  const { onboardingComplete } = useBudget();
  return onboardingComplete ? <Outlet /> : <Navigate to="/onboarding/intro" replace />;
}

// Existing financial profile links lead to Budget; profile and debt details stay available.
function LegacyBudgetRedirect() {
  const { section } = useParams();
  const location = useLocation();
  return (
    <Navigate
      to={'/presupuesto/' + (section || 'incomes') + location.search + location.hash}
      replace
    />
  );
}

function ProfileRoute() {
  const { section } = useParams();
  return section === 'resumen' || section === 'debts' ? <Profile /> : <LegacyBudgetRedirect />;
}

export default function App() {
  return (
    <BrowserRouter>
      <BudgetProvider>
        <Suspense
          fallback={
            <main className="page-shell">
              <p>Cargando Plaris…</p>
            </main>
          }
        >
          <Routes>
            <Route element={<AppLayout />}>
              <Route element={<OnboardingOnly />}>
                <Route path="/onboarding/:step?" element={<Onboarding />} />
              </Route>
              <Route element={<CompletedOnboarding />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/perfil/:section?" element={<ProfileRoute />} />
                <Route path="/graficas" element={<Charts />} />
                <Route path="/analisis" element={<Analysis />} />
                <Route path="/guia" element={<Guide />} />
                <Route path="/plantillas" element={<Templates />} />
                <Route path="/movimientos" element={<Movimientos />} />
                <Route path="/presupuesto/:section?" element={<Budget />} />
              </Route>
            </Route>
            <Route path="/" element={<Navigate to="/onboarding/intro" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </BudgetProvider>
    </BrowserRouter>
  );
}
