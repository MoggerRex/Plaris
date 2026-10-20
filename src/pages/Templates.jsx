import PageHeading from '../components/common/PageHeading';
import MonthPicker from '../components/common/MonthPicker';
import TemplateManager from '../components/templates/TemplateManager';
import { useMonthBudget } from '../hooks/useMonthBudget';

export default function Templates() {
  const state = useMonthBudget();
  return (
    <main className="page-shell">
      <PageHeading title="Mis plantillas">
        <MonthPicker month={state.month} onChange={state.changeMonth} />
      </PageHeading>
      <TemplateManager
        month={state.month}
        templates={state.savedTemplates}
        onSave={state.saveNamedTemplate}
        onApply={state.applyNamedTemplate}
      />
    </main>
  );
}
