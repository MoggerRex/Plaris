import { useEffect, useRef, useState } from 'react';
import { Upload, FileText, CheckCircle2, LoaderCircle, X } from 'lucide-react';

const stages = ['Preparando vista previa', 'Organizando el resumen', 'Presentando resultados'];
const allowed = /\.(pdf|csv|xlsx?)$/i;
const maxSize = 10 * 1024 * 1024;

export default function StatementAnalysisDemo() {
  const [file, setFile] = useState(null);
  const [stage, setStage] = useState(-1);
  const [error, setError] = useState('');
  const inputRef = useRef(null);
  const timerRef = useRef(null);
  const loading = stage >= 0 && stage < stages.length;
  const complete = stage === stages.length;

  useEffect(() => () => clearInterval(timerRef.current), []);

  function selectFile(candidate) {
    clearInterval(timerRef.current);
    setStage(-1);
    setFile(null);
    setError('');
    if (!candidate) return;
    if (!allowed.test(candidate.name)) {
      setError('Selecciona un archivo PDF, CSV, XLS o XLSX.');
      return;
    }
    if (candidate.size === 0 || candidate.size > maxSize) {
      setError('El archivo debe tener contenido y pesar como máximo 10 MB.');
      return;
    }
    // Only keep metadata: the demo never reads, uploads or stores the statement.
    setFile({ name: candidate.name, size: candidate.size });
  }

  function reset() {
    clearInterval(timerRef.current);
    setFile(null);
    setStage(-1);
    setError('');
    if (inputRef.current) inputRef.current.value = '';
  }

  function analyze() {
    if (!file || loading) return;
    clearInterval(timerRef.current);
    setStage(0);
    let next = 0;
    timerRef.current = setInterval(() => {
      next += 1;
      setStage(next);
      if (next === stages.length) clearInterval(timerRef.current);
    }, 1100);
  }

  return (
    <section className="statement-demo panel" aria-labelledby="statement-title">
      <div className="statement-heading">
        <div>
          <span className="eyebrow">Estado de cuenta</span>
          <h2 id="statement-title">Explora tu estado de cuenta</h2>
          <p>
            Reúne tus movimientos y descubre qué información puedes obtener de tu estado de cuenta.
          </p>
        </div>
      </div>
      <p className="statement-notice">
        Vista previa con datos de ejemplo: el archivo todavía no se procesa ni se envía a Llama.
      </p>
      <label
        className={'statement-upload' + (loading ? ' is-busy' : '')}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          if (!loading) selectFile(event.dataTransfer.files[0]);
        }}
      >
        <Upload size={28} aria-hidden="true" />
        <strong>Selecciona o arrastra tu estado de cuenta</strong>
        <span>PDF, CSV o Excel · Hasta 10 MB</span>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.csv,.xls,.xlsx"
          disabled={loading}
          aria-label="Seleccionar estado de cuenta"
          onChange={(event) => {
            selectFile(event.target.files?.[0]);
            event.target.value = '';
          }}
        />
      </label>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {file && (
        <div className="statement-file">
          <FileText size={22} aria-hidden="true" />
          <div>
            <strong>{file.name}</strong>
            <span>
              {(file.size / 1024 / 1024).toLocaleString('es-MX', { maximumFractionDigits: 2 })} MB ·
              Archivo seleccionado
            </span>
          </div>
          <button
            type="button"
            className="icon-button"
            onClick={reset}
            aria-label={loading ? 'Cancelar y quitar archivo' : 'Quitar archivo'}
          >
            <X size={18} />
          </button>
        </div>
      )}
      <div className="form-buttons">
        <button
          type="button"
          className="button button-primary"
          disabled={!file || loading}
          onClick={analyze}
        >
          {loading ? (
            <LoaderCircle className="statement-spinner" size={18} aria-hidden="true" />
          ) : (
            <FileText size={18} aria-hidden="true" />
          )}
          {loading
            ? 'Preparando vista previa…'
            : complete
              ? 'Volver a ver el resumen'
              : 'Ver vista previa del análisis'}
        </button>
      </div>
      <div role="status" aria-live="polite" aria-atomic="true">
        {loading && (
          <p className="statement-progress">
            {stages[stage]}… Paso {stage + 1} de {stages.length}.
          </p>
        )}
        {complete && (
          <p className="statement-progress">
            <CheckCircle2 size={18} aria-hidden="true" /> Tu vista previa está lista.
          </p>
        )}
      </div>
      {complete && (
        <article className="statement-result" aria-labelledby="statement-result-title">
          <span className="statement-demo-badge">Vista previa</span>
          <h3 id="statement-result-title">Resumen de ejemplo</h3>
          <p>
            Este contenido es fijo y no se ha calculado a partir de <strong>{file.name}</strong>.
          </p>
          <h4>Hábitos que podrías revisar</h4>
          <ul>
            <li>
              <strong>Las compras pequeñas se acumulan.</strong> Noto que durante este mes gastaste
              $400 en chilaquiles. Si es un gusto frecuente, podrías darle un monto fijo en tu
              presupuesto para disfrutarlo sin desplazar otros gastos.
            </li>
            <li>
              <strong>Las entregas a domicilio también pesan.</strong> En este ejemplo hiciste 6
              pedidos por $1,200 en total. Reemplazar uno o dos por comida preparada en casa podría
              dejarte más margen al final del mes.
            </li>
            <li>
              <strong>Conviene revisar los cargos recurrentes.</strong> Aparecen 3 suscripciones que
              suman $450 al mes. Revisa cuáles usas; cancelar una que ya no aprovechas liberaría
              dinero cada mes.
            </li>
            <li>
              <strong>El ahorro quedó por debajo de tu plan.</strong> Planeaste ahorrar $2,000 y
              registraste $1,200: faltan $800. Podrías revisar primero los pedidos y las
              suscripciones para decidir qué ajustar sin recortar tus gastos esenciales.
            </li>
          </ul>
          <p className="statement-notice">
            Tu presupuesto y tus movimientos se mantienen sin cambios.
          </p>
        </article>
      )}
    </section>
  );
}
