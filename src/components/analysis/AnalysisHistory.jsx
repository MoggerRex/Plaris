export default function AnalysisHistory({ records }) {
  return (
    <details className="panel analysis-history">
      <summary>Historial de análisis guardados ({records.length})</summary>
      {records.map((record) => (
        <details key={record.id}>
          <summary>
            {record.month} · {new Date(record.createdAt).toLocaleString('es-MX')}
          </summary>
          {record.messages.map((item, index) => (
            <div className="history-message" key={index}>
              <strong>{item.role === 'user' ? 'Tú' : 'Plaris'}</strong>
              <p>{item.content}</p>
            </div>
          ))}
        </details>
      ))}
      {!records.length && <p>No hay análisis guardados todavía.</p>}
    </details>
  );
}
