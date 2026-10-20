import { useState } from 'react';

const fields = [
  ['displayName', 'Tu nombre', 'text'],
  ['goalName', 'Nombre de tu meta', 'text'],
  ['cost', 'Costo de la meta (MXN)', 'number'],
  ['days', 'Plazo de la meta (días)', 'number'],
  ['savings', 'Ahorro que ya tienes (MXN)', 'number'],
  ['reserve', 'Reserva protegida (MXN)', 'number'],
];

export default function ProfileDetailsForm({ profile, onSave }) {
  const [draft, setDraft] = useState(profile);
  const [message, setMessage] = useState('');

  function save(event) {
    event.preventDefault();
    if (Number(draft.reserve || 0) > Number(draft.savings || 0)) {
      setMessage('La reserva protegida no puede superar el ahorro actual.');
      return;
    }
    onSave(draft);
    setMessage('Perfil y meta guardados.');
  }

  return (
    <form className="panel" onSubmit={save}>
      <h2>Tu perfil y tu meta</h2>
      <div className="goal-grid">
        {fields.map(([key, label, type]) => (
          <label className="field" key={key}>
            <span>{label}</span>
            <input
              type={type}
              min={key === 'days' ? 1 : 0}
              max={key === 'days' ? 36500 : undefined}
              step={key === 'days' ? 1 : 'any'}
              value={draft[key] ?? ''}
              onChange={(event) => setDraft({ ...draft, [key]: event.target.value })}
              required={['goalName', 'cost', 'days'].includes(key)}
            />
          </label>
        ))}
      </div>
      <p>
        El ahorro actual es el saldo que ya tienes. La aportación mensual se registra en Ahorros.
      </p>
      <button className="button button-primary">Guardar perfil</button>
      {message && <p role="status">{message}</p>}
    </form>
  );
}
