// Servicio centralizado para conectar React con Ollama local (Meta Llama)

const OLLAMA_HOST = "http://localhost:11434";

/**
 * Función genérica para consumir los modelos de Ollama
 * @param {string} model - Nombre del modelo ('llama3.2:3b' o 'llama3.1:8b')
 * @param {string} prompt - Instrucción o texto a enviar
 * @param {boolean} jsonMode - Forzar salida en formato JSON estricto
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
      } catch {
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
 */
export async function clasificarViabilidadMeta(datosFinancieros, meta) {
  const prompt = `
    Analiza la viabilidad de la siguiente meta financiera:
    - Ingresos/Gastos del usuario: ${JSON.stringify(datosFinancieros)}
    - Meta deseada: ${meta.nombre}, Costo: $${meta.costo}, Plazo: ${meta.plazoDias} días.

    Responde únicamente en formato JSON con la siguiente estructura:
    {
      "esViable": boolean,
      "mensajeEvaluacion": "Breve explicación de por qué es o no viable"
    }
  `;
  return await consultarOllama("llama3.2:3b", prompt, true);
}

/**
 * 2. Plan Estándar / Generación de JSON para gráficas (Usa llama3.1:8b)
 */
export async function generarPlanEstandar(datosFinancieros, meta) {
  const prompt = `
    Eres el asesor financiero de Plaris. Con base en estos datos:
    ${JSON.stringify(datosFinancieros)}
    Calcula un plan de ahorro paso a paso para la meta: ${meta.nombre} ($${meta.costo}).

    Devuelve estrictamente un objeto JSON con esta estructura:
    {
      "resumenPlan": "string",
      "puntosClave": ["string", "string"],
      "datosGrafica": [
        {"etiqueta": "Semana 1", "ahorroAcumulado": number},
        {"etiqueta": "Semana 2", "ahorroAcumulado": number}
      ]
    }
  `;
  return await consultarOllama("llama3.1:8b", prompt, true);
}

/**
 * 3. Plan Avanzado / Razonamiento con CoT (Usa llama3.1:8b con System Prompt analítico)
 */
export async function generarPlanAvanzadoCoT(datosFinancieros, deudas, meta) {
  const prompt = `
    [MODO ANÁLISIS FINANCIERO PROFUNDO - CHAIN OF THOUGHT]
    Actúa como un analista financiero experto. El usuario tiene deudas complejas y finanzas ajustadas.
    - Datos financieros: ${JSON.stringify(datosFinancieros)}
    - Deudas activas: ${JSON.stringify(deudas)}
    - Meta principal: ${meta.nombre} ($${meta.costo}) en ${meta.plazoDias} días.

    Piensa paso a paso sobre el impacto de los intereses, los flujos de caja y los riesgos de liquidez. 
    Luego, responde strictly en formato JSON con la siguiente estructura:
    {
      "analisisRiesgos": "string",
      "estrategiaDeudas": "string",
      "planAmortizacion": [
        {"periodo": "string", "montoDestinadoAhorro": number, "montoDestinadoDeuda": number}
      ],
      "recomendacionFinal": "string"
    }
  `;
  return await consultarOllama("llama3.1:8b", prompt, true);
}
