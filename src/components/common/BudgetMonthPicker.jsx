import { useRef } from 'react';
import { CalendarDays } from 'lucide-react';

export default function BudgetMonthPicker({ month, onChange, buttonStyle = false }) {
  const inputRef = useRef(null);

  if (buttonStyle) {
    const monthLabel = new Date(`${month}-01T12:00:00`).toLocaleDateString('es-MX', {
      month: 'long',
      year: 'numeric',
    });
    return (
      <div className="field month-picker month-picker-button">
        <span>Mes del presupuesto</span>
        <div className="month-picker-control">
          <button
            type="button"
            className="button month-picker-trigger"
            aria-label={`Cambiar mes del presupuesto: ${monthLabel}`}
            onClick={() => {
              const input = inputRef.current;
              if (input.showPicker) input.showPicker();
              else input.focus();
            }}
          >
            <CalendarDays size={17} aria-hidden="true" />
            {monthLabel}
          </button>
          <input
            ref={inputRef}
            className="month-picker-native"
            type="month"
            aria-label="Seleccionar mes del presupuesto"
            tabIndex={-1}
            value={month}
            onChange={(event) => onChange(event.target.value)}
          />
        </div>
      </div>
    );
  }

  return (
    <label className="field month-picker">
      <span>Mes del presupuesto</span>
      <input type="month" value={month} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}
