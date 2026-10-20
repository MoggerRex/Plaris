import { BarChart3, ClipboardList, MessageSquare, UserRound } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import { useBudget } from '../context/useBudget';
export default function Navbar() {
 const { onboardingComplete } = useBudget();
 const home = onboardingComplete ? '/dashboard' : '/onboarding/ingresos';
 return <header className="app-header"><Link to={home} className="brand" aria-label="Plaris, inicio">?</Link><nav aria-label="Navegaci?n principal"><NavLink to={home} title="Agente" aria-label="Agente"><MessageSquare /></NavLink>{onboardingComplete && <><NavLink to="/movimientos" title="Movimientos" aria-label="Movimientos"><BarChart3 /></NavLink><NavLink to="/presupuesto/incomes" title="Presupuesto" aria-label="Presupuesto"><ClipboardList /></NavLink></>}<span className="profile-mark" title="Presupuesto personal"><UserRound /></span></nav><p>Formula planes financieros con nuestro agente Plaris</p></header>;
}
