/**
 * Calculadora financiera de Plaris.
 *
 * REGLA DE ORO: toda la matemática y las decisiones (clasificación, plazos,
 * reparto entre fondos, tabla semana a semana) se calculan AQUÍ, en JS.
 * La IA solo redacta la explicación a partir de estos resultados.
 */

const SEMANAS_POR_MES = 4.33;
const MAX_SEMANAS = 104; // 2 años de simulación como límite de seguridad
const PCT_EMERGENCIA = 0.3; // % del flujo (después de deudas) que va al fondo de emergencia mientras esté incompleto

// ---------- Utilidades ----------

export function formatearMoneda(n) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0
  }).format(Math.round(n ?? 0));
}

/** "28%" -> 28 | "28,5 %" -> 28.5 | 24 -> 24 */
export function parsearTasa(valor) {
  const n = parseFloat(String(valor ?? '').replace(',', '.').replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

const suma = (arr, fn) => arr.reduce((acc, x) => acc + fn(x), 0);

// ---------- Separación del ahorro actual en dos fondos ----------

/**
 * Divide el ahorro actual en:
 *  - Fondo de emergencia
 *  - Fondo de la meta
 *
 * Si el usuario indica `ahorroParaMeta`, se respeta.
 * Si no, se llena primero la emergencia y solo el excedente pasa a la meta.
 */
function repartirAhorroActual(datos, objetivoEmergencia) {
  const total = Math.max(0, Number(datos.ahorroActual) || 0);

  if (typeof datos.ahorroParaMeta === 'number' && !Number.isNaN(datos.ahorroParaMeta)) {
    const paraMeta = Math.min(Math.max(0, datos.ahorroParaMeta), total);
    return { emergencia: total - paraMeta, meta: paraMeta };
  }

  const emergencia = Math.min(total, objetivoEmergencia);
  return { emergencia, meta: total - emergencia };
}

// ---------- Clasificación determinista ----------

function clasificar({ alcanzable, diasParaMeta, plazoDias, maxPosible, costo }) {
  // Imposible: ni usando el 100% del flujo libre se llega a la meta en el plazo
  if (!alcanzable || maxPosible < costo) return 'imposible';
  if (diasParaMeta <= plazoDias * 0.8) return 'excelente';
  if (diasParaMeta <= plazoDias) return 'viable';
  // Se puede, pero solo sacrificando el fondo de emergencia / pago de deudas
  return 'arriesgado';
}

// ---------- Función principal ----------

export function calcularMetricasFinancieras(datos, meta, deudas = []) {
  const ingresos = Number(datos.ingresosMensuales) || 0;
  const gastosFijos = Number(datos.gastosFijos) || 0;
  const gastosVariables = Number(datos.gastosVariables) || 0;
  const costo = Number(meta.costo) || 0;
  const plazoDias = Number(meta.plazoDias) || 0;
  const mesesEmergencia = datos.mesesFondoEmergencia ?? 3;

  // 1. Flujo libre
  const flujoLibreMensual = ingresos - gastosFijos - gastosVariables;
  const flujoSemanal = Math.max(0, flujoLibreMensual / SEMANAS_POR_MES);

  // 2. Fondos iniciales
  const objetivoEmergencia = gastosFijos * mesesEmergencia;
  const inicial = repartirAhorroActual(datos, objetivoEmergencia);

  // 3. Deudas (estrategia avalancha: primero la de mayor interés)
  const saldos = (deudas || [])
    .filter((d) => Number(d.monto) > 0)
    .map((d) => ({ concepto: d.concepto, saldo: Number(d.monto), tasa: parsearTasa(d.interesAnual) }))
    .sort((a, b) => b.tasa - a.tasa);

  const deudaInicial = suma(saldos, (d) => d.saldo);
  const tasaMax = saldos[0]?.tasa ?? 0;
  const pctDeuda = saldos.length === 0 ? 0 : tasaMax >= 24 ? 0.5 : tasaMax >= 12 ? 0.35 : 0.2;
  const interesMensualEstimado = suma(saldos, (d) => (d.saldo * d.tasa) / 100 / 12);

  // 4. Simulación semana a semana
  let fondoE = inicial.emergencia;
  let fondoM = inicial.meta;
  let semana = 0;
  let semanaDeudaLiquidada = deudaInicial === 0 ? 0 : null;
  const filas = [];

  while (fondoM < costo && semana < MAX_SEMANAS && flujoSemanal > 0) {
    semana++;

    // Los intereses de las deudas corren cada semana
    saldos.forEach((d) => { d.saldo += (d.saldo * d.tasa) / 100 / 52; });
    const deudaTotal = suma(saldos, (d) => d.saldo);

    // a) Deuda
    const aporteDeuda = Math.min(flujoSemanal * pctDeuda, deudaTotal);
    let pago = aporteDeuda;
    for (const d of saldos) {
      const p = Math.min(pago, d.saldo);
      d.saldo -= p;
      pago -= p;
    }

    // b) Emergencia (solo mientras no esté completo)
    const restante = flujoSemanal - aporteDeuda;
    const aporteE = fondoE < objetivoEmergencia
      ? Math.min(restante * PCT_EMERGENCIA, objetivoEmergencia - fondoE)
      : 0;

    // c) Meta (lo que queda, sin pasarse del costo)
    const aporteM = Math.min(restante - aporteE, costo - fondoM);

    fondoE += aporteE;
    fondoM += aporteM;

    const deudaRestante = suma(saldos, (d) => d.saldo);
    if (semanaDeudaLiquidada === null && deudaRestante < 0.5) semanaDeudaLiquidada = semana;

    filas.push({
      semana,
      aporteMeta: Math.round(aporteM),
      aporteEmergencia: Math.round(aporteE),
      aporteDeuda: Math.round(aporteDeuda),
      fondoMeta: Math.round(fondoM),
      fondoEmergencia: Math.round(fondoE),
      faltanteMeta: Math.max(0, Math.round(costo - fondoM)),
      porcentajeMeta: costo > 0 ? Math.min(100, Math.round((fondoM / costo) * 100)) : 100,
      deudaRestante: Math.round(deudaRestante)
    });
  }

  // 5. Resultados de plazo
  const alcanzable = fondoM >= costo;
  const semanasParaMeta = alcanzable ? semana : null;
  const diasParaMeta = alcanzable ? semana * 7 : null;

  const plazoSemanas = plazoDias / 7;
  const faltanteInicial = Math.max(0, costo - inicial.meta);
  const aporteSemanalNecesario = plazoSemanas > 0 ? faltanteInicial / plazoSemanas : faltanteInicial;
  const aporteSemanalInicial = filas[0]
    ? { meta: filas[0].aporteMeta, emergencia: filas[0].aporteEmergencia, deuda: filas[0].aporteDeuda }
    : { meta: 0, emergencia: 0, deuda: 0 };
  const brechaSemanal = Math.max(0, Math.round(aporteSemanalNecesario - aporteSemanalInicial.meta));

  const maxPosible = inicial.meta + flujoSemanal * plazoSemanas; // usando el 100% del flujo libre
  const categoria = clasificar({
    alcanzable: alcanzable || faltanteInicial === 0,
    diasParaMeta: diasParaMeta ?? 0,
    plazoDias,
    maxPosible,
    costo
  });

  // 6. Reparto en % del flujo semanal (para mostrar "qué porcentaje va a dónde")
  const pct = (x) => (flujoSemanal > 0 ? Math.round((x / flujoSemanal) * 100) : 0);
  const reparto = {
    emergencia: pct(aporteSemanalInicial.emergencia),
    deuda: pct(aporteSemanalInicial.deuda),
    meta: pct(aporteSemanalInicial.meta)
  };

  // 7. Resumen mensual (bloques de 4 semanas)
  const resumenMensual = [];
  for (let i = 0; i < filas.length; i += 4) {
    const bloque = filas.slice(i, i + 4);
    const ultima = bloque[bloque.length - 1];
    resumenMensual.push({
      periodo: `Mes ${resumenMensual.length + 1}`,
      semanas: `${bloque[0].semana}-${ultima.semana}`,
      aporteMeta: suma(bloque, (f) => f.aporteMeta),
      aporteEmergencia: suma(bloque, (f) => f.aporteEmergencia),
      aporteDeuda: suma(bloque, (f) => f.aporteDeuda),
      fondoMetaAlCierre: ultima.fondoMeta,
      fondoEmergenciaAlCierre: ultima.fondoEmergencia,
      deudaRestante: ultima.deudaRestante
    });
  }

  return {
    categoria,
    flujoLibreMensual: Math.round(flujoLibreMensual),
    flujoLibreSemanal: Math.round(flujoSemanal),

    fondos: {
      emergencia: {
        meses: mesesEmergencia,
        objetivo: Math.round(objetivoEmergencia),
        actual: Math.round(inicial.emergencia),
        faltante: Math.max(0, Math.round(objetivoEmergencia - inicial.emergencia)),
        porcentaje: objetivoEmergencia > 0 ? Math.min(100, Math.round((inicial.emergencia / objetivoEmergencia) * 100)) : 100,
        mesesCubiertos: gastosFijos > 0 ? Number((inicial.emergencia / gastosFijos).toFixed(1)) : 0
      },
      meta: {
        objetivo: costo,
        actual: Math.round(inicial.meta),
        faltante: Math.round(faltanteInicial),
        porcentaje: costo > 0 ? Math.min(100, Math.round((inicial.meta / costo) * 100)) : 100
      }
    },

    reparto,
    aporteSemanalInicial,
    aporteSemanalNecesario: Math.round(aporteSemanalNecesario),
    brechaSemanal,
    maxPosibleEnPlazo: Math.round(maxPosible),

    alcanzable,
    semanasParaMeta,
    diasParaMeta,
    cumplePlazoSolicitado: alcanzable && diasParaMeta <= plazoDias,

    deudas: saldos.length === 0 && deudaInicial === 0
      ? null
      : {
          total: Math.round(deudaInicial),
          tasaMax,
          interesMensualEstimado: Math.round(interesMensualEstimado),
          semanasParaLiquidar: semanaDeudaLiquidada,
          saldoAlFinal: filas.length ? filas[filas.length - 1].deudaRestante : Math.round(deudaInicial),
          detalle: (deudas || []).map((d) => ({
            concepto: d.concepto,
            monto: Number(d.monto) || 0,
            tasa: parsearTasa(d.interesAnual)
          }))
        },

    planSemanal: filas,
    resumenMensual,

    // Compatibilidad con la versión anterior
    datosGraficaCalculados: filas.map((f) => ({
      etiqueta: `Semana ${f.semana}`,
      ahorroAcumulado: f.fondoMeta
    }))
  };
}