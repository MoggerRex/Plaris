import { ChevronDown, History } from 'lucide-react';
import { messagesForAnalysis } from '../../services/analysisHistory';

const formatDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'fecha desconocida'
    : date.toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' });
};

/**
 * Lista desplegable de análisis guardados, pensada para el menú lateral.
 * - Botón principal: abre/cierra toda la lista.
 * - Cada análisis: abre/cierra su conversación.
 */
export default function AnalysisHistory({ records = [] }) {
  const items = Array.isArray(records) ? records : [];

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
          return (
            <details
              key={record.id || `${record.createdAt || 'record'}-${recordIndex}`}
              className="sidebar-history-item"
            >
              <summary>
                {record.month || 'Sin mes'} · {formatDate(record.createdAt)}
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
