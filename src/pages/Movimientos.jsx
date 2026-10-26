import { Navigate } from 'react-router-dom';
import { useMonthBudget } from '../hooks/useMonthBudget';

export default function Movimientos() {
  const { month } = useMonthBudget();
  return <Navigate to={'/perfil?mes=' + month + '#movimientos'} replace />;
}
