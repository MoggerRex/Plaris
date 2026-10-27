import { useState } from 'react';
import { LayoutTemplate } from 'lucide-react';
import { reportTypes } from '../../../config/agentForms';

/** Reportes: elegir una plantilla o una meta y pulsar el tipo de reporte. */
export default function ReportsForm({ templates = [], goals = [], busy, onSubmit }) {
  const [source, setSource] = useState('');
  const empty = templates.length === 0 && goals.length === 0;

  function request(report) {
    const [kind, ...rest] = source.split(':');
    onSubmit({ report, source: { kind, id: rest.join(':') } });
  }

  return (
    <div className="agent-form">
      <div className="agent-form-card">
        <label className="agent-field agent-field--wide">
          <span>Elige una plantilla o una meta</span>
          <select
            value={source}
            onChange={(event) => setSource(event.target.value)}
            disabled={busy || empty}
          >
            <option value="">{empty ? 'Aún no tienes plantillas ni metas' : 'Selecciona…'}</option>
            {templates.length > 0 && (
              <optgroup label="Mis plantillas">
                {templates.map((template) => (
                  <option key={template.id} value={'template:' + template.id}>
                    {template.name}
                  </option>
                ))}
              </optgroup>
            )}
            {goals.length > 0 && (
              <optgroup label="Mis metas">
                {goals.map((goal) => (
                  <option key={goal.id} value={'goal:' + goal.id}>
                    {goal.name}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
        </label>

        <div className="agent-report-options" role="group" aria-label="Tipo de reporte">
          {reportTypes.map(({ id, label, hint, icon: Icon }) => (
            <button
              key={id}
              type="button"
              className="agent-report-option"
              disabled={busy || !source}
              onClick={() => request(id)}
            >
              <Icon size={22} aria-hidden="true" />
              <span>
                <strong>{label}</strong>
                <small>{hint}</small>
              </span>
            </button>
          ))}
        </div>

        {!source && !empty && (
          <p className="agent-form-hint">
            <LayoutTemplate size={14} aria-hidden="true" /> Primero elige una plantilla o una meta.
          </p>
        )}
      </div>
    </div>
  );
}
