import { useState } from 'react';
import { Plus, Target } from 'lucide-react';
import MoneyInput from '../../common/MoneyInput';

const BLANK = { name: '', cost: 0, deadlineDays: '', currentSaving: 0, protectedReserve: 0 };

function Field({ label, wide, children }) {
  return (
    <label className={'agent-field' + (wide ? ' agent-field--wide' : '')}>
      <span>{label}</span>
      {children}
    </label>
  );
}

/** Metas: elegir una meta existente (campos de solo lectura) o crear una nueva. */
export default function GoalForm({ goals = [], busy, onSubmit }) {
  const [mode, setMode] = useState(goals.length ? 'existing' : 'new');
  const [selectedId, setSelectedId] = useState('');
  const [draft, setDraft] = useState({ ...BLANK, deadlineDays: 90 });

  const isExisting = mode === 'existing';
  const selected = goals.find((goal) => goal.id === selectedId);
  const values = isExisting ? { ...BLANK, ...selected } : draft;
  const set = (key) => (value) => setDraft((previous) => ({ ...previous, [key]: value }));

  const valid = isExisting
    ? Boolean(selected)
    : draft.name.trim() && draft.cost > 0 && Number(draft.deadlineDays) >= 1;

  function submit(event) {
    event.preventDefault();
    if (!valid) return;
    if (isExisting) {
      onSubmit({ mode: 'existing', goalId: selected.id });
    } else {
      onSubmit({
        mode: 'new',
        saveToProfile: true,
        goal: { ...draft, name: draft.name.trim(), deadlineDays: Number(draft.deadlineDays) },
      });
    }
  }

  return (
    <form className="agent-form" onSubmit={submit}>
      <div className="agent-form-card">
        <div className="agent-subtabs">
          <div className="agent-segmented" role="group" aria-label="Tipo de meta">
            <button type="button" aria-pressed={isExisting} onClick={() => setMode('existing')}>
              <Target size={16} /> Meta existente
            </button>
            <button type="button" aria-pressed={!isExisting} onClick={() => setMode('new')}>
              <Plus size={16} /> Crear meta nueva
            </button>
          </div>
        </div>

        {isExisting && (
          <Field label="Elige tu meta" wide>
            <select
              value={selectedId}
              onChange={(event) => setSelectedId(event.target.value)}
              disabled={busy || goals.length === 0}
            >
              <option value="">
                {goals.length ? 'Selecciona una meta…' : 'Aún no tienes metas guardadas'}
              </option>
              {goals.map((goal) => (
                <option key={goal.id} value={goal.id}>
                  {goal.name}
                </option>
              ))}
            </select>
          </Field>
        )}

        <div className="agent-field-grid">
          <Field label="Nombre de la meta">
            <input
              type="text"
              value={values.name}
              onChange={(event) => set('name')(event.target.value)}
              readOnly={isExisting}
              placeholder="Ej. Laptop"
              required={!isExisting}
            />
          </Field>
          <Field label="Costo (MXN)">
            <MoneyInput value={values.cost} onChange={set('cost')} readOnly={isExisting} />
          </Field>
          <Field label="Plazo (días)">
            <input
              type="number"
              min="1"
              inputMode="numeric"
              value={values.deadlineDays}
              onChange={(event) => set('deadlineDays')(event.target.value)}
              readOnly={isExisting}
              placeholder="90"
            />
          </Field>
          <Field label="Ahorro que ya tienes (MXN)">
            <MoneyInput
              value={values.currentSaving}
              onChange={set('currentSaving')}
              readOnly={isExisting}
            />
          </Field>
          <Field label="Reserva protegida (MXN)">
            <MoneyInput
              value={values.protectedReserve}
              onChange={set('protectedReserve')}
              readOnly={isExisting}
            />
          </Field>
        </div>

        <div className="agent-form-actions">
          <p className="agent-form-hint">
            {isExisting
              ? 'Los datos se llenan solos al elegir la meta.'
              : 'Al enviarla, la meta se guardará en tu perfil, en Mis plantillas de metas.'}
          </p>
          <button type="submit" className="button button-primary" disabled={busy || !valid}>
            {isExisting ? 'Analizar meta' : 'Crear y analizar meta'}
          </button>
        </div>
      </div>
    </form>
  );
}