import { calcularMetricasFinancieras, formatearMoneda as $ } from '../utils/calculadoraFinanciera';

const OLLAMA_HOST = "http://localhost:11434";

/* ============================================================
 * 1. CLIENTE GENÉRICO DE OLLAMA
 * ============================================================ */

export async function consultarOllama(
  model,
  prompt,
  { system, formato, numPredict = 900, reintentos = 1 } = {}
) {
  const cuerpo = {
    model,
    prompt,
    system,
    format: formato,
    stream: false,
    keep_alive: "10m",
    options: {
      num_predict: numPredict,
      num_ctx: 4096,
      temperature: 0.2,
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

      if (!response.ok && formato && typeof formato === "object") {
        response = await llamar({ ...cuerpo, format: "json" });
      }

      if (!response.ok) {
        throw new Error(
          `Error en el servidor de Ollama: ${response.statusText}`
        );
      }

      const data = await response.json();

      if (!formato) return data.response;

      try {
        return JSON.parse(data.response);
      } catch {
        console.warn(
          `JSON inválido (intento ${intento + 1}):`,
          data.response
        );

        if (intento === reintentos) {
          return {
            error: "Formato JSON inválido",
            raw: data.response
          };
        }
      }
    }
  } catch (error) {
    console.error("Error conectando con Ollama:", error);

    return {
      error:
        "No se pudo conectar con Ollama. Asegúrate de que esté abierto."
    };
  }
}

/* ============================================================
 * 2. PROMPT GENERAL DE PLARIS
 * ============================================================ */

const SYSTEM_PLARIS = `Eres Plaris, un asesor de finanzas personales para usuarios en México.
Tu objetivo es ayudar a tomar decisiones financieras realistas, comprensibles y responsables.

JERARQUÍA DE INFORMACIÓN:
1. La clasificación flash incluida en el prompt es el veredicto de referencia obligatorio para el plan original.
2. Los cálculos del sistema son la fuente de verdad para montos, porcentajes, plazos, saldos y proyecciones.
3. Tu función es interpretar los datos, explicar sus implicaciones y recomendar cómo actuar. No sustituyas la clasificación flash por una opinión contradictoria.

REGLAS OBLIGATORIAS:
1. Lee la categoría flash y su mensaje de evaluación antes de redactar.
2. No cambies, contradigas ni reclasifiques la categoría flash.
3. No presentes como excelente un plan clasificado como "arriesgado" o "imposible"; tampoco afirmes que es imposible si está clasificado como "excelente" o "viable".
4. Distingue siempre la frecuencia temporal de los montos: NO confundas o mezcles cifras mensuales con semanales. Si hablas de aportación semanal, usa la cifra calculada semanal (${$(m => m.flujoLibreSemanal)} o aportación semanal); si hablas de flujo mensual, especifica que es al mes.
5. Usa únicamente cifras entregadas por el sistema. No inventes aportaciones, tasas, montos, plazos ni resultados de escenarios no calculados.
6. Habla en español claro, cercano, respetuoso y práctico. Evita alarmismo y tecnicismos innecesarios.
7. Responde exclusivamente con el JSON pedido, sin texto adicional.`;

const limpiar = (t) =>
  String(t ?? "").replace(/["\n\r]+/g, " ").slice(0, 500);

/* ============================================================
 * 3. BLOQUE DE DATOS FINANCIEROS
 * ============================================================ */

function bloqueDatos(datos, meta, m) {
  const e = m.fondos.emergencia;
  const f = m.fondos.meta;
  const L = [];

  L.push(
    `- Meta: "${limpiar(meta.nombre)}" por ${$(meta.costo)}, plazo deseado: ${meta.plazoDias} días.`
  );

  L.push(
    `- Situación que describe el usuario: "${limpiar(meta.descripcionProblematica)}"`
  );

  L.push(
    `- Ingreso mensual: ${$(datos.ingresosMensuales)}. Gastos fijos: ${$(datos.gastosFijos)}. Gastos variables: ${$(datos.gastosVariables)}.`
  );

  L.push(
    `- Sobrante/Flujo libre MENSUAL: ${$(m.flujoLibreMensual)} al mes.`
  );

  L.push(
    `- Sobrante/Flujo libre SEMANAL disponible (convertido a 4.33 semanas/mes): ${$(m.flujoLibreSemanal)} por semana.`
  );

  L.push(
    `- FONDO DE EMERGENCIA: tiene ${$(e.actual)} de ${$(e.objetivo)} recomendados (${e.porcentaje}%). Cubre ${e.mesesCubiertos} de ${e.meses} meses de gastos fijos.`
  );

  L.push(
    `- FONDO DE LA META: tiene ${$(f.actual)} de ${$(f.objetivo)} (${f.porcentaje}%).`
  );

  if (m.flujoLibreSemanal > 0) {
    L.push(
      `- Reparto SEMANAL propuesto del flujo libre: ${m.reparto.meta}% a la meta (${$(m.aporteSemanalInicial.meta)}/semana), ${m.reparto.emergencia}% a emergencia (${$(m.aporteSemanalInicial.emergencia)}/semana)${m.reparto.deuda ? `, ${m.reparto.deuda}% a deudas (${$(m.aporteSemanalInicial.deuda)}/semana)` : ""}.`
    );
  } else {
    L.push(
      "- El usuario NO tiene flujo libre: sus gastos igualan o superan sus ingresos."
    );
  }

  if (m.alcanzable) {
    L.push(
      `- Con ese ritmo la meta se completa en ${m.semanasParaMeta} semanas (${m.diasParaMeta} días). ${m.cumplePlazoSolicitado ? "SÍ" : "NO"} cumple el plazo deseado.`
    );
    if (!m.cumplePlazoSolicitado) {
      L.push(
        `- Aunque no se alcanza en los ${meta.plazoDias} días solicitados, SÍ es alcanzable manteniendo el flujo y reparto actuales: el plazo alternativo calculado es ${m.semanasParaMeta} semanas, ${m.diasParaMeta} días (${(m.diasParaMeta / 365).toLocaleString("es-MX", { maximumFractionDigits: 1 })} años aprox.). Recomienda ajustar la fecha objetivo a este plazo.`
      );
    }
  } else {
    L.push(
      m.sinProgreso
        ? "- Con el flujo y reparto actuales no existe avance neto hacia la meta; no hay un plazo alternativo calculable mientras estas condiciones no cambien."
        : "- No hay flujo semanal positivo para aportar a la meta; no hay un plazo alternativo calculable mientras estas condiciones no cambien."
    );
  }

  if (m.brechaSemanal > 0) {
    L.push(
      `- Para cumplir el plazo deseado haría falta depositar ${$(m.aporteSemanalNecesario)} por SEMANA a la meta; hoy se proponen ${$(m.aporteSemanalInicial.meta)}/semana (brecha de ${$(m.brechaSemanal)} por semana).`
    );
  }

  if (m.categoria === "imposible") {
    L.push(
      `- Aun destinando el 100% del flujo libre semanal (${$(m.flujoLibreSemanal)}/semana), en el plazo deseado solo se juntarían ${$(m.maxPosibleEnPlazo)} de los ${$(meta.costo)} necesarios.`
    );
  }

  return L.join("\n");
}

function bloqueDeudas(m) {
  if (!m.deudas) {
    return "- El usuario no reporta deudas.";
  }

  const d = m.deudas;

  const lista = d.detalle
    .map(
      (x) =>
        `${limpiar(x.concepto)}: ${$(x.monto)} al ${x.tasa}% anual`
    )
    .join("; ");

  return [
    `- Deudas: ${lista}.`,
    `- Total adeudado: ${$(d.total)}. Solo en intereses se van ≈ ${$(d.interesMensualEstimado)} al mes.`,
    d.semanasParaLiquidar === null
      ? `- Al llegar a la meta, todavía quedarían ${$(d.saldoAlFinal)} de deuda.`
      : `- Con el plan, las deudas quedan liquidadas en la semana ${d.semanasParaLiquidar}.`,
    "- Estrategia aplicada: método avalancha (primero la deuda de mayor interés)."
  ].join("\n");
}

function completar(resp, campos) {
  const salida = { ...resp };
  for (const [clave, defecto] of Object.entries(campos)) {
    if (
      salida[clave] === undefined ||
      salida[clave] === null ||
      salida[clave] === ""
    ) {
      salida[clave] = defecto;
    }
  }
  return salida;
}

/* ============================================================
 * 4. CLASIFICACIÓN FLASH (llama3.2:3b)
 * ============================================================ */

const MENSAJES_FALLBACK = {
  excelente: "Tu meta es muy alcanzable con tu ritmo de ahorro actual.",
  viable: "Tu meta es alcanzable en el plazo que pides si mantienes tu ritmo de ahorro.",
  arriesgado: "Podrías lograrlo, pero solo sacrificando tu fondo de emergencia o el pago de deudas.",
  imposible: "Con tus ingresos y gastos actuales, esta meta no es alcanzable en ese plazo."
};

export async function clasificarViabilidadMeta(
  datosFinancieros,
  meta,
  deudas = []
) {
  const m = calcularMetricasFinancieras(
    datosFinancieros,
    meta,
    deudas
  );
  const mesesAproximados = (dias) =>
    (dias / 30).toLocaleString("es-MX", { maximumFractionDigits: 1, minimumFractionDigits: 1 });
  const detalleEvaluacion = [];
  const plazoDeseado = `${meta.plazoDias} días (${mesesAproximados(meta.plazoDias)} meses aprox.)`;
  let textoPlazo;

  if (m.alcanzable && m.diasParaMeta === 0) {
    textoPlazo = `Tu plazo propuesto es de ${plazoDeseado}. Ya tienes el monto de la meta, así que puedes alcanzarla ahora.`;
  } else if (m.alcanzable) {
    const plazoReal = `${m.diasParaMeta} días (${mesesAproximados(m.diasParaMeta)} meses aprox.)`;
    textoPlazo = `Tu plazo propuesto es de ${plazoDeseado}. ${m.cumplePlazoSolicitado ? "Sí es realista" : "No es realista con el reparto actual de tu dinero."} Como referencia para ajustar el plan a uno realista, el plazo calculado con las condiciones actuales es de ${plazoReal}.`;
  } else {
    textoPlazo = m.sinProgreso
      ? `Tu plazo propuesto es de ${plazoDeseado}, pero con el flujo y reparto actuales no hay avance neto hacia la meta; no es posible estimar un plazo alternativo hasta ajustar esas condiciones.`
      : `Tu plazo propuesto es de ${plazoDeseado}, pero no hay flujo semanal positivo para avanzar hacia la meta; no es posible estimar un plazo alternativo hasta ajustar esa situación.`;
  }
  detalleEvaluacion.push({ titulo: "1. Plazo del plan", texto: textoPlazo });

  const sobranteMensual = m.flujoLibreMensual;
  const sobraTotalSemanal = m.flujoLibreSemanal;
  const distribucionSemanal = [
    `${$(m.aporteSemanalInicial.meta)} a la meta`,
    `${$(m.aporteSemanalInicial.emergencia)} al fondo de emergencia`
  ];
  if (m.aporteSemanalInicial.deuda > 0) {
    distribucionSemanal.push(`${$(m.aporteSemanalInicial.deuda)} a deudas`);
  }
  const textoCapacidad = m.brechaCapacidadSemanal > 0
    ? `Para el plazo que propusiste de ${meta.plazoDias} días, necesitas aportar ${$(m.aporteSemanalNecesario)} por semana a la meta. Tu sobrante semanal total es ${$(sobraTotalSemanal)}; aun destinándolo completo a la meta, faltarían ${$(m.brechaCapacidadSemanal)} por semana.`
    : `Para el plazo que propusiste de ${meta.plazoDias} días, la meta necesitaría recibir ${$(m.aporteSemanalNecesario)} por semana. Tu sobrante semanal total realmente es ${$(sobraTotalSemanal)} y el reparto distribuye tus ${$(m.totalDistribuidoSemanal)} asi: ${distribucionSemanal.join(", ")}. Quedan ${$(m.sobranteNoAsignadoSemanal)} sin asignar.`;
  const textoAsignacion = m.aporteSemanalInicial.meta < m.aporteSemanalNecesario
    ? `Actualmente van ${$(m.aporteSemanalInicial.meta)} por semana a la meta; faltan ${$(m.brechaSemanal)} para llegar a la aportación semanal del plazo que propusiste. ${m.brechaAdicionalSemanal > 0 ? `Si mantienes las aportaciones actuales a emergencia y deudas, necesitarías aumentar tu sobrante semanal en ${$(m.brechaAdicionalSemanal)}; si no, habría que redistribuir los porcentajes y hacer un plan nuevo.` : `La diferencia puede cubrirse con el sobrante no asignado, sin reducir las otras aportaciones.`}`
    : `Actualmente van ${$(m.aporteSemanalInicial.meta)} por semana a la meta, cantidad suficiente para cubrir la aportación requerida.`;
  detalleEvaluacion.push({
    titulo: "2. De dónde sale tu sobrante semanal",
    texto: `Tu sobrante mensual viene del siguiente cálculo: ${$(datosFinancieros.ingresosMensuales)} de ingresos menos ${$(datosFinancieros.gastosFijos)} de gastos fijos y ${$(datosFinancieros.gastosVariables)} de gastos variables es igual a: ${$(sobranteMensual)}. Al convertirlo usando 4.33 semanas por mes, quedan ${$(sobraTotalSemanal)} disponibles por semana. ${textoCapacidad} ${textoAsignacion}`
  });

  const partesReparto = [
    `${m.reparto.meta}% (${$(m.aporteSemanalInicial.meta)}) a la meta`,
    `${m.reparto.emergencia}% (${$(m.aporteSemanalInicial.emergencia)}) al fondo de emergencia`
  ];
  if (m.reparto.deuda > 0) {
    partesReparto.push(`${m.reparto.deuda}% (${$(m.aporteSemanalInicial.deuda)}) a deudas`);
  }
  const resumenReparto = partesReparto.length > 1
    ? `${partesReparto.slice(0, -1).join(", ")} y ${partesReparto.at(-1)}`
    : partesReparto[0];
  const estadoReparto = m.cumplePlazoSolicitado
    ? "Sí es adecuado para el plazo solicitado: la simulación alcanza la meta dentro de ese periodo."
    : "Tu plan necesita ajuste para cumplir el plazo solicitado: la simulación no alcanza la meta dentro de ese periodo por lo que se recomendara un nuevo plan.";
  const estadoEmergencia = m.fondos.emergencia.faltante > 0
    ? `El fondo de emergencia aún está incompleto (${m.fondos.emergencia.porcentaje}% de su objetivo), por lo que mantener esta aportación ayuda a proteger tu estabilidad.`
    : "Tu fondo de emergencia ya llegó al objetivo calculado, así que no requiere una aportación semanal adicional por ahora.";
  detalleEvaluacion.push({
    titulo: "3. ¿El reparto del sobrante es adecuado?",
    texto: `${estadoReparto} Actualmente distribuyes ${resumenReparto}. ${estadoEmergencia}`
  });

  return {
    categoria: m.categoria,
    detalleEvaluacion,
    mensajeEvaluacion: detalleEvaluacion
      .map(({ titulo, texto }) => `${titulo}: ${texto}`)
      .join(" ")
  };
}

/* ============================================================
 * 6. PLAN AVANZADO CoT (llama3.1:8b)
 * ============================================================ */

const ESQUEMA_PLAN_AVANZADO = {
  type: "object",
  properties: {
    razonamiento: {
      type: "array",
      items: { type: "string" }
    },
    llamadoDeAtencion: { type: "string" },
    analisisRiesgoAhorroYDeuda: { type: "string" },
    estrategiaRecomendada: {
      type: "array",
      items: { type: "string" }
    },
    conclusionYVeredicto: { type: "string" }
  },
  required: [
    "razonamiento",
    "llamadoDeAtencion",
    "analisisRiesgoAhorroYDeuda",
    "estrategiaRecomendada",
    "conclusionYVeredicto"
  ]
};

const ESQUEMA_ANALISIS_PRESUPUESTO = {
  type: "object",
  properties: {
    resumenGeneral: { type: "string" },
    ventajas: {
      type: "array",
      items: { type: "string" }
    },
    areasOportunidad: {
      type: "array",
      items: { type: "string" }
    },
    recomendaciones: {
      type: "array",
      items: { type: "string" }
    },
    queHacerSiNoCumple: { type: "string" }
  },
  required: [
    "resumenGeneral",
    "ventajas",
    "areasOportunidad",
    "recomendaciones",
    "queHacerSiNoCumple"
  ]
};

export async function generarAnalisisPresupuestoOnboarding(presupuesto) {
  const total = (items = []) => items.reduce(
    (amount, item) => amount + (Number(item.amountCents) || 0),
    0
  ) / 100;
  const ingresos = total(presupuesto.incomes);
  const gastos = total(presupuesto.expenses);
  const ahorros = total(presupuesto.savings);
  const porcentajeGastos = ingresos > 0 ? Number(((gastos / ingresos) * 100).toFixed(1)) : 0;
  const porcentajeAhorros = ingresos > 0 ? Number(((ahorros / ingresos) * 100).toFixed(1)) : 0;
  const perfilFinanciero = porcentajeAhorros >= 20
    ? "Ahorrativo"
    : porcentajeAhorros >= 10
      ? "Equilibrado"
      : porcentajeAhorros > 0
        ? "Ahorro inicial"
        : "Sin ahorro planeado";
  const mayoresGastos = (presupuesto.expenses || [])
    .filter((item) => Number(item.amountCents) > 0)
    .sort((a, b) => b.amountCents - a.amountCents)
    .slice(0, 3)
    .map((item) => ({
      categoria: limpiar(item.name || item.category || "Gasto"),
      monto: Number(item.amountCents) / 100,
      porcentajeIngreso: ingresos > 0
        ? Number((((Number(item.amountCents) / 100) / ingresos) * 100).toFixed(1))
        : 0
    }));

  const metricas = {
    ingresos,
    gastos,
    ahorros,
    porcentajeGastos,
    porcentajeAhorros,
    perfilFinanciero,
    mayoresGastos
  };
  const datos = [
    `- Ingresos mensuales: ${$(ingresos)}.`,
    `- Gastos mensuales: ${$(gastos)} (${porcentajeGastos}% del ingreso).`,
    `- Ahorro mensual planeado: ${$(ahorros)} (${porcentajeAhorros}% del ingreso).`,
    `- Perfil determinado por la tasa de ahorro (20% o más: ahorrativo; 10% a 19.9%: equilibrado; más de 0% y menos de 10%: ahorro inicial; 0%: sin ahorro planeado): ${perfilFinanciero}.`,
    `- Principales gastos: ${mayoresGastos.length
      ? mayoresGastos.map((item) => `${item.categoria}: ${$(item.monto)} (${item.porcentajeIngreso}% del ingreso)`).join("; ")
      : "no hay gastos registrados"}.`
  ].join("\n");
  const system = `Eres Plaris, un asesor de finanzas personales para usuarios en México.
Analiza presupuestos con empatía, claridad y consejos realistas. Usa exclusivamente los datos y porcentajes calculados que recibes; no inventes cifras ni juzgues al usuario.
Respeta el perfil financiero determinado por el sistema. Si es "Ahorrativo", explica sus ventajas y su área de oportunidad sin recomendar recortar gastos esenciales ni ahorrar a costa de necesidades básicas. Si el presupuesto no se cumple, recomienda revisar gastos reales, priorizar necesidades, ajustar categorías y actualizar el plan sin culpa.
Responde exclusivamente con el JSON solicitado.`;
  const prompt = `Analiza este presupuesto mensual y redacta una asesoría útil para el usuario:
${datos}

Incluye en resumenGeneral una lectura global del presupuesto y menciona los porcentajes de gasto y ahorro. En ventajas y areasOportunidad, analiza el perfil informado. En recomendaciones, incluye pasos concretos y realistas. En queHacerSiNoCumple, explica cómo ajustar el presupuesto si no puede cumplirlo mes con mes.
Devuelve únicamente el JSON definido.`;
  const respuesta = await consultarOllama("llama3.1:8b", prompt, {
    system,
    formato: ESQUEMA_ANALISIS_PRESUPUESTO,
    numPredict: 1000
  });

  if (respuesta.error) return respuesta;

  return {
    metricas,
    ...completar(respuesta, {
      resumenGeneral: "",
      ventajas: [],
      areasOportunidad: [],
      recomendaciones: [],
      queHacerSiNoCumple: ""
    })
  };
}

export async function generarPlanAvanzadoCoT(
  datosFinancieros,
  deudas,
  meta,
  clasificacionPrevia
) {
  const m = calcularMetricasFinancieras(
    datosFinancieros,
    meta,
    deudas
  );

  const categoriaFlash =
    clasificacionPrevia?.categoria ?? m.categoria;

  const mensajeFlash = limpiar(
    clasificacionPrevia?.mensajeEvaluacion ||
      MENSAJES_FALLBACK[categoriaFlash]
  );

  const prompt = `EVALUACIÓN FLASH OBLIGATORIA:
- Categoría: "${categoriaFlash}"
- Mensaje de evaluación: "${mensajeFlash}"

DATOS FINANCIEROS CALCULADOS:
${bloqueDatos(datosFinancieros, meta, m)}
${bloqueDeudas(m)}

OBJETIVO DEL PLAN AVANZADO:
Analiza una meta costosa, compleja o una situación con deudas mediante razonamiento paso a paso.

REGLA STRICTA DE UNIDADES Y PERIODICIDAD (NUNCA CONFUNDIR):
- El sobrante MENSUAL es de ${$(m.flujoLibreMensual)} AL MES.
- El sobrante SEMANAL total disponible es de ${$(m.flujoLibreSemanal)} A LA SEMANA.
- Si sugieres destinar el 100% del sobrante/flujo libre a la semana, DEBES decir "${$(m.flujoLibreSemanal)} por semana". NUNCA digas "$4,000.00 por semana" ni uses la cifra mensual para la frecuencia semanal.

Completa los campos del JSON en este orden:
1. razonamiento: exactamente 4 observaciones breves, una oración por elemento.
2. llamadoDeAtencion: 1 o 2 oraciones sobre el principal riesgo real.
3. analisisRiesgoAhorroYDeuda: 2 o 3 oraciones que relacionen el fondo de emergencia, la meta y las deudas.
4. estrategiaRecomendada: entre 4 y 5 acciones concretas y ordenadas cronológicamente. Asegúrate de usar correctamente las cifras semanales (${$(m.flujoLibreSemanal)}/semana) o mensuales (${$(m.flujoLibreMensual)}/mes).
5. conclusionYVeredicto: exactamente 2 oraciones con el veredicto final.

No incluyas tablas, Markdown ni texto fuera del JSON.`;

  const resp = await consultarOllama(
    "llama3.1:8b",
    prompt,
    {
      system: SYSTEM_PLARIS,
      formato: ESQUEMA_PLAN_AVANZADO,
      numPredict: 1400
    }
  );

  if (resp.error) return resp;

  return {
    ...completar(resp, {
      razonamiento: [],
      llamadoDeAtencion: MENSAJES_FALLBACK[categoriaFlash],
      analisisRiesgoAhorroYDeuda: "",
      estrategiaRecomendada: [],
      conclusionYVeredicto: ""
    }),
    categoria: categoriaFlash,
    calculos: m
  };
}