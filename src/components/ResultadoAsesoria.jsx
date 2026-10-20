import { formatearMoneda as $ } from '../utils/calculadoraFinanciera';

const COLORES = {
  primario: '#106057',
  secundario: '#34b8a9',
  fondo: '#fafafa',
  amarillo: '#ffd53f'
};

const COLOR_CATEGORIA = {
  excelente: '#2ecc71',
  viable: '#3498db',
  arriesgado: '#f39c12',
  imposible: '#e74c3c'
};

const tarjeta = {
  backgroundColor: '#ffffff',
  padding: '22px',
  borderRadius: '12px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  marginBottom: '20px'
};

function Barra({ porcentaje, color }) {
  const valor = Math.max(0, Math.min(100, Number(porcentaje) || 0));
  return (
    <div style={{ background: '#e8eeee', borderRadius: 6, height: 10, overflow: 'hidden' }}>
      <div style={{ width: `${valor}%`, background: color, height: '100%', transition: 'width 0.4s' }} />
    </div>
  );
}

function FondoCard({ titulo, subtitulo, actual, objetivo, porcentaje, color }) {
  return (
    <div style={{ flex: 1, minWidth: 240, border: `2px solid ${color}`, borderRadius: 10, padding: 16 }}>
      <div style={{ fontWeight: 700, color: COLORES.primario }}>{titulo}</div>
      <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: 10 }}>{subtitulo}</div>
      <div style={{ fontSize: '1.4rem', fontWeight: 700, color: COLORES.primario }}>{$(actual)}</div>
      <div style={{ fontSize: '0.85rem', color: '#555', margin: '2px 0 8px' }}>
        de {$(objetivo)} ({porcentaje}%)
      </div>
      <Barra porcentaje={porcentaje} color={color} />
    </div>
  );
}

function Seccion({ titulo, children, acento = COLORES.secundario }) {
  if (!children || (Array.isArray(children) && children.length === 0)) return null;
  return (
    <div style={{ borderLeft: `4px solid ${acento}`, paddingLeft: 14, marginBottom: 16 }}>
      <div style={{ fontWeight: 700, color: COLORES.primario, marginBottom: 4 }}>{titulo}</div>
      <div style={{ color: '#333', lineHeight: 1.55, fontSize: '0.95rem' }}>{children}</div>
    </div>
  );
}

const Lista = ({ items, ordenada }) => {
  const Tag = ordenada ? 'ol' : 'ul';
  const lista = Array.isArray(items) ? items.filter(Boolean) : [];
  if (!lista.length) return <span>No hay elementos adicionales disponibles.</span>;
  return (
    <Tag style={{ margin: 0, paddingLeft: 20 }}>
      {lista.map((x, i) => <li key={`${i}-${String(x).slice(0, 20)}`} style={{ marginBottom: 4 }}>{x}</li>)}
    </Tag>
  );
};

export default function ResultadoAsesoria({ resultado }) {
  // Errores de conexión o de formato
  const error = resultado?.error || resultado?.asesoria?.error;
  if (error) {
    return (
      <div style={{ ...tarjeta, borderTop: '5px solid #e74c3c' }}>
        <strong style={{ color: '#e74c3c' }}>No se pudo generar la asesoría</strong>
        <p style={{ marginBottom: 0 }}>{error}</p>
      </div>
    );
  }

  const { plan, clasificacionFlash: clf, asesoria: a } = resultado || {};
  if (!clf || !a || !a.calculos) {
    return (
      <div style={{ ...tarjeta, borderTop: '5px solid #e74c3c' }}>
        <strong style={{ color: '#e74c3c' }}>La respuesta está incompleta</strong>
        <p style={{ marginBottom: 0 }}>No se recibieron todos los datos para mostrar la asesoría. Intenta generarla de nuevo.</p>
      </div>
    );
  }
  const c = a.calculos;
  const esAvanzado = Array.isArray(a.razonamiento);
  const hayDeudas = Boolean(c.deudas);
  const fondos = c.fondos || {};
  const emergencia = fondos.emergencia || {};
  const fondoMeta = fondos.meta || {};
  const planSemanal = Array.isArray(c.planSemanal) ? c.planSemanal : [];
  const resumenMensual = Array.isArray(c.resumenMensual) ? c.resumenMensual : [];

  return (
    <div>
      {/* Clasificación */}
      <div style={{ ...tarjeta, borderTop: `5px solid ${COLORES.secundario}` }}>
        <div style={{ color: '#666', fontSize: '0.85rem', marginBottom: 8 }}>Plan {plan}</div>
        <span style={{
          display: 'inline-block', padding: '6px 14px', borderRadius: 20, fontWeight: 700,
          color: '#fff', backgroundColor: COLOR_CATEGORIA[clf.categoria] ?? '#999'
        }}>
          {clf.categoria.toUpperCase()}
        </span>
        {Array.isArray(clf.detalleEvaluacion) ? (
          <div style={{ display: 'grid', gap: 14, marginTop: 18 }}>
            {clf.detalleEvaluacion.map(({ titulo, texto }) => (
              <section key={titulo} style={{ borderLeft: `3px solid ${COLORES.secundario}`, paddingLeft: 12 }}>
                <h4 style={{ margin: '0 0 4px', color: COLORES.primario }}>{titulo}</h4>
                <p style={{ margin: 0, color: '#333', lineHeight: 1.55, textAlign: 'left' }}>{texto}</p>
              </section>
            ))}
          </div>
        ) : (
          <p style={{ margin: '12px 0 0', color: '#333', lineHeight: 1.55 }}>{clf.mensajeEvaluacion}</p>
        )}
      </div>

      {/* Los dos fondos */}
      <div style={tarjeta}>
        <h3 style={{ marginTop: 0, color: COLORES.primario }}>Tus dos fondos de ahorro</h3>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <FondoCard
            titulo="🛡️ Fondo de emergencia"
            subtitulo={`Meta: ${emergencia.meses ?? 3} meses de gastos fijos · cubre ${emergencia.mesesCubiertos ?? 0} meses`}
            actual={emergencia.actual ?? 0}
            objetivo={emergencia.objetivo ?? 0}
            porcentaje={emergencia.porcentaje ?? 0}
            color={COLORES.primario}
          />
          <FondoCard
            titulo={`🎯 Fondo de la meta`}
            subtitulo="Dinero apartado solo para tu compra"
            actual={fondoMeta.actual ?? 0}
            objetivo={fondoMeta.objetivo ?? 0}
            porcentaje={fondoMeta.porcentaje ?? 0}
            color={COLORES.secundario}
          />
        </div>

        {c.flujoLibreSemanal > 0 && (
          <p style={{ marginBottom: 0, marginTop: 16, fontSize: '0.9rem', color: '#444' }}>
            De tus <strong>{$(c.flujoLibreSemanal)}</strong> libres por semana:{' '}
            <strong>{c.reparto.meta}%</strong> va a la meta
            {c.reparto.emergencia > 0 && <>, <strong>{c.reparto.emergencia}%</strong> a emergencia</>}
            {c.reparto.deuda > 0 && <>, <strong>{c.reparto.deuda}%</strong> a deudas</>}.
          </p>
        )}
      </div>

      {/* Análisis de la IA */}
      <div style={tarjeta}>
        <h3 style={{ marginTop: 0, color: COLORES.primario }}>Análisis del asesor</h3>

        {esAvanzado ? (
          <>
            <Seccion titulo="Cómo lo razoné" acento={COLORES.amarillo}>
              <Lista items={a.razonamiento} ordenada />
            </Seccion>
            <Seccion titulo="Llamado de atención">{a.llamadoDeAtencion}</Seccion>
            <Seccion titulo="Riesgo: ahorro y deudas">{a.analisisRiesgoAhorroYDeuda}</Seccion>
            <Seccion titulo="Estrategia recomendada"><Lista items={a.estrategiaRecomendada} ordenada /></Seccion>
            <Seccion titulo="Veredicto" acento={COLORES.primario}>{a.conclusionYVeredicto}</Seccion>
          </>
        ) : (
          <>
            <Seccion titulo="Diagnóstico">{a.diagnostico}</Seccion>
            <Seccion titulo="Sobre tu fondo de emergencia">{a.analisisFondoEmergencia}</Seccion>
            <Seccion titulo="Sobre tu fondo de la meta">{a.analisisFondoMeta}</Seccion>
            <Seccion titulo="Plan sugerido" acento={COLORES.primario}>{a.planSugerido}</Seccion>
            <Seccion titulo="Puntos clave" acento={COLORES.amarillo}><Lista items={a.puntosClave} /></Seccion>
          </>
        )}
      </div>

      {/* Deudas (solo avanzado) */}
      {hayDeudas && (
        <div style={{ ...tarjeta, borderLeft: `5px solid ${COLORES.amarillo}` }}>
          <h3 style={{ marginTop: 0, color: COLORES.primario }}>Deudas</h3>
          <p style={{ margin: 0, fontSize: '0.95rem' }}>
            Debes <strong>{$(c.deudas.total)}</strong> y solo en intereses pagas ≈{' '}
            <strong>{$(c.deudas.interesMensualEstimado)}</strong> al mes.{' '}
            {c.deudas.semanasParaLiquidar !== null
              ? <>Con este plan las liquidas en la <strong>semana {c.deudas.semanasParaLiquidar}</strong>.</>
              : <>Al llegar a tu meta aún quedarían <strong>{$(c.deudas.saldoAlFinal)}</strong>.</>}
          </p>
        </div>
      )}

      {/* Plan semana a semana */}
      <div style={tarjeta}>
        <h3 style={{ marginTop: 0, color: COLORES.primario }}>Tu plan semana a semana</h3>
        {planSemanal.length === 0 ? (
          <p style={{ margin: 0 }}>
            {c.alcanzable
              ? 'Ya tienes el dinero de la meta, no necesitas depositar más.'
              : 'Con tus ingresos y gastos actuales no hay flujo libre para depositar. Primero hay que reducir gastos.'}
          </p>
        ) : (
          <div style={{ maxHeight: 380, overflow: 'auto', border: '1px solid #e3e8e8', borderRadius: 8 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: COLORES.primario, color: '#fff', position: 'sticky', top: 0 }}>
                  <th style={th}>Semana</th>
                  <th style={th}>A la meta</th>
                  <th style={th}>A emergencia</th>
                  {hayDeudas && <th style={th}>A deudas</th>}
                  <th style={{ ...th, minWidth: 150 }}>Fondo de la meta</th>
                </tr>
              </thead>
              <tbody>
                {planSemanal.map((f) => (
                  <tr key={f.semana} style={{ borderTop: '1px solid #eef2f2' }}>
                    <td style={td}>{f.semana}</td>
                    <td style={td}><strong>{$(f.aporteMeta)}</strong></td>
                    <td style={td}>{$(f.aporteEmergencia)}</td>
                    {hayDeudas && <td style={td}>{$(f.aporteDeuda)}</td>}
                    <td style={td}>
                      <div style={{ fontSize: '0.8rem', marginBottom: 3 }}>{$(f.fondoMeta)} · {f.porcentajeMeta}%</div>
                      <Barra porcentaje={f.porcentajeMeta} color={COLORES.secundario} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Resumen mensual (avanzado) */}
      {esAvanzado && resumenMensual.length > 0 && (
        <div style={tarjeta}>
          <h3 style={{ marginTop: 0, color: COLORES.primario }}>Resumen por mes</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: COLORES.fondo, color: COLORES.primario }}>
                  <th style={th2}>Periodo</th>
                  <th style={th2}>A la meta</th>
                  <th style={th2}>A emergencia</th>
                  {hayDeudas && <th style={th2}>A deudas</th>}
                  {hayDeudas && <th style={th2}>Deuda restante</th>}
                </tr>
              </thead>
              <tbody>
                {resumenMensual.map((r) => (
                  <tr key={r.periodo} style={{ borderTop: '1px solid #eef2f2' }}>
                    <td style={td}>{r.periodo} <span style={{ color: '#888' }}>(sem. {r.semanas})</span></td>
                    <td style={td}>{$(r.aporteMeta)}</td>
                    <td style={td}>{$(r.aporteEmergencia)}</td>
                    {hayDeudas && <td style={td}>{$(r.aporteDeuda)}</td>}
                    {hayDeudas && <td style={td}>{$(r.deudaRestante)}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

const th = { padding: '10px 12px', textAlign: 'left', fontWeight: 600 };
const th2 = { padding: '10px 12px', textAlign: 'left', fontWeight: 600 };
const td = { padding: '8px 12px', verticalAlign: 'middle' };