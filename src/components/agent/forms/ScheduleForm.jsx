import { useState } from 'react';
import { CornerDownLeft } from 'lucide-react';
import MoneyInput from '../../common/MoneyInput';
import { entryTypes } from '../../../config/agentForms';

/** Agendar: registrar un gasto o un ingreso (monto + categoría). */
export default function ScheduleForm({ busy, onSubmit }) {
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState(0);
  const [category, setCategory] = useState('');
  const [round, setRound] = useState(0); // remonta el input de monto tras enviar

  const current = entryTypes.find((entry) => entry.id === type);
  const Icon = current.icon;
  const valid = amount > 0 && category;

  function changeType(id) {
    setType(id);
    setCategory('');
  }

  function submit(event) {
    event.preventDefault();
    if (!valid) return;
    onSubmit({ type, amountCents: amount, category });
    setAmount(0);
    setRound((value) => value + 1);
  }

  return (
    <form className="agent-form" onSubmit={submit}>
      <div className="agent-subtabs">
        <div className="agent-segmented" role="group" aria-label="Tipo de registro">
          {entryTypes.map((entry) => (
            <button
              key={entry.id}
              type="button"
              aria-pressed={entry.id === type}
              onClick={() => changeType(entry.id)}
            >
              <entry.icon size={16} /> {entry.label}
            </button>
          ))}
        </div>
      </div>

      <div className="chat-input-container">
        <Icon size={18} className="chat-leading-icon" aria-hidden="true" />
        <span className="chat-currency" aria-hidden="true">
          $
        </span>
        <MoneyInput
          key={round}
          className="chat-money-input"
          aria-label={'Monto del ' + (type === 'expense' ? 'gasto' : 'ingreso')}
          value={amount}
          onChange={setAmount}
          disabled={busy}
        />
        <span className="chat-divider" aria-hidden="true" />
        <select
          className="chat-field-select"
          aria-label="Categoría"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          disabled={busy}
        >
          <option value="" disabled>
            Categoría
          </option>
          {current.categories.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        <div className="chat-controls-inline">
          <button
            type="submit"
            className="chat-send-button"
            disabled={busy || !valid}
            aria-label={current.label}
          >
            <CornerDownLeft size={18} />
          </button>
        </div>
      </div>
    </form>
  );
}