import { useState } from 'react';
import { amountToCents, centsToInput } from '../../services/budgetService';

// Keep the typed text while editing so decimals and an empty field remain editable.
export default function MoneyInput({ value, onChange, ...props }) {
  const [draft, setDraft] = useState(null);

  function change(event) {
    const text = event.target.value;
    if (!/^\d*([.,]\d{0,2})?$/.test(text)) return;
    setDraft(text);
    onChange(amountToCents(text));
  }

  function focus(event) {
    setDraft(centsToInput(value));
    event.target.select();
  }

  return (
    <input
      {...props}
      type="text"
      inputMode="decimal"
      pattern="[0-9]+([.,][0-9]{1,2})?"
      placeholder="0.00"
      value={draft ?? centsToInput(value)}
      onFocus={focus}
      onChange={change}
      onBlur={() => setDraft(null)}
    />
  );
}
