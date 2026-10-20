import { useState } from 'react';
import BudgetRowsEditor from '../BudgetRowsEditor';
import DebtEditor from './DebtEditor';

export default function FinancialSectionForm({ section, rows, onSave }) {
  const [draft, setDraft] = useState(() => structuredClone(rows));
  const [message, setMessage] = useState('');
  const debts = section.key === 'debts';

  function save(event) {
    event.preventDefault();
    const invalid = draft.some(
      (row) =>
        !row.name.trim() ||
        (debts
          ? !['balance', 'payment', 'minimum', 'rate'].every(
              (key) => Number.isFinite(row[key]) && row[key] >= 0,
            )
          : !Number.isFinite(row.amountCents) || row.amountCents < 0),
    );
    if (invalid) {
      setMessage('Completa los nombres y montos válidos, o elimina las filas vacías.');
      return;
    }
    onSave(draft);
    setMessage(section.label + ' guardados. El total del agente se actualizó.');
  }

  return (
    <form onSubmit={save}>
      {debts ? (
        <DebtEditor rows={draft} onChange={setDraft} />
      ) : (
        <BudgetRowsEditor
          label={section.label}
          section={section.key}
          rows={draft}
          onChange={setDraft}
          showCategory={section.key === 'incomes'}
        />
      )}
      <button className="button button-primary">Guardar {section.label.toLowerCase()}</button>
      {message && <p role="status">{message}</p>}
    </form>
  );
}
