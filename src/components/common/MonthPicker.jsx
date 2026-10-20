export default function MonthPicker({ month, onChange }) {
  return (
    <label className="field month-picker">
      <span>Mes del presupuesto</span>
      <input type="month" value={month} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}
