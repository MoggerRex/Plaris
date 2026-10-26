import { Navigate, NavLink, useParams } from 'react-router-dom';
import { useMonthBudget } from '../hooks/useMonthBudget';
import { financeSections, profileLink } from '../config/financeSections';
import PageHeading from '../components/common/PageHeading';
import ProfileDetailsForm from '../components/profile/ProfileDetailsForm';
import FinancialSectionForm from '../components/profile/FinancialSectionForm';

export default function Profile() {
  const { section = 'resumen' } = useParams();
  const state = useMonthBudget();
  const selected = financeSections.find((item) => item.key === section);
  if (!selected && section !== 'resumen') return <Navigate to="/perfil/resumen" replace />;

  return (
    <main className="page-shell">
      <nav className="section-tabs" aria-label="Datos del perfil">
        {financeSections.map((item) => (
          <NavLink key={item.key} to={profileLink(item.key, state.month)}>
            {item.label}
          </NavLink>
        ))}
        <NavLink to={profileLink('resumen', state.month)}>Perfil y meta</NavLink>
      </nav>
      {state.storageError && <p role="alert">{state.storageError}</p>}
      {selected ? (
        <FinancialSectionForm
          key={section + state.month}
          section={selected}
          rows={section === 'debts' ? state.deudas_activas : state.budget[section] || []}
          onSave={(rows) =>
            section === 'debts'
              ? state.updateDebts(rows)
              : state.updateBudget(state.month, section, rows)
          }
        />
      ) : (
        <ProfileDetailsForm
          key="profile-details"
          profile={state.profile}
          onSave={state.updateProfile}
        />
      )}
    </main>
  );
}