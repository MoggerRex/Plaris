// Servicio centralizado para conectar React con Ollama local (Meta Llama)

const OLLAMA_HOST = "http://localhost:11434";

/**
 * Función genérica para consumir los modelos de Ollama
 */
export async function consultarOllama(model, prompt, jsonMode = false) {
  try {
    const response = await fetch(`${OLLAMA_HOST}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: model,
        prompt: prompt,
        format: jsonMode ? "json" : undefined,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error en el servidor de Ollama: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (jsonMode) {
      try {
        return JSON.parse(data.response);
      } catch (e) {
        console.error("El modelo no devolvió un JSON válido:", data.response);
        return { error: "Formato JSON inválido", raw: data.response };
      }
    }

    return data.response;
  } catch (error) {
    console.error("Error conectando con Ollama:", error);
    return { error: "No se pudo conectar con Ollama. Asegúrate de que esté abierto." };
  }
}

/**
 * 1. Clasificación Flash (Usa llama3.2:3b)
 * Evalúa viabilidad teniendo en cuenta Ahorros + Flujo mensual neto.
 */
export async function clasificarViabilidadMeta(datosFinancieros, meta) {
  const prompt = `
    Analiza con rigor matemático y financiero la viabilidad de la meta del usuario:
    - Ingresos Mensuales: $${datosFinancieros.ingresosMensuales}
    - Gastos Fijos: $${datosFinancieros.gastosFijos}
    - Gastos Variables: $${datosFinancieros.gastosVariables}
    - Ahorro Actual Disponible: $${datosFinancieros.ahorroActual}
    - Meta deseada: ${meta.nombre}, Costo: $${meta.costo}, Plazo deseado por el usuario: ${meta.plazoDias} días.
    - Situación explicada: "${meta.descripcionProblematica}"

    REGLAS DE EVALUACIÓN:
    1. Calcula la capacidad real de ahorro mensual: (Ingresos - Gastos Fijos - Gastos Variables).
    2. Considera que el usuario PUEDE usar parte de su Ahorro Actual ($${datosFinancieros.ahorroActual}), pero evalúa si usarlo lo deja en riesgo sin fondo de emergencia.
    3. Evalúa si con su ahorro libre mensual + ahorros actuales alcanza la meta en los ${meta.plazoDias} días solicitados.

    Clasifica estrictamente en una de estas 4 categorías:
    - "excelente": Alcanza la meta holgadamente sin poner en riesgo su estabilidad ni agotar sus ahorros de emergencia.
    - "viable": Alcanza la meta a tiempo con disciplina, usando un porcentaje seguro de su sobrante o ahorros.
    - "arriesgado": Para lograrlo en el plazo debe usar casi todo su ahorro actual o recortar demasiado sus gastos variables.
    - "Imposible": Matemáticamente el sobrante mensual + ahorros no alcanzan el costo en los días solicitados, o implica quedarse totalmente en $0.

    Responde únicamente en formato JSON estricto:
    {
      "categoria": "Imposible" | "arriesgado" | "viable" | "excelente",
      "mensajeEvaluacion": "Explicación directa del por qué de la categoría, indicando montos exactos de sobrante y ahorros."
    }
  `;
  return await consultarOllama("llama3.2:3b", prompt, true);
}

/**
 * 2. Plan Estándar (Usa llama3.1:8b)
 * Regaña/corrige al usuario si el plan es malo y proyecta semanas exactas hasta alcanzar la meta.
 */
export async function generarPlanEstandar(datosFinancieros, meta, clasificacionPrevia) {
  const prompt = `
    Eres el asesor financiero principal de Plaris. Tu estilo es honesto, profesional, directo y educador.

    DATOS DEL USUARIO:
    - Ingresos Mensuales: $${datosFinancieros.ingresosMensuales}
    - Gastos Fijos: $${datosFinancieros.gastosFijos} | Gastos Variables: $${datosFinancieros.gastosVariables}
    - Capacidad de Ahorro Mensual Libre: $${datosFinancieros.ingresosMensuales - datosFinancieros.gastosFijos - datosFinancieros.gastosVariables}
    - Ahorro Actual en Banco: $${datosFinancieros.ahorroActual}
    - Meta del usuario: ${meta.nombre} ($${meta.costo}) en ${meta.plazoDias} días.
    - Situación del usuario: "${meta.descripcionProblematica}"
    - Diagnóstico rápido previo: "${clasificacionPrevia.categoria}" (${clasificacionPrevia.mensajeEvaluacion})

    INSTRUCCIONES CLAVE DE ASESORÍA:
    1. SI EL PLAN DEL USUARIO ES MALO O ARRIESGADO: Regáñalo constructivamente. Explícale con franqueza por qué querer comprar esto en ${meta.plazoDias} días o usar todo su ahorro es una mala idea que pone en peligro sus finanzas.
    2. EXPLICA EL USO DE AHORROS: Si recomienda usar parte del ahorro actual ($${datosFinancieros.ahorroActual}), aclara qué porcentaje es seguro gastar y cuánto DEBE conservarse intacto como fondo de emergencia.
    3. PLAN CORREGIDO Y VIABLE: Diseña un plan realista basado en su capacidad de ahorro real mensual sobrante.
    4. PROYECCION EXACTA DE LA GRÁFICA (REGLA ESTRICTA):
       - Calcula cuánto dinero puede destinar semanalmente.
       - La lista 'datosGrafica' debe empezar en la Semana 1 y sumar progresivamente hasta ALCANZAR O SUPERAR LEVEMENTE el costo de $${meta.costo}.
       - ¡DETÉN LA LISTA DE LA GRÁFICA EXACTAMENTE EN LA SEMANA DONDE SE COMPLETA LA META! No generes semanas de más (no hagas 60 semanas si la meta se cumple en la semana 8 o 12).

    Devuelve estrictamente un objeto JSON:
    {
      "criticaYRegaño": "Mensaje directo evaluando si la idea del usuario es buena o mala y corrigiéndolo.",
      "analisisAhorroActual": "Explicación de si se tocarán los $${datosFinancieros.ahorroActual} actuales o no, y el riesgo de hacerlo.",
      "planCorregidoSugerido": "Propuesta de plazo y estrategia realista propuesta por la IA.",
      "puntosClave": [
        "Punto 1 con regla de oro financiera",
        "Punto 2 sobre cómo mantener el fondo de emergencia"
      ],
      "datosGrafica": [
        {"etiqueta": "Semana 1", "ahorroAcumulado": number},
        {"etiqueta": "Semana 2", "ahorroAcumulado": number}
      ]
    }
  `;
  return await consultarOllama("llama3.1:8b", prompt, true);
}

/**
 * 3. Plan Avanzado CoT (Usa llama3.1:8b)
 * Súper análisis financiero profundo con Chain of Thought, gestión de deudas y amortización.
 */
export async function generarPlanAvanzadoCoT(datosFinancieros, deudas, meta, clasificacionPrevia) {
  const prompt = `
    [MODO ANÁLISIS FINANCIERO PROFUNDIZADO - CHAIN OF THOUGHT]
    Actúa como un Asesor Financiero Senior. Analiza minuciosamente el plan del usuario.

    DATOS COMPLETOS:
    - Ingresos Mensuales: $${datosFinancieros.ingresosMensuales}
    - Gastos Fijos: $${datosFinancieros.gastosFijos} | Gastos Variables: $${datosFinancieros.gastosVariables}
    - Flujo de Caja Libre Mensual: $${datosFinancieros.ingresosMensuales - datosFinancieros.gastosFijos - datosFinancieros.gastosVariables}
    - Ahorro Actual Disponible: $${datosFinancieros.ahorroActual}
    - Meta propuesta: ${meta.nombre} ($${meta.costo}) en ${meta.plazoDias} días.
    - Justificación del usuario: "${meta.descripcionProblematica}"
    - Deudas Registradas: ${JSON.stringify(deudas)}
    - Diagnóstico Flash: "${clasificacionPrevia.categoria}"

    PASOS DE RAZONAMIENTO (Chain of Thought):
    1. Evalúa si las deudas actuales generan intereses altos que superen el beneficio de comprar la meta.
    2. Determina si el deseo del usuario es un capricho o una necesidad real frente a su liquidez.
    3. Si el plan es imprudente, adviértele las consecuencias financieras (quedarse en $0, pagar intereses moratorios, etc.).
    4. Proponle una reestructuración completa de metas: prioridad de deudas vs. ahorro para la meta.

    Devuelve estrictamente un objeto JSON:
    {
      "llamoDeAtencion": "Evaluación crítica y sincera del plan del usuario y sus errores de juicio financiero.",
      "analisisRiesgoAhorroYDeuda": "Análisis profundo sobre tocar el fondo de emergencia y el impacto de los intereses de sus deudas.",
      "estrategiaCoTRecomendada": "Paso a paso lógico recomendado para sanear finanzas y lograr la meta sin peligro.",
      "planAmortizacion": [
        {"periodo": "Mes 1", "montoDestinadoAhorro": number, "montoDestinadoDeuda": number, "comentario": "string"}
      ],
      "conclusionYVeredicto": "Explicación de cuándo y cómo podrá comprar su meta de forma 100% segura."
    }
  `;
  return await consultarOllama("llama3.1:8b", prompt, true);
}