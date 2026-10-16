/**
 * Calculadora financiera de Plaris.
 */

const SEMANAS_POR_MES = 4.33;
const PCT_EMERGENCIA_DEFAULT = 0.3;
const redondearCentavos = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

export function formatearMoneda(n) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Number(n) || 0);
}

export function parsearTasa(valor) {
  const n = parseFloat(String(valor ?? '').replace(',', '.').replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

const suma = (arr, fn) => arr.reduce((acc, x) => acc + fn(x), 0);

function repartirAhorroActual(datos, objetivoEmergencia) {
  const total = redondearCentavos(Math.max(0, Number(datos.ahorroActual) || 0));

  if (datos.distribucionPersonalizada) {
    const { meta = 0, emergencia = 0 } = datos.distribucionPersonalizada;
    return {
      emergencia: redondearCentavos(Math.min(emergencia, total)),
      meta: redondearCentavos(Math.min(meta, total))
    };
  }

  const emergencia = redondearCentavos(Math.min(total, objetivoEmergencia));
  return { emergencia, meta: redondearCentavos(total - emergencia) };
}

function clasificar({ alcanzable, diasParaMeta, plazoDias, maxPosible, costo, faltanteInicial }) {
  if (faltanteInicial <= 0) return 'excelente';
  if (!alcanzable || maxPosible < costo) return 'imposible';
  if (diasParaMeta <= plazoDias * 0.8) return 'excelente';
  if (diasParaMeta <= plazoDias) return 'viable';
  return 'arriesgado';
}

export function calcularMetricasFinancieras(datos, meta, deudas = []) {
  const ingresos = redondearCentavos(Number(datos.ingresosMensuales) || 0);
  const gastosFijos = redondearCentavos(Number(datos.gastosFijos) || 0);
  const gastosVariables = redondearCentavos(Number(datos.gastosVariables) || 0);
  const costo = redondearCentavos(Number(meta.costo) || 0);
  const plazoDias = Number(meta.plazoDias) || 0;
  const mesesEmergencia = datos.mesesFondoEmergencia ?? 3;

  const flujoLibreMensual = redondearCentavos(ingresos - gastosFijos - gastosVariables);
  const flujoSemanal = Math.max(0, redondearCentavos(flujoLibreMensual / SEMANAS_POR_MES));

  const objetivoEmergencia = redondearCentavos(gastosFijos * mesesEmergencia);
  const inicial = repartirAhorroActual(datos, objetivoEmergencia);

  const saldos = (deudas || [])
    .filter((d) => Number(d.monto) > 0)
    .map((d) => ({ concepto: d.concepto, saldo: redondearCentavos(Number(d.monto)), tasa: parsearTasa(d.interesAnual) }))
    .sort((a, b) => b.tasa - a.tasa);

  const deudaInicial = suma(saldos, (d) => d.saldo);
  const tasaMax = saldos[0]?.tasa ?? 0;

  // Determinar porcentajes de reparto
  let pctDeuda = saldos.length === 0 ? 0 : tasaMax >= 24 ? 0.5 : tasaMax >= 12 ? 0.35 : 0.2;
  let pctEmergenciaCustom = PCT_EMERGENCIA_DEFAULT;

  if (datos.distribucionPersonalizada && flujoLibreMensual > 0) {
    const dist = datos.distribucionPersonalizada;
    if (dist.deudas > 0) pctDeuda = Math.min(1, dist.deudas / flujoLibreMensual);
    if (dist.emergencia > 0) pctEmergenciaCustom = Math.min(1, dist.emergencia / flujoLibreMensual);
  }

  const interesMensualEstimado = redondearCentavos(suma(saldos, (d) => (d.saldo * d.tasa) / 100 / 12));

  let fondoE = inicial.emergencia;
  let fondoM = inicial.meta;
  let semana = 0;
  let semanaDeudaLiquidada = deudaInicial === 0 ? 0 : null;
  let sinProgreso = false;
  const filas = [];
  const faltanteInicial = redondearCentavos(Math.max(0, costo - inicial.meta));

  while (fondoM < costo && flujoSemanal > 0) {
    semana++;

    const deudaAntesSemana = suma(saldos, (d) => d.saldo);
    saldos.forEach((d) => { d.saldo = redondearCentavos(d.saldo + (d.saldo * d.tasa) / 100 / 52); });
    const deudaTotal = suma(saldos, (d) => d.saldo);

    const aporteDeuda = redondearCentavos(Math.min(flujoSemanal * pctDeuda, deudaTotal));
    let pago = aporteDeuda;
    for (const d of saldos) {
      const p = redondearCentavos(Math.min(pago, d.saldo));
      d.saldo = redondearCentavos(d.saldo - p);
      pago = redondearCentavos(pago - p);
    }

    const restante = redondearCentavos(flujoSemanal - aporteDeuda);
    const aporteE = fondoE < objetivoEmergencia
      ? redondearCentavos(Math.min(restante * pctEmergenciaCustom, objetivoEmergencia - fondoE))
      : 0;

    const aporteM = redondearCentavos(Math.min(restante - aporteE, costo - fondoM));

    fondoE = redondearCentavos(fondoE + aporteE);
    fondoM = redondearCentavos(fondoM + aporteM);

    const deudaRestante = redondearCentavos(suma(saldos, (d) => d.saldo));
    if (semanaDeudaLiquidada === null && deudaRestante < 0.01) semanaDeudaLiquidada = semana;
    sinProgreso = aporteM === 0 && aporteE === 0 && deudaRestante >= deudaAntesSemana;

    filas.push({
      semana,
      aporteMeta: aporteM,
      aporteEmergencia: aporteE,
      aporteDeuda,
      fondoMeta: fondoM,
      fondoEmergencia: fondoE,
      faltanteMeta: redondearCentavos(Math.max(0, costo - fondoM)),
      porcentajeMeta: costo > 0 ? Math.min(100, Math.round((fondoM / costo) * 100)) : 100,
      deudaRestante
    });

    if (sinProgreso) break;
  }

  const alcanzable = fondoM >= costo;
  const semanasParaMeta = alcanzable ? semana : null;
  const diasParaMeta = alcanzable ? semana * 7 : null;

  const plazoSemanas = plazoDias / 7;
  const aporteSemanalNecesario = redondearCentavos(plazoSemanas > 0 ? faltanteInicial / plazoSemanas : faltanteInicial);
  const aporteSemanalInicial = filas[0]
    ? { meta: filas[0].aporteMeta, emergencia: filas[0].aporteEmergencia, deuda: filas[0].aporteDeuda }
    : { meta: 0, emergencia: 0, deuda: 0 };
  const brechaSemanal = redondearCentavos(Math.max(0, aporteSemanalNecesario - aporteSemanalInicial.meta));
  const brechaCapacidadSemanal = redondearCentavos(Math.max(0, aporteSemanalNecesario - flujoSemanal));
  const totalDistribuidoSemanal = redondearCentavos(
    aporteSemanalInicial.meta + aporteSemanalInicial.emergencia + aporteSemanalInicial.deuda
  );
  const sobranteNoAsignadoSemanal = redondearCentavos(Math.max(0, flujoSemanal - totalDistribuidoSemanal));
  const brechaAdicionalSemanal = redondearCentavos(
    Math.max(0, brechaSemanal - sobranteNoAsignadoSemanal)
  );

  const maxPosible = redondearCentavos(inicial.meta + flujoSemanal * plazoSemanas);
  const categoria = clasificar({
    alcanzable: alcanzable || faltanteInicial === 0,
    diasParaMeta: diasParaMeta ?? 0,
    plazoDias,
    maxPosible,
    costo,
    faltanteInicial
  });

  const pct = (x) => (flujoSemanal > 0 ? Math.round((x / flujoSemanal) * 100) : 0);
  const reparto = {
    emergencia: pct(aporteSemanalInicial.emergencia),
    deuda: pct(aporteSemanalInicial.deuda),
    meta: pct(aporteSemanalInicial.meta)
  };

  const resumenMensual = [];
  for (let i = 0; i < filas.length; i += 4) {
    const bloque = filas.slice(i, i + 4);
    const ultima = bloque[bloque.length - 1];
    resumenMensual.push({
      periodo: `Mes ${resumenMensual.length + 1}`,
      semanas: `${bloque[0].semana}-${ultima.semana}`,
      aporteMeta: redondearCentavos(suma(bloque, (f) => f.aporteMeta)),
      aporteEmergencia: redondearCentavos(suma(bloque, (f) => f.aporteEmergencia)),
      aporteDeuda: redondearCentavos(suma(bloque, (f) => f.aporteDeuda)),
      fondoMetaAlCierre: ultima.fondoMeta,
      fondoEmergenciaAlCierre: ultima.fondoEmergencia,
      deudaRestante: ultima.deudaRestante
    });
  }

  return {
    categoria,
    flujoLibreMensual,
    flujoLibreSemanal: flujoSemanal,

    fondos: {
      emergencia: {
        meses: mesesEmergencia,
        objetivo: objetivoEmergencia,
        actual: inicial.emergencia,
        faltante: redondearCentavos(Math.max(0, objetivoEmergencia - inicial.emergencia)),
        porcentaje: objetivoEmergencia > 0 ? Math.min(100, Math.round((inicial.emergencia / objetivoEmergencia) * 100)) : 100,
        mesesCubiertos: gastosFijos > 0 ? Number((inicial.emergencia / gastosFijos).toFixed(1)) : 0
      },
      meta: {
        objetivo: redondearCentavos(costo),
        actual: inicial.meta,
        faltante: faltanteInicial,
        porcentaje: costo > 0 ? Math.min(100, Math.round((inicial.meta / costo) * 100)) : 100
      }
    },

    reparto,
    aporteSemanalInicial,
    aporteSemanalNecesario,
    brechaSemanal,
    brechaCapacidadSemanal,
    totalDistribuidoSemanal,
    sobranteNoAsignadoSemanal,
    brechaAdicionalSemanal,
    maxPosibleEnPlazo: maxPosible,

    alcanzable,
    sinProgreso,
    semanasParaMeta,
    diasParaMeta,
    cumplePlazoSolicitado: alcanzable && diasParaMeta <= plazoDias,

    deudas: saldos.length === 0 && deudaInicial === 0
      ? null
      : {
          total: redondearCentavos(deudaInicial),
          tasaMax,
          interesMensualEstimado,
          semanasParaLiquidar: semanaDeudaLiquidada,
          saldoAlFinal: filas.length ? filas[filas.length - 1].deudaRestante : redondearCentavos(deudaInicial),
          detalle: (deudas || []).map((d) => ({
            concepto: d.concepto,
            monto: Number(d.monto) || 0,
            tasa: parsearTasa(d.interesAnual)
          }))
        },

    planSemanal: filas,
    resumenMensual,

    datosGraficaCalculados: filas.map((f) => ({
      etiqueta: `Semana ${f.semana}`,
      ahorroAcumulado: f.fondoMeta
    }))
  };
}