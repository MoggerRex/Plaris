// Shared by the selector, request client and timeout handling.
export const advicePlans = {
  estandar: {
    label: 'Estándar',
    model: 'llama3.2:3b',
    timeoutMs: 120000,
    tokens: 1200,
    description: 'Resumen del presupuesto y ajustes sencillos de gastos.',
    instructions:
      'Da un diagnóstico breve y práctico. Prioriza hasta tres ajustes opcionales de mayor utilidad y acciones concretas según los datos registrados. Explica la clasificación y el efecto de la reserva con los cálculos proporcionados.',
  },
  avanzado: {
    label: 'Avanzado',
    model: 'llama3.1:8b',
    timeoutMs: 300000,
    tokens: 2200,
    description: 'Análisis detallado de deudas, intereses, riesgos y alternativas.',
    instructions: `Tu objetivo es convertir el presupuesto en una decisión comprensible y un plan de acción personalizado. No repitas simplemente la tabla ni des consejos genéricos.

CONTENIDO DE resumen:
Escribe entre 250 y 450 palabras como máximo, en párrafos breves separados por saltos de línea, con estas etiquetas y en este orden. Omite detalles que no apliquen.
1. Diagnóstico: abre con la clasificación exacta de calculos.risk, qué significa para esta compra y el principal obstáculo. Una clasificación sobre el plazo no equivale a que la compra sea imposible para siempre.
2. Presupuesto: cita los ingresos mensuales normalizados, gastos recurrentes, pagos de deuda y disponible de calculos. Diferencia sueldo semanal de promedio mensual. Un disponible negativo es déficit, no capacidad de ahorro. Evita contar pagos de deuda dos veces.
3. Deudas y reserva: si hay deudas, identifica por nombre las que no reducen saldo o incumplen el mínimo declarado. Usa firstInterest, months e interest de sus proyecciones; un plazo null no es cero ni una fecha de liquidación. Prioriza revisar pagos insuficientes antes de una compra opcional. No cambies pagos ni inventes una nueva amortización. Explica qué ahorro queda protegido y cuánto está disponible; no confundas reserva elegida con suficiencia comprobada de un fondo de emergencia. Si no hay deudas, dilo en una sola frase.
4. Opciones de compra: compara comprar hoy con ahorrar primero. Compara el costo con available para el contado y explica projected y margin para el plazo solicitado. No confundas projected con dinero sobrante después de comprar. Si daysNeeded es null, explica que el presupuesto actual no permite estimar un plazo de ahorro. Si es cero, ya existe ahorro no protegido suficiente bajo los supuestos; aun así revisa el flujo. Para un plazo positivo usa exactamente daysNeeded y aclara que es una estimación conservadora, no una fecha garantizada. No financies ficticiamente la diferencia ni supongas ofertas de tarjeta.
5. Próximos pasos: da dos o tres acciones concretas en orden de prioridad, vinculadas al problema detectado: completar obligaciones faltantes, revisar condiciones del crédito, separar la reserva o revisar el gasto opcional identificado. No inventes montos, fechas ni mejoras de plazo. Describe el efecto de los ajustes solo cualitativamente: la aplicación recalculará su impacto.

AJUSTES Y RECOMENDACIONES:
Devuelve hasta cuatro ajustes opcionales, sin duplicados y con reducciones parciales razonables. No elimines por defecto el 100% de un gasto. En explicacion menciona el concepto del gasto, el motivo y que el usuario debe confirmar si el recorte es sostenible. Si no hay gastos ajustables devuelve una lista vacía; no recortes necesidades ni reserva para llenar la respuesta.
No hagas preguntas ni pidas respuestas. Si faltan datos, describe la limitación y recomienda qué campos del formulario completar. Genera siempre el plan posible con los datos actuales, sin suponer que un gasto no registrado vale cero.

PRECISIÓN Y TONO:
Habla de tú, con respeto, sin regaños ni juicios sobre caprichos. Distingue datos, estimaciones y propuestas. No afirmes que puedes predecir imprevistos. Explica brevemente la limitación de interés nominal mensual cuando haya deuda y los promedios de ingreso cuando afecten la conclusión. Devuelve conclusiones y motivos verificables, sin razonamiento interno ni operaciones extensas. Todo debe caber en el JSON solicitado; no agregues claves ni texto fuera del objeto.`,
  },
};
