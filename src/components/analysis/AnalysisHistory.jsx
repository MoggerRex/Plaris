import { ChevronDown, History, Trash2 } from 'lucide-react';
import { messagesForAnalysis } from '../../services/analysisHistory';
import { useMonthBudget } from '../../hooks/useMonthBudget';

const formatDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'fecha desconocida'
    : date.toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' });
};

/**
 * Lista desplegable de análisis guardados, pensada para el menú lateral.
 * - Botón principal: abre/cierra toda la lista.
 * - Cada análisis: abre su conversación o el análisis en el panel principal.
 * - Botón de basura: elimina el análisis del historial.
 */
export default function AnalysisHistory({ records = [], onSelect, onDelete }) {
  const items = Array.isArray(records) ? records : [];
  const { deleteAnalysis } = useMonthBudget();

  function handleDelete(event, record) {
    // Evita que el <details> se abra/cierre y que se seleccione el análisis.
    event.preventDefault();
    event.stopPropagation();

    if (onDelete) onDelete(record);
    else deleteAnalysis?.(record);
  }

  return (
    <details className="sidebar-history">
      <summary className="sidebar-action-button">
        <History size={18} />
        Ver historial ({items.length})
        <ChevronDown size={16} className="history-chevron" />
      </summary>

      <div className="sidebar-history-list">
        {items.map((record, recordIndex) => {
          const messages = messagesForAnalysis(record);
          const recordId = record.id || `${record.createdAt || 'record'}-${recordIndex}`;

          return (
            <details key={recordId} className="sidebar-history-item">
              <summary>
                <span
                  className="sidebar-history-label"
                  onClick={() => onSelect?.(record)}
                  title="Abrir este análisis en el panel principal"
                >
                  {record.month || 'Sin mes'} · {formatDate(record.createdAt)}
                </span>
                <button
                  type="button"
                  className="history-delete"
                  title="Eliminar este análisis"
                  aria-label={`Eliminar el análisis de ${record.month || 'este mes'}`}
                  onClick={(event) => handleDelete(event, record)}
                >
                  <Trash2 size={16} />
                </button>
              </summary>

              {messages.map((item, index) => (
                <div className="history-message" key={`${item.role}-${index}`}>
                  <strong>{item.role === 'user' ? 'Tú' : 'Plaris'}</strong>
                  <p>{item.content}</p>
                </div>
              ))}
              {!messages.length && (
                <p className="sidebar-empty">Este análisis no tiene mensajes guardados.</p>
              )}
            </details>
          );
        })}
        {!items.length && <p className="sidebar-empty">No hay análisis guardados todavía.</p>}
      </div>
    </details>
  );
}
