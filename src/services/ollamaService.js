import { calcularMetricasFinancieras, formatearMoneda as $ } from '../utils/calculadoraFinanciera';

const OLLAMA_HOST = "http://localhost:11434";

/* ============================================================
 * 1. CLIENTE GENÉRICO
 * ============================================================ */

/**
 * @param {string} model
 * @param {string} prompt
 * @param {object} opciones
 *   - system:     instrucciones fijas del asesor (rol, reglas, tono)
 *   - formato:    objeto JSON Schema (salida estructurada) | "json" | undefined (texto libre)
 *   - numPredict: máximo de tokens de salida
 *   - reintentos: veces que se reintenta si el JSON llega inválido/cortado
 */
export async function consultarOllama(
  model,
  prompt,
  { system, formato, numPredict = 900, reintentos = 1 } = {}
) {
  const cuerpo = {
    model,
    prompt,
    system,                 // undefined se omite solo en JSON.stringify
    format: formato,
    stream: false,
    keep_alive: "10m",      // evita recargar el modelo en cada consulta
    options: {
      num_predict: numPredict,
      num_ctx: 4096,
      temperature: 0.3,
      num_thread: 4
    }
  };

  const llamar = (body) =>
    fetch(`${OLLAMA_HOST}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

  try {
    for (let intento = 0; intento <= reintentos; intento++) {
      let response = await llamar(cuerpo);

      // Ollama antiguo sin soporte de esquemas -> modo JSON simple
      if (!response.ok && formato && typeof formato === "object") {
        response = await llamar({ ...cuerpo, format: "json" });
      }
      if (!response.ok) {
        throw new Error(`Error en el servidor de Ollama: ${response.statusText}`);
      }

      const data = await response.json();
      if (!formato) return data.response;

      try {
        return JSON.parse(data.response);
      } catch {
        console.warn(`JSON inválido (intento ${intento + 1}):`, data.response);
        if (intento === reintentos) {
          return { error: "Formato JSON inválido", raw: data.response };
        }
      }
    }
  } catch (error) {
    console.error("Error conectando con Ollama:", error);
    return { error: "No se pudo conectar con Ollama. Asegúrate de que esté abierto." };
  }
}

/* ============================================================
 * 2. PROMPTS: ROL + DATOS
 * ============================================================ */

const SYSTEM_PLARIS = `Eres Plaris, un asesor de finanzas personales para usuarios en México.
Hablas en español claro y cercano, sin tecnicismos innecesarios.

REGLAS:
1. Usa ÚNICAMENTE las cifras del bloque DATOS. Nunca calcules, estimes ni inventes montos, porcentajes o plazos nuevos.
2. Distingue SIEMPRE dos fondos: el "Fondo de emergencia" (intocable, para imprevistos) y el "Fondo de la meta" (el dinero que se junta para la compra).
3. Tono: empático pero honesto. Si el plan es riesgoso, dilo claro y explica por qué, sin regañar ni juzgar.
4. Sé concreto: cada consejo debe poder aplicarse esta semana.
5. Si el usuario describió su situación, respóndele directamente a eso.
6. Responde SOLO con el JSON pedido, sin texto extra.`;

const limpiar = (t) => String(t ?? "").replace(/["\n\r]+/g, " ").slice(0, 500);

function bloqueDatos(datos, meta, m) {
  const e = m.fondos.emergencia;
  const f = m.fondos.meta;
  const L = [];

  L.push(`- Meta: "${limpiar(meta.nombre)}" por ${$(meta.costo)}, plazo deseado: ${meta.plazoDias} días.`);
  L.push(`- Situación que describe el usuario: "${limpiar(meta.descripcionProblematica)}"`);
  L.push(`- Ingreso mensual: ${$(datos.ingresosMensuales)}. Gastos fijos: ${$(datos.gastosFijos)}. Gastos variables: ${$(datos.gastosVariables)}.`);
  L.push(`- Flujo libre: ${$(m.flujoLibreMensual)} al mes (≈ ${$(m.flujoLibreSemanal)} por semana).`);
  L.push(`- FONDO DE EMERGENCIA: tiene ${$(e.actual)} de ${$(e.objetivo)} recomendados (${e.porcentaje}%). Cubre ${e.mesesCubiertos} de ${e.meses} meses de gastos fijos.`);
  L.push(`- FONDO DE LA META: tiene ${$(f.actual)} de ${$(f.objetivo)} (${f.porcentaje}%).`);

  if (m.flujoLibreSemanal > 0) {
    L.push(`- Reparto semanal propuesto del flujo libre: ${m.reparto.meta}% a la meta (${$(m.aporteSemanalInicial.meta)}), ${m.reparto.emergencia}% a emergencia (${$(m.aporteSemanalInicial.emergencia)})${m.reparto.deuda ? `, ${m.reparto.deuda}% a deudas (${$(m.aporteSemanalInicial.deuda)})` : ""}.`);
  } else {
    L.push(`- El usuario NO tiene flujo libre: sus gastos igualan o superan sus ingresos.`);
  }

  if (m.alcanzable) {
    L.push(`- Con ese ritmo la meta se completa en ${m.semanasParaMeta} semanas (${m.diasParaMeta} días). ${m.cumplePlazoSolicitado ? "SÍ" : "NO"} cumple el plazo deseado.`);
  } else {
    L.push(`- Con el flujo actual la meta NO se alcanza en 2 años.`);
  }

  if (m.brechaSemanal > 0) {
    L.push(`- Para cumplir el plazo deseado haría falta depositar ${$(m.aporteSemanalNecesario)} por semana a la meta; hoy se proponen ${$(m.aporteSemanalInicial.meta)} (brecha de ${$(m.brechaSemanal)} por semana).`);
  }
  if (m.categoria === "imposible") {
    L.push(`- Aun destinando el 100% del flujo libre, en el plazo deseado solo se juntarían ${$(m.maxPosibleEnPlazo)} de los ${$(meta.costo)} necesarios.`);
  }

  return L.join("\n");
}

function bloqueDeudas(m) {
  if (!m.deudas) return "- El usuario no reporta deudas.";
  const d = m.deudas;
  const lista = d.detalle.map((x) => `${limpiar(x.concepto)}: ${$(x.monto)} al ${x.tasa}% anual`).join("; ");
  return [
    `- Deudas: ${lista}.`,
    `- Total adeudado: ${$(d.total)}. Solo en intereses se van ≈ ${$(d.interesMensualEstimado)} al mes.`,
    d.semanasParaLiquidar === null
      ? `- Al llegar a la meta, todavía quedarían ${$(d.saldoAlFinal)} de deuda.`
      : `- Con el plan, las deudas quedan liquidadas en la semana ${d.semanasParaLiquidar}.`,
    `- Estrategia aplicada: método avalancha (primero la deuda de mayor interés).`
  ].join("\n");
}

/** Rellena campos faltantes para que la UI nunca truene por una respuesta incompleta */
function completar(resp, campos) {
  const salida = { ...resp };
  for (const [clave, defecto] of Object.entries(campos)) {
    if (salida[clave] === undefined || salida[clave] === null || salida[clave] === "") {
      salida[clave] = defecto;
    }
  }
  return salida;
}

/* ============================================================
 * 3. CLASIFICACIÓN FLASH (llama3.2:3b)
 *    La categoría la decide JS (determinista).
 *    La IA solo redacta el mensaje.
 * ============================================================ */

const ESQUEMA_CLASIFICACION = {
  type: "object",
  properties: { mensajeEvaluacion: { type: "string" } },
  required: ["mensajeEvaluacion"]
};

const MENSAJES_FALLBACK = {
  excelente: "Tu meta es muy alcanzable con tu ritmo de ahorro actual.",
  viable: "Tu meta es alcanzable en el plazo que pides si mantienes tu ritmo de ahorro.",
  arriesgado: "Podrías lograrlo, pero solo sacrificando tu fondo de emergencia o el pago de deudas.",
  imposible: "Con tus ingresos y gastos actuales, esta meta no es alcanzable en ese plazo."
};

export async function clasificarViabilidadMeta(datosFinancieros, meta, deudas = []) {
  const m = calcularMetricasFinancieras(datosFinancieros, meta, deudas);

  const prompt = `DATOS:
${bloqueDatos(datosFinancieros, meta, m)}

CLASIFICACIÓN DEL SISTEMA: "${m.categoria}" (excelente / viable / arriesgado / imposible).

TAREA: Escribe "mensajeEvaluacion": exactamente 2 oraciones que justifiquen esa clasificación usando 1 o 2 cifras de DATOS. No cambies la clasificación.`;

  const resp = await consultarOllama("llama3.2:3b", prompt, {
    system: SYSTEM_PLARIS,
    formato: ESQUEMA_CLASIFICACION,
    numPredict: 250
  });

  // Error de conexión real -> la app lo muestra
  if (resp?.error && !resp.raw) return resp;

  return {
    categoria: m.categoria,
    mensajeEvaluacion: resp?.mensajeEvaluacion || MENSAJES_FALLBACK[m.categoria]
  };
}

/* ============================================================
 * 4. PLAN ESTÁNDAR (llama3.1:8b)
 * ============================================================ */

const ESQUEMA_PLAN_ESTANDAR = {
  type: "object",
  properties: {
    diagnostico: { type: "string" },
    analisisFondoEmergencia: { type: "string" },
    analisisFondoMeta: { type: "string" },
    planSugerido: { type: "string" },
    puntosClave: { type: "array", items: { type: "string" } }
  },
  required: ["diagnostico", "analisisFondoEmergencia", "analisisFondoMeta", "planSugerido", "puntosClave"]
};

export async function generarPlanEstandar(datosFinancieros, meta, clasificacionPrevia) {
  const m = calcularMetricasFinancieras(datosFinancieros, meta);

  const prompt = `DATOS:
${bloqueDatos(datosFinancieros, meta, m)}

CLASIFICACIÓN DEL SISTEMA: "${m.categoria}"

TAREA: Redacta la asesoría con estos campos:
- diagnostico: 2 o 3 oraciones. Si la clasificación es "arriesgado" o "imposible", explica con honestidad por qué el plazo de ${meta.plazoDias} días compromete sus finanzas; si es "viable" o "excelente", confírmalo y motívalo.
- analisisFondoEmergencia: 2 oraciones sobre el estado de su fondo de emergencia y por qué NO debe usarlo para la meta.
- analisisFondoMeta: 2 oraciones sobre cuánto depositará cada semana a su fondo de la meta y en cuánto tiempo llega.
- planSugerido: la recomendación concreta (si el plazo no es realista, propón el plazo de DATOS en vez del deseado).
- puntosClave: EXACTAMENTE 3 consejos cortos y accionables, adaptados a la situación que describió el usuario.`;

  const resp = await consultarOllama("llama3.1:8b", prompt, {
    system: SYSTEM_PLARIS,
    formato: ESQUEMA_PLAN_ESTANDAR,
    numPredict: 900
  });
  if (resp.error) return resp;

  return {
    ...completar(resp, {
      diagnostico: MENSAJES_FALLBACK[m.categoria],
      analisisFondoEmergencia: "",
      analisisFondoMeta: "",
      planSugerido: "",
      puntosClave: []
    }),
    categoria: m.categoria,
    calculos: m // fondos, reparto, planSemanal... (todo calculado por JS)
  };
}

/* ============================================================
 * 5. PLAN AVANZADO CoT (llama3.1:8b)
 *    "razonamiento" va PRIMERO en el esquema: el modelo escribe sus
 *    pasos antes de concluir (eso es lo que hace útil al CoT).
 * ============================================================ */

const ESQUEMA_PLAN_AVANZADO = {
  type: "object",
  properties: {
    razonamiento: { type: "array", items: { type: "string" } },
    llamadoDeAtencion: { type: "string" },
    analisisRiesgoAhorroYDeuda: { type: "string" },
    estrategiaRecomendada: { type: "array", items: { type: "string" } },
    conclusionYVeredicto: { type: "string" }
  },
  required: ["razonamiento", "llamadoDeAtencion", "analisisRiesgoAhorroYDeuda", "estrategiaRecomendada", "conclusionYVeredicto"]
};

export async function generarPlanAvanzadoCoT(datosFinancieros, deudas, meta, clasificacionPrevia) {
  const m = calcularMetricasFinancieras(datosFinancieros, meta, deudas);

  const prompt = `DATOS:
${bloqueDatos(datosFinancieros, meta, m)}
${bloqueDeudas(m)}

CLASIFICACIÓN DEL SISTEMA: "${m.categoria}"

TAREA: Razona paso a paso y luego concluye. Llena los campos EN ESTE ORDEN:
1. razonamiento: EXACTAMENTE 4 pasos, una oración cada uno, usando solo cifras de DATOS:
   Paso 1 - capacidad real de ahorro (flujo libre).
   Paso 2 - estado del fondo de emergencia y del fondo de la meta.
   Paso 3 - deudas vs. meta: qué conviene priorizar y por qué (considera el costo de los intereses).
   Paso 4 - decisión: ¿el plazo deseado es realista o conviene el plazo calculado?
2. llamadoDeAtencion: 2 oraciones directas y respetuosas sobre el mayor error o riesgo del plan del usuario.
3. analisisRiesgoAhorroYDeuda: 2 o 3 oraciones sobre el peligro de gastar en la meta mientras hay deudas y el fondo de emergencia está ${m.fondos.emergencia.porcentaje}% completo.
4. estrategiaRecomendada: entre 4 y 5 acciones en orden cronológico (qué hacer esta semana, este mes, al terminar las deudas, al llegar a la meta).
5. conclusionYVeredicto: 2 oraciones con el veredicto final y una frase de ánimo.

No incluyas tablas ni montos semanales: el sistema los muestra aparte.`;

  const resp = await consultarOllama("llama3.1:8b", prompt, {
    system: SYSTEM_PLARIS,
    formato: ESQUEMA_PLAN_AVANZADO,
    numPredict: 1400
  });
  if (resp.error) return resp;

  return {
    ...completar(resp, {
      razonamiento: [],
      llamadoDeAtencion: MENSAJES_FALLBACK[m.categoria],
      analisisRiesgoAhorroYDeuda: "",
      estrategiaRecomendada: [],
      conclusionYVeredicto: ""
    }),
    categoria: m.categoria,
    calculos: m // incluye resumenMensual (reemplaza al planAmortizacion de la IA)
  };
}