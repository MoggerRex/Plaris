import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CornerDownLeft, LayoutTemplate } from 'lucide-react';
import { planOptions } from '../../../config/agentForms';

/** Agente: elegir una plantilla para analizar el flujo de tu dinero. */
export default function FlowForm({ templates = [], month, busy, onSubmit }) {
  const [source, setSource] = useState('current');
  const [plan, setPlan] = useState('estandar');

  function submit(event) {
    event.preventDefault();
    onSubmit({ source, plan });
  }

  return (
    <form className="agent-form" onSubmit={submit}>
      <div className="chat-input-container">
        <LayoutTemplate size={18} className="chat-leading-icon" aria-hidden="true" />
        <select
          className="chat-field-select"
          aria-label="Plantilla a analizar"
          value={source}
          onChange={(event) => setSource(event.target.value)}
          disabled={busy}
        >
          <option value="current">Mis datos actuales del mes</option>
          {templates.length > 0 && (
            <optgroup label="Mis plantillas">
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </optgroup>
          )}
        </select>
        <div className="chat-controls-inline">
          <select
            className="chat-plan-select"
            aria-label="Tipo de análisis"
            value={plan}
            onChange={(event) => setPlan(event.target.value)}
            disabled={busy}
          >
            {planOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button type="submit" className="chat-send-button" disabled={busy} aria-label="Analizar">
            <CornerDownLeft size={18} />
          </button>
        </div>
      </div>
      {templates.length === 0 && (
        <p className="agent-form-hint">
          Aún no tienes plantillas guardadas. <Link to={'/plantillas?mes=' + month}>Crear una</Link>
        </p>
      )}
    </form>
  );
}