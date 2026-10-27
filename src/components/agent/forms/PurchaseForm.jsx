import { useLayoutEffect, useRef, useState } from 'react';
import { CornerDownLeft } from 'lucide-react';
import MoneyInput from '../../common/MoneyInput';

/**
 * Agente: pregunta rápida de compra.
 * El usuario escribe qué quiere comprar y cuánto cuesta; el campo de texto es para que
 * cuente su situación. Plaris solo usa `name` y `priceCents`.
 */
export default function PurchaseForm({ busy, onSubmit }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [note, setNote] = useState('');
  const noteRef = useRef(null);

  const valid = name.trim() && price > 0;

  // Empieza con 1 fila y crece mientras escribes (como el chat de Gemini)
  useLayoutEffect(() => {
    const el = noteRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  }, [note]);

  function submit(event) {
    event.preventDefault();
    if (!valid) return;
    onSubmit({ name: name.trim(), priceCents: price, note: note.trim() });
  }

  // Enter envía; Shift + Enter agrega un salto de línea
  function handleKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      if (valid && !busy) event.currentTarget.form.requestSubmit();
    }
  }

  return (
    <form className="agent-form" onSubmit={submit}>
      <div className="agent-form-card">
        <div className="agent-field-grid agent-purchase-grid">
          <label className="agent-field">
            <span>¿Qué quieres comprar?</span>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ej. Audífonos inalámbricos"
              disabled={busy}
              required
            />
          </label>
          <label className="agent-field">
            <span>Precio (MXN)</span>
            <MoneyInput value={price} onChange={setPrice} disabled={busy} required />
          </label>
        </div>

        <div className="agent-field">
          <span id="purchase-note-label">Cuéntanos tu situación (opcional)</span>
          <div className="chat-input-container agent-note-bar">
            <textarea
              ref={noteRef}
              aria-labelledby="purchase-note-label"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ej. Lo vi en oferta, pero este mes tengo varios gastos y no sé si me conviene…"
              rows={1}
              disabled={busy}
            />
            <button
              type="submit"
              className="chat-send-button"
              disabled={busy || !valid}
              aria-label="Analizar compra"
            >
              <CornerDownLeft size={18} />
            </button>
          </div>
        </div>

        <p className="agent-form-hint">
          Escribe el producto y su precio; Plaris revisará cómo afecta tu economía.
        </p>
      </div>
    </form>
  );
}