import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useMonthBudget } from '../hooks/useMonthBudget';
import { financeSections, budgetLink as profileLink } from '../config/financeSections';
import BudgetMonthSummary from '../components/finance/BudgetMonthSummary';
import MonthPicker from '../components/common/BudgetMonthPicker';
import PageHeading from '../components/common/PageHeading';
import PlannedBudgetForm from '../components/profile/PlannedBudgetForm';
import MonthlyTransactions from '../components/transactions/MonthlyTransactions';
import TemplateManager from '../components/templates/TemplateManager';

export default function Budget() {
  const { section = 'incomes' } = useParams();
  const state = useMonthBudget();
  const { hash } = useLocation();
  const actualRef = useRef(null);
  const templatesRef = useRef(null);
  const navigate = useNavigate();
  const budgetSections = financeSections.filter((item) => item.type);
  const selected = budgetSections.find((item) => item.key === section);
  useEffect(() => {
    if (hash === '#movimientos') actualRef.current?.scrollIntoView({ block: 'start' });
  }, [hash, section]);
  if (!selected) return <Navigate to={profileLink('incomes', state.month)} replace />;

  return (
    <main className="page-shell budget-page">
      <PageHeading title="Presupuesto">
        <MonthPicker month={state.month} onChange={state.changeMonth} buttonStyle />
      </PageHeading>
      <p>Planea tu mes y registra lo que realmente ocurre, en un mismo lugar.</p>
      {state.storageError && <p role="alert">{state.storageError}</p>}
      <BudgetMonthSummary data={state.comparison} month={state.month} />
      <div className="budget-toolbar">
        <label className="field budget-category-picker">
          <span>Tipo de presupuesto</span>
          <select
            value={section}
            onChange={(event) => navigate(profileLink(event.target.value, state.month))}
          >
            {budgetSections.map((item) => (
              <option key={item.key} value={item.key}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="button button-secondary"
          onClick={() => templatesRef.current.showModal()}
        >
          Guardar o cargar plantilla
        </button>
      </div>
      <dialog
        ref={templatesRef}
        className="budget-templates-dialog"
        aria-labelledby="templates-title"
      >
        <div className="section-heading">
          <h2 id="templates-title">Plantillas de presupuesto</h2>
          <button
            type="button"
            className="button button-quiet"
            onClick={() => templatesRef.current.close()}
          >
            Cerrar
          </button>
        </div>
        <TemplateManager
          key={state.month}
          month={state.month}
          templates={state.savedTemplates || []}
          onSave={state.saveNamedTemplate}
          onApply={state.applyNamedTemplate}
          onDelete={state.deleteNamedTemplate}
        />
      </dialog>
      <section id="movimientos" ref={actualRef}>
        <MonthlyTransactions
          key={state.month}
          state={state}
          plannedContent={
            <PlannedBudgetForm
              key={section + state.month + JSON.stringify(state.budget[section])}
              section={selected}
              rows={state.budget[section] || []}
              onSave={(rows) => state.updateBudget(state.month, section, rows)}
            />
          }
        />
      </section>
    </main>
  );
}
