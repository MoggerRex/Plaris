/**
 * Contenido de la Guía Plaris.
 *
 * Cada tema tiene:
 *  - text:     introducción corta
 *  - sections: bloques con { heading, paragraphs?, items?, ordered?, callout? }
 *  - link/action: botón final (opcional)
 *
 * callout = { label: 'Ejemplo' | 'Consejo' | 'Ojo', text: '...' }
 */
export const guideTopics = [
  /* ============================================================
   * 1. GUÍA PLARIS
   * ============================================================ */
  {
    id: 'inicio',
    title: 'Guía Plaris',
    text: 'Plaris es tu espacio para entender y planear tu dinero. Registras tus números, los ves en tablas y gráficas, y un agente de inteligencia artificial que corre en tu computadora te ayuda a convertir una meta en un plan realista.',
    sections: [
      {
        heading: '¿Para qué sirve Plaris?',
        paragraphs: [
          'Plaris te ayuda a responder tres preguntas: ¿cuánto dinero entra y sale cada mes?, ¿cuánto puedo ahorrar sin ponerme en riesgo? y ¿en cuánto tiempo puedo lograr mi meta?',
          'No es una app para llevar la contabilidad al centavo, sino una herramienta para tomar mejores decisiones: ves tu panorama completo, comparas lo que planeaste contra lo que realmente pasó, y recibes recomendaciones claras cuando tu plan no es realista.',
        ],
      },
      {
        heading: 'Cómo está organizada',
        paragraphs: [
          'Cada sección del menú superior tiene un propósito. Aquí va el resumen; en las demás pestañas de esta guía las explicamos con detalle:',
        ],
        items: [
          'Agente: dile qué quieres lograr y recibe un plan. Evalúa si tu meta es realista y, si no lo es, te propone una alternativa.',
          'Tablas y gráficas: compara lo planeado contra lo real, con gráficas de barras, circulares y tablas con importes. Aquí también registras tus movimientos.',
          'Análisis gráfico: un chat para que Plaris te explique tus propios números. Tú eliges qué datos puede ver.',
          'Guía: esta sección. Explica cómo usar Plaris y los conceptos de finanzas detrás de tus números.',
          'Mi perfil: aquí capturas tus ingresos, gastos, ahorros, deudas y tu meta. Es el punto de partida de todo lo demás.',
          'Menú lateral (botón Φ): crea y consulta plantillas de presupuesto, y accede rápido al análisis y a tu perfil.',
        ],
      },
      {
        heading: 'Empieza en 5 pasos',
        ordered: true,
        items: [
          'Ve a Mi perfil → Perfil y meta y captura tu nombre, tu meta (qué quieres lograr, cuánto cuesta y en cuántos días), el ahorro que ya tienes y tu reserva protegida.',
          'En las pestañas Ingresos, Gastos, Ahorros y Deudas registra tu presupuesto mensual.',
          'Revisa la barra superior: te muestra tus totales y cuánto dinero te queda disponible.',
          'Abre el Agente, cuéntale qué tienes en mente y elige un análisis Estándar o Avanzado.',
          'Cada mes, registra tus movimientos reales en Tablas y gráficas para comparar lo planeado contra lo que de verdad pasó.',
        ],
      },
      {
        heading: 'La barra de métricas',
        paragraphs: [
          'En todas las pantallas verás arriba tus Ingresos, Gastos, Ahorros, Deudas y lo Disponible del mes. Cada monto es un acceso directo al apartado de tu perfil donde se captura. A la derecha está el selector del mes: al cambiarlo, todo Plaris muestra los datos de ese mes.',
        ],
      },
      {
        heading: 'Cosas importantes que debes saber',
        items: [
          'Tus datos se guardan en este navegador. No se sincronizan entre dispositivos y, si borras los datos del navegador, se pierden.',
          'La inteligencia artificial se ejecuta en tu computadora con Ollama. Por eso Ollama debe estar abierto para que el agente y el chat respondan.',
          'Todos los montos están en pesos mexicanos (MXN) y los presupuestos son mensuales.',
          'Plaris es una herramienta educativa y de apoyo. No sustituye a un asesor financiero profesional.',
        ],
      },
    ],
    link: '/perfil/resumen',
    action: 'Abrir mi perfil',
  },

  /* ============================================================
   * 2. FINANZAS
   * ============================================================ */
  {
    id: 'finanzas',
    title: 'Finanzas',
    text: 'Entender unos cuantos conceptos básicos cambia por completo cómo lees tus números. Aquí aprendes qué significa cada cosa, por qué Plaris calcula como calcula y qué hábitos funcionan de verdad.',
    sections: [
      {
        heading: 'Los cuatro conceptos básicos',
        items: [
          'Ingresos: todo el dinero que recibes (sueldo, honorarios, ventas, apoyos). Registra lo que realmente cobras, no lo que “deberías” cobrar.',
          'Gastos: el dinero que sale. Se dividen en fijos (renta, servicios, colegiaturas, transporte; casi no cambian) y variables (comida fuera, ropa, salidas; los puedes ajustar).',
          'Ahorros: dinero que apartas. Hay dos cosas distintas: la aportación mensual (lo que separas cada mes) y el ahorro actual (el saldo que ya tienes guardado).',
          'Deudas: dinero que debes. Cada deuda tiene un saldo (cuánto debes hoy), un pago mensual y una tasa de interés (cuánto te cuesta tener esa deuda).',
        ],
      },
      {
        heading: 'Tu dinero disponible',
        paragraphs: [
          'Plaris calcula lo Disponible así: Ingresos − Gastos − Ahorros − Pagos de deuda. Es el dinero al que todavía no le has dado un trabajo.',
        ],
        items: [
          'Disponible en cero: le asignaste un trabajo a cada peso. Es una muy buena señal, porque nada se “pierde” sin que te des cuenta.',
          'Disponible positivo: te sobra dinero. Puedes aumentar tu ahorro, adelantar deudas o acelerar tu meta.',
          'Disponible negativo: planeas gastar más de lo que ganas. Hay que recortar gastos o aumentar ingresos antes de seguir.',
        ],
        callout: {
          label: 'Ejemplo',
          text: 'Si ganas $30,000, gastas $17,500 y apartas $12,500 para ahorro, tu disponible es $0: cada peso tiene destino.',
        },
      },
      {
        heading: '¿Por qué dividimos el mes entre 4.33 semanas?',
        paragraphs: [
          'Mucha gente piensa que un mes tiene 4 semanas, pero 4 semanas son solo 28 días y casi todos los meses tienen 30 o 31. Un año tiene 52 semanas y 12 meses, así que un mes promedio dura 52 ÷ 12 = 4.3333… semanas. Plaris lo redondea a 4.33.',
          'Cuando conviertes un monto mensual a semanal, divides entre 4.33 y no entre 4. Si divides entre 4, calculas una cantidad semanal demasiado grande y crees que puedes ahorrar más de lo que realmente puedes, porque estás contando semanas que no existen.',
        ],
        callout: {
          label: 'Ejemplo',
          text: 'Si te quedan $6,000 libres al mes: ÷ 4.33 = $1,386 por semana (correcto). ÷ 4 = $1,500 por semana, unos $114 de más cada semana, cerca de 8% de error. Con el tiempo, tu meta se retrasaría sin que sepas por qué.',
        },
      },
      {
        heading: 'De días a semanas',
        paragraphs: [
          'Las metas se piden en días y los depósitos se planean por semana. Para convertir, divide los días entre 7. Una meta a 90 días son 12.86 semanas.',
          'Ahorrar por semana funciona mejor que por mes: son pasos pequeños y frecuentes, notas tu avance rápido y un mal mes no echa a perder todo el plan.',
        ],
      },
      {
        heading: 'Fondo de emergencia: tu red de seguridad',
        paragraphs: [
          'Es dinero guardado solo para imprevistos reales: un problema de salud, perder el empleo, una reparación urgente. Evita que un mal momento te obligue a endeudarte.',
        ],
        items: [
          '¿Cuánto? Lo mínimo recomendado son 3 meses de gastos fijos. Si tus ingresos son variables o tienes dependientes económicos, apunta a 6 meses.',
          '¿Dónde? En una cuenta separada, de fácil acceso y sin riesgo. No en inversiones que puedan perder valor justo cuando lo necesites.',
          '¿Cuándo se usa? Solo en emergencias. Una oferta o un viaje no son emergencias.',
          'Si lo usas, repónlo cuanto antes antes de seguir con tu meta.',
        ],
        callout: {
          label: 'Ejemplo',
          text: 'Si tus gastos fijos son $8,500 al mes, tu fondo de emergencia ideal es de $25,500 (3 meses). En tu perfil, la “Reserva protegida” es el dinero que Plaris no debe tocar para tu meta.',
        },
      },
      {
        heading: 'Reglas prácticas de presupuesto',
        items: [
          'Regla 50/30/20: 50% para necesidades (renta, comida, transporte), 30% para gustos y 20% para ahorro y deudas. Es un punto de partida, no una ley; ajústala a tu realidad.',
          'Págate primero a ti: aparta tu ahorro apenas recibas tu dinero, no con lo que sobre al final del mes. Lo que sobra casi nunca alcanza.',
          'Presupuesto de base cero: dale destino a cada peso hasta que tu Disponible llegue a cero.',
          'Separa tus cuentas: una para gastos del día a día y otra para tu ahorro. Lo que no ves, lo gastas menos.',
        ],
        callout: {
          label: 'Ejemplo',
          text: 'Con ingresos de $30,000, la regla 50/30/20 sugiere $15,000 en necesidades, $9,000 en gustos y $6,000 en ahorro y deudas.',
        },
      },
      {
        heading: 'Deudas: cómo pensar en ellas',
        items: [
          'La tasa de interés importa más que el monto. Una deuda de $5,000 al 28% anual te cuesta cerca de $117 al mes solo en intereses, dinero que no te acerca a ninguna meta.',
          'Método avalancha: paga primero la deuda con mayor tasa de interés, mientras cubres el mínimo del resto. Es el que menos intereses te cuesta.',
          'Método bola de nieve: paga primero la deuda más pequeña para ganar motivación rápido. Cuesta un poco más en intereses, pero es más fácil de mantener.',
          'El pago mínimo de una tarjeta de crédito casi solo cubre intereses. Si solo pagas el mínimo, la deuda casi no baja.',
          'Evita endeudarte para consumo (viajes, aparatos, ropa). Si algo no cabe en tu presupuesto, ahorra para ello.',
          'Registra los pagos de deuda en Deudas y no los repitas en Gastos, o tus números quedarán inflados.',
        ],
      },
      {
        heading: 'Cómo convertir una meta en un plan',
        paragraphs: [
          'La fórmula es sencilla: costo de la meta ÷ semanas disponibles = lo que debes apartar cada semana. Luego compara ese número con lo que realmente puedes ahorrar por semana.',
        ],
        callout: {
          label: 'Ejemplo',
          text: 'Una laptop de $22,000 en 90 días son 12.86 semanas: necesitas apartar cerca de $1,711 por semana. Si tu flujo libre es de $1,386 por semana, el plazo no es realista. Opciones: alargar el plazo, buscar una opción más barata, reducir gastos variables o aumentar tus ingresos.',
        },
        items: [
          'Una meta realista cabe dentro de lo que te sobra después de cubrir gastos, deudas y fondo de emergencia.',
          'Si tu plan exige más de lo que puedes ahorrar, Plaris te lo dirá y te propondrá un plazo o un monto más viable.',
          'Es mejor llegar un poco más tarde que abandonar el plan por exigirte demasiado.',
        ],
      },
      {
        heading: 'Errores comunes',
        items: [
          'Ignorar los gastos pequeños y frecuentes (café, antojos, suscripciones). Sumados pesan mucho.',
          'Contar con ingresos que aún no recibes.',
          'Usar tu fondo de emergencia para metas o compras.',
          'Pagar deudas caras mientras ahorras sin ningún orden.',
          'Presupuestar sin gastos imprevistos: siempre habrá alguno.',
          'No revisar tus números: un presupuesto que nunca se compara contra la realidad no sirve.',
        ],
      },
      {
        heading: 'Hábitos que funcionan',
        items: [
          'Revisa tus finanzas una vez por semana, solo 10 minutos.',
          'Registra tus movimientos reales en el momento o al final del día.',
          'Cada mes compara Planeado contra Real y ajusta tu presupuesto con base en lo que de verdad pasó.',
          'Automatiza tu ahorro con una transferencia programada el día que cobras.',
          'Celebra tus avances: cada semana que cumples tu depósito es una victoria.',
        ],
        callout: {
          label: 'Ojo',
          text: 'Esta información es educativa y no constituye asesoría financiera personalizada. Para decisiones grandes (créditos, inversiones, deudas complicadas), consulta a un profesional.',
        },
      },
    ],
  },

  /* ============================================================
   * 3. AGENTE
   * ============================================================ */
  {
    id: 'agente',
    title: 'Agente',
    text: 'El agente es el asistente de Plaris. Toma tu meta y tus números, revisa si tu plan es realista y te propone cómo lograrlo. Si tu plan no es viable, te lo dice claramente y te sugiere uno nuevo.',
    sections: [
      {
        heading: '¿Qué hace el agente?',
        items: [
          'Evalúa tu meta contra tu presupuesto: cuánto te sobra, cuánto necesitas y en cuánto tiempo puedes lograrla.',
          'Te dice si tu plan es bueno o si hay riesgos, y explica por qué.',
          'Cuando tu plan no es realista, te recomienda una alternativa viable.',
          'Considera tus deudas y tu ahorro actual para no poner en riesgo tu estabilidad.',
        ],
        callout: {
          label: 'Ojo',
          text: 'El agente propone, no ejecuta. No modifica tus datos ni mueve tu dinero. Tú decides qué hacer con sus recomendaciones.',
        },
      },
      {
        heading: 'Antes de usarlo',
        ordered: true,
        items: [
          'Completa Mi perfil → Perfil y meta: nombre de tu meta, costo, plazo en días, ahorro actual y reserva protegida.',
          'Captura tus ingresos, gastos, ahorros y deudas del mes en las demás pestañas del perfil.',
          'Abre Ollama en tu computadora. Sin él, el agente no puede responder.',
        ],
      },
      {
        heading: 'Qué ves en la pantalla',
        items: [
          'Barra superior: tus totales del mes y lo Disponible.',
          'Panel “Cada peso cuenta” (izquierda): dos gráficas, “Lo que planeas” y “Lo que llevas”. Se abre y se cierra con la flecha del borde; al cerrarlo, el chat se centra en la pantalla. Tiene su propio scroll.',
          'Tarjeta de meta: muestra el nombre de tu meta y un acceso para editarla.',
          'Caja de chat: donde le cuentas al agente qué tienes en mente, con el selector Estándar / Avanzado y el botón de enviar.',
          'Botones rápidos: Agente (esta pantalla), Agendar (tu perfil y meta), Historial (tus análisis guardados) y Mis datos (tu perfil).',
        ],
      },
      {
        heading: 'Cómo crear tu plan',
        ordered: true,
        items: [
          'Revisa la tarjeta de meta. Si no la has definido o quieres cambiarla, usa “Editar mi meta y mis datos”.',
          'En la caja de chat escribe lo que tienes en mente. Cuanto más contexto des, mejor será la respuesta. Por ejemplo: “Quiero comprar una laptop en 3 meses, tengo una tarjeta con deuda y mis gastos suben a fin de mes”.',
          'Elige el tipo de análisis: Estándar o Avanzado.',
          'Presiona el botón de enviar y espera unos momentos. El tiempo depende de la potencia de tu computadora.',
          'Lee el resultado debajo del chat.',
        ],
      },
      {
        heading: 'Estándar vs. Avanzado',
        items: [
          'Estándar: un resumen rápido. Ideal para saber si tu meta es viable y qué ajustes pequeños te convienen.',
          'Avanzado: un análisis más profundo que toma en cuenta tus deudas y compara alternativas con más detalle. Tarda un poco más. Úsalo cuando tengas deudas, ingresos justos o una meta grande.',
        ],
      },
      {
        heading: 'Cómo leer el resultado',
        items: [
          'El título indica el nivel de riesgo de tu plan.',
          'El resumen explica en palabras sencillas dónde estás parado y si tu meta es alcanzable.',
          'Ajustes sugeridos: gastos específicos que podrías reducir, con cuánto ahorrarías al mes.',
          'Advertencias: riesgos que debes tener en cuenta, como tocar tu fondo de emergencia o descuidar deudas con interés alto.',
        ],
      },
      {
        heading: 'Consejos para mejores respuestas',
        items: [
          'Sé específico: menciona si tus ingresos son irregulares, si tienes deudas o gastos que se acercan.',
          'Mantén tus datos al día: el agente solo trabaja con lo que tú capturas.',
          'Si cambias tus datos o el mes, el agente reinicia su respuesta para no mostrarte un plan desactualizado.',
          'Compara sus cifras con tus tablas. La IA puede equivocarse y es buena práctica verificar.',
        ],
      },
    ],
    link: '/dashboard',
    action: 'Abrir el agente',
  },

  /* ============================================================
   * 4. TABLAS Y GRÁFICAS
   * ============================================================ */
  {
    id: 'graficas',
    title: 'Tablas y gráficas',
    text: 'Aquí ves tus finanzas de un vistazo y comparas lo que planeaste contra lo que realmente pasó. También es donde registras tus movimientos reales.',
    sections: [
      {
        heading: 'Planeado vs. Real',
        items: [
          'Planeado: el presupuesto que guardaste en tu perfil para ese mes (ingresos, gastos y ahorros). Es tu intención.',
          'Real: los movimientos que registraste con fecha en ese mes. Es lo que de verdad ocurrió.',
        ],
        callout: {
          label: 'Ojo',
          text: 'Un Real en cero no significa que cumpliste tu plan, sino que todavía no registraste movimientos.',
        },
      },
      {
        heading: 'Qué puedes hacer aquí',
        items: [
          'Cambiar entre Gráficas y Tablas con importes. Ambas muestran la misma información, solo cambia cómo la ves.',
          'Ayúdame a entender mis datos: te lleva al Análisis para que Plaris te explique tus números.',
          'Registrar movimientos: captura tus ingresos, gastos y ahorros reales.',
          'Cambiar el mes con el selector de la barra superior.',
        ],
      },
      {
        heading: 'Cómo leer cada gráfica',
        items: [
          'Planeado y real (barras): compara lado a lado lo planeado contra lo real para ingresos, gastos y ahorros.',
          'Ingresos, Gastos y Ahorros (circulares): muestran cómo se reparte tu presupuesto planeado. Te dicen qué porción se lleva cada concepto.',
          'Deudas: muestra el saldo que debes registrado en tu perfil.',
        ],
      },
      {
        heading: 'Cómo registrar movimientos reales',
        ordered: true,
        items: [
          'Presiona “Registrar movimientos”.',
          'Elige el tipo: Ingreso, Gasto o Ahorro.',
          'Captura el importe y la fecha. La fecha decide a qué mes pertenece el movimiento.',
          'Guarda y regresa a Tablas y gráficas para ver cómo cambió tu Real.',
        ],
        callout: {
          label: 'Consejo',
          text: 'Registra tus movimientos todos los días o al menos una vez por semana. Si lo dejas para fin de mes, olvidarás gastos pequeños.',
        },
      },
      {
        heading: 'Cómo interpretar la diferencia',
        paragraphs: [
          'En las tablas verás “Real menos planeado”. El signo significa cosas distintas según el tipo:',
        ],
        items: [
          'Ingresos: si es negativo, recibiste menos de lo que esperabas (o aún no lo registras).',
          'Gastos: si es positivo, gastaste más de lo planeado. Es una señal para revisar ese concepto.',
          'Ahorros: si es negativo, ahorraste menos de lo que te propusiste.',
        ],
      },
      {
        heading: 'Tips',
        items: [
          'Si un gasto siempre supera lo planeado, el problema suele ser un presupuesto poco realista, no tu disciplina. Ajusta el monto planeado.',
          'Revisa primero las barras para ver el panorama y luego baja a las tablas para encontrar dónde están las diferencias.',
          'Haz esta revisión cada semana, no solo a fin de mes: corregir a tiempo es mucho más fácil.',
        ],
      },
    ],
    link: '/graficas',
    action: 'Explorar mis datos',
  },

  /* ============================================================
   * 5. ANÁLISIS
   * ============================================================ */
  {
    id: 'analisis',
    title: 'Análisis',
    text: 'El Análisis es un chat con Plaris para entender tus propios números. No arma planes de meta (eso lo hace el Agente): aquí le preguntas qué significan tus tablas y gráficas.',
    sections: [
      {
        heading: 'Cómo usarlo',
        ordered: true,
        items: [
          'Elige el mes en la barra superior.',
          'En “Datos que recibirá Plaris” marca las secciones que quieres analizar: Ingresos, Gastos, Ahorros y Deudas.',
          'Revisa tus datos en Tablas o Gráficas para ubicar lo que te interesa.',
          'Escribe tu pregunta en el chat y presiona “Preguntar a Plaris”.',
          'Si la respuesta te sirve, presiona “Guardar este análisis” para consultarla después.',
        ],
      },
      {
        heading: 'Privacidad: tú decides qué ve la IA',
        paragraphs: [
          'Plaris solo recibe las secciones que tienes marcadas. Si desmarcas Deudas, el chat no sabrá nada de tus deudas. Además, todo se procesa localmente con Ollama en tu propia computadora.',
        ],
      },
      {
        heading: 'Preguntas que puedes hacer',
        items: [
          '“¿Cuál es mi mayor gasto?”',
          '“Explícame la diferencia entre planeado y real.”',
          '“¿En qué estoy gastando más de lo que planeé?”',
          '“¿Qué porcentaje de mis ingresos estoy ahorrando?”',
          '“¿Cuánto me cuestan mis deudas cada mes?”',
        ],
      },
      {
        heading: 'Nueva conversación',
        paragraphs: [
          'Si cambias los datos o la selección de secciones, el chat inicia una conversación nueva. Esto evita que Plaris responda con información que ya no corresponde a lo que ves. Si una respuesta te interesa, guárdala antes de cambiar la selección.',
        ],
      },
      {
        heading: 'Historial',
        paragraphs: [
          'Arriba de la página encontrarás “Historial de análisis guardados”. Es un desplegable donde cada análisis aparece con su mes y la fecha en que lo guardaste. Al abrir uno ves la conversación completa. También puedes llegar desde el botón Historial del Agente.',
        ],
      },
      {
        heading: 'Qué no hace el chat',
        items: [
          'No modifica tus datos ni guarda cambios. Si le pides cambiar algo, te indicará en qué sección de tu perfil hacerlo.',
          'No inventa cifras: solo usa los datos que le compartes.',
          'Puede equivocarse. Si una respuesta te parece rara, compárala con tus tablas.',
        ],
      },
      {
        heading: 'Análisis vs. Agente',
        items: [
          'Análisis: para entender tus números actuales (“¿qué significa esto?”).',
          'Agente: para planear una meta (“¿puedo lograr esto y cómo?”).',
        ],
      },
    ],
    link: '/analisis',
    action: 'Abrir el chat de análisis',
  },

  /* ============================================================
   * 6. TU PERFIL Y PLANTILLAS
   * ============================================================ */
  {
    id: 'perfil',
    title: 'Tu perfil y plantillas',
    text: 'Tu perfil es el punto de partida de Plaris: ahí capturas tu presupuesto, tus deudas y tu meta. Las plantillas te permiten guardar esa configuración y reutilizarla.',
    sections: [
      {
        heading: 'Qué hay en Mi perfil',
        paragraphs: [
          'Mi perfil tiene cinco pestañas: Ingresos, Gastos, Ahorros, Deudas y Perfil y meta. Los botones de monto de la barra superior te llevan directo a cada una.',
        ],
      },
      {
        heading: 'Datos mensuales y datos actuales',
        items: [
          'Ingresos, Gastos y Ahorros son presupuestos mensuales: cada mes tiene los suyos. Cambian cuando eliges otro mes.',
          'Perfil y Deudas son datos actuales compartidos: son los mismos sin importar el mes que veas.',
        ],
      },
      {
        heading: 'Cómo llenar Ingresos, Gastos y Ahorros',
        ordered: true,
        items: [
          'Entra a la pestaña y agrega un renglón por cada concepto (por ejemplo: Sueldo, Renta, Ahorro para vacaciones).',
          'Escribe el importe mensual de cada uno, en pesos.',
          'Guarda los cambios.',
          'Revisa la barra superior: tus totales y lo Disponible se actualizan.',
        ],
        callout: {
          label: 'Consejo',
          text: 'Separa tus gastos fijos de los variables usando nombres claros. Así es más fácil saber qué puedes recortar.',
        },
      },
      {
        heading: 'Cómo llenar Deudas',
        items: [
          'Registra cada deuda por separado, con su saldo (cuánto debes hoy) y su pago mensual.',
          'No repitas ese pago en Gastos: Plaris ya lo descuenta de tu Disponible.',
          'Actualiza el saldo conforme vayas pagando.',
        ],
      },
      {
        heading: 'Perfil y meta',
        items: [
          'Tu nombre: para personalizar Plaris.',
          'Nombre de tu meta: qué quieres lograr (por ejemplo, “Laptop”).',
          'Costo de la meta (MXN): cuánto cuesta.',
          'Plazo de la meta (días): en cuántos días quieres lograrla. Viene en 90 por defecto.',
          'Ahorro que ya tienes (MXN): el saldo que hoy tienes guardado. La aportación mensual, en cambio, se registra en Ahorros.',
          'Reserva protegida (MXN): dinero que no debe tocarse para la meta, como tu fondo de emergencia.',
        ],
        callout: {
          label: 'Ojo',
          text: 'Presiona “Guardar perfil” al terminar. Si cambias de pestaña sin guardar, pierdes los cambios.',
        },
      },
      {
        heading: 'Plantillas: qué son y para qué sirven',
        paragraphs: [
          'Una plantilla es una copia guardada de tu presupuesto, tus deudas y tu meta. Te sirve para volver a una configuración que ya funcionó o para probar escenarios sin perder tus datos originales.',
        ],
        items: [
          'Un mes normal que repites cada mes.',
          'Un mes de vacaciones o con gastos extra.',
          'Un escenario de recorte para ver cómo cambiaría tu meta.',
        ],
      },
      {
        heading: 'Cómo crear y usar plantillas',
        ordered: true,
        items: [
          'Deja tu presupuesto como quieres guardarlo.',
          'Abre el menú lateral con el botón Φ y presiona “Nueva plantilla”.',
          'Ponle un nombre claro y guárdala.',
          'Tus plantillas aparecen en “Plantillas guardadas” dentro del mismo menú.',
          'Para usarla, ábrela y aplícala.',
        ],
        callout: {
          label: 'Ojo',
          text: 'Aplicar una plantilla reemplaza los datos que indique. Tus movimientos reales no se borran: se conservan siempre.',
        },
      },
      {
        heading: 'El menú lateral',
        paragraphs: [
          'Se abre y se cierra con el botón Φ del encabezado (o con “Cerrar menú” dentro de él). Contiene:',
        ],
        items: [
          'Nueva plantilla y Análisis de tus datos.',
          'Tus presupuestos guardados.',
          'Un acceso a tu perfil, al fondo.',
        ],
      },
      {
        heading: 'Buenas prácticas',
        items: [
          'Actualiza tu perfil al inicio de cada mes, antes de pedirle un plan al agente.',
          'Si tus ingresos cambian, actualízalos de inmediato: todo el análisis depende de ese dato.',
          'Guarda una plantilla antes de hacer cambios grandes, por si quieres regresar.',
        ],
      },
    ],
    link: '/plantillas',
    action: 'Mis plantillas',
  },
];
