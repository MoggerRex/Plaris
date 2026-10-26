import { ChevronDown, History } from 'lucide-react';

const formatDate = (value) =>
  new Date(value).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' });

/**
 * Lista desplegable de análisis guardados, pensada para el menú lateral.
 * - Botón principal: abre/cierra toda la lista.
 * - Cada análisis: abre/cierra su conversación.
 */
export default function AnalysisHistory({ records = [] }) {
  return (
    <details className="sidebar-history">
      <summary className="sidebar-action-button">
        <History size={18} />
        Ver historial ({records.length})
        <ChevronDown size={16} className="history-chevron" />
      </summary>

      <div className="sidebar-history-list">
        {records.map((record) => (
          <details key={record.id} className="sidebar-history-item">
            <summary>
              {record.month} · {formatDate(record.createdAt)}
            </summary>
            {record.messages.map((item, index) => (
              <div className="history-message" key={index}>
                <strong>{item.role === 'user' ? 'Tú' : 'Plaris'}</strong>
                <p>{item.content}</p>
              </div>
            ))}
          </details>
        ))}
        {!records.length && <p className="sidebar-empty">No hay análisis guardados todavía.</p>}
      </div>
    </details>
  );
}
