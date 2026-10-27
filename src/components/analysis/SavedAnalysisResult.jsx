import AdviceResult from '../agent/AdviceResult';
import { messagesForAnalysis } from '../../services/analysisHistory';

function monthLabel(month) {
  if (!/^\d{4}-\d{2}$/.test(month || '')) return month || 'el mes';
  return new Date(`${month}-01T12:00:00`).toLocaleDateString('es-MX', {
    month: 'long',
    year: 'numeric',
  });
}

export default function SavedAnalysisResult({ record, result }) {
  if (result) return <AdviceResult result={result} autoSave={false} fromHistory />;

  const messages = messagesForAnalysis(record);

  return (
    <article className="advisor-answer saved-analysis" role="status">
      <span className="eyebrow">Análisis guardado · {monthLabel(record.month)}</span>
      <h3>
        {record.type === 'purchase_advice' ? 'Análisis de tu compra' : 'Conversación guardada'}
      </h3>
      {messages.length ? (
        messages.map((item, index) => (
          <div className="saved-analysis-message" key={`${item.role}-${index}`}>
            <strong>{item.role === 'user' ? 'Tú' : 'Plaris'}</strong>
            <p>{item.content}</p>
          </div>
        ))
      ) : (
        <p className="sidebar-empty">Este análisis no tiene mensajes guardados.</p>
      )}
    </article>
  );
}
