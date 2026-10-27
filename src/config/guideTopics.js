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
    text: 'Plaris es tu espacio para entender y planear tu dinero. Capturas tus ingresos, gastos, ahorros, deudas y tu meta; los ves en tablas y gráficas; y usas el Agente y el Análisis para convertir esos números en decisiones. Tus datos se guardan en este navegador y las respuestas de IA se generan en tu computadora con Ollama.',
    sections: [
      {
        heading: '¿Para qué sirve Plaris?',
        paragraphs: [
          'Plaris te ayuda a responder tres preguntas: ¿cuánto dinero entra y sale cada mes?, ¿cuánto puedo ahorrar sin ponerme en riesgo? y ¿en cuánto tiempo puedo lograr mi meta?',
          'No es solo una app para llevar la contabilidad al centavo, sino una herramienta para tomar mejores decisiones: ves tu panorama completo, comparas lo que planeaste contra lo que realmente pasó, y recibes ayuda para revisar compras, metas y deudas.',
        ],
      },
      {
        heading: 'Cómo está organizada',
        paragraphs: [
          'Cada sección del menú superior tiene un propósito. Aquí va el resumen; en las demás pestañas de esta guía las explicamos con detalle:',
        ],
        items: [
          'Agente: reúne cuatro herramientas: revisar una compra, analizar o crear una meta, generar reportes y registrar un movimiento rápido.',
          'Tablas y gráficas: compara lo planeado contra lo real con barras, gráficas circulares y tablas con importes. Desde aquí también abres Movimientos para capturar lo que de verdad pasó.',
          'Análisis gráfico: un chat para que Plaris te explique tus propios números. Tú eliges qué datos puede ver.',
          'Guía: esta sección. Explica cómo usar Plaris y los conceptos de finanzas detrás de tus números.',
          'Mi perfil: aquí capturas tus ingresos, gastos, ahorros, deudas y tu meta principal. Es el punto de partida de todo lo demás.',
          'Menú lateral (botón Φ): crea y consulta plantillas de presupuesto, revisa tus análisis guardados y accede rápido a tu perfil.',
        ],
      },
      {
        heading: 'Empieza en 5 pasos',
        ordered: true,
        items: [
          'Si es tu primera vez, termina la configuración inicial: ahí registras tu presupuesto y tus primeras metas. Después podrás ajustar tu presupuesto, tus deudas y tu meta principal desde Mi perfil.',
          'Ve a Mi perfil → Perfil y meta y revisa tu nombre, tu meta principal, su costo, el plazo en días, el ahorro que ya tienes y tu reserva protegida.',
          'En las pestañas Ingresos, Gastos, Ahorros y Deudas registra tu presupuesto mensual. Marca como “Necesario” solo los gastos que no deberías recortar.',
          'Revisa la barra superior: te muestra tus totales, el saldo de tus deudas y cuánto dinero te queda disponible.',
          'Usa el Agente para revisar una compra o una meta, y registra tus movimientos reales en Movimientos para comparar lo planeado contra lo real.',
        ],
      },
      {
        heading: 'La barra de métricas',
        paragraphs: [
          'En todas las pantallas verás arriba tus Ingresos, Gastos, Ahorros, Deudas y lo Disponible del mes. Ingresos, Gastos, Ahorros y Deudas son accesos directos al apartado de tu perfil donde se capturan; Disponible es informativo. A la derecha está el selector del mes: al cambiarlo, todo Plaris muestra los datos de ese mes.',
          'Hay tres detalles importantes. La tarjeta Ahorros muestra los renglones de la pestaña Ahorros; para calcular el Disponible, Plaris también descuenta las aportaciones a metas y al fondo de emergencia. Deudas muestra el saldo total que debes, no el pago mensual. Y el pago mensual de tus deudas sí se resta del Disponible, junto con gastos y ahorros.',
        ],
      },
      {
        heading: 'Cosas importantes que debes saber',
        items: [
          'Tus datos se guardan en este navegador con localStorage. No se sincronizan entre dispositivos y, si borras los datos del navegador, se pierden.',
          'Los presupuestos son mensuales y están en pesos mexicanos (MXN). Cada mes tiene sus propios ingresos, gastos y ahorros; el perfil y las deudas son datos actuales que se comparten entre meses.',
          'Las respuestas de IA se generan en tu computadora con Ollama. Si Ollama no está abierto, el chat de Análisis y las consultas de metas no pueden responder.',
          'Si no has registrado movimientos, la serie Real aparece en cero. Eso no significa que hayas cumplido el plan: significa que todavía no hay datos reales de ese mes.',
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
    text: 'Entender unos cuantos conceptos básicos cambia por completo cómo lees tus números. Aquí aprendes qué significa cada cosa, cómo se relacionan tus ingresos, gastos, ahorros y deudas, y qué hábitos funcionan de verdad. Si algo se repite cada mes y parece pequeño, probablemente merece más atención de la que crees.',
    sections: [
      {
        heading: 'Los cuatro conceptos básicos',
        items: [
          'Ingresos: todo el dinero que recibes (sueldo, honorarios, ventas, apoyos, rendimientos). Registra lo que realmente cobras, no lo que “deberías” cobrar.',
          'Gastos: el dinero que sale. Se dividen en fijos (renta, servicios, colegiaturas, transporte; casi no cambian), variables (comida fuera, ropa, salidas; los puedes ajustar) y hormiga (pequeños y frecuentes; los ves en detalle más abajo).',
          'Ahorros: dinero que apartas. Hay dos cosas distintas: la aportación mensual (lo que separas cada mes) y el ahorro actual (el saldo que ya tienes guardado). Para calcular el Disponible, Plaris también cuenta las aportaciones a metas y al fondo de emergencia.',
          'Deudas: dinero que debes. Cada deuda tiene un saldo (cuánto debes hoy), un pago mensual, un pago mínimo y una tasa de interés (cuánto te cuesta tener esa deuda).',
        ],
        callout: {
          label: 'Consejo',
          text: 'Estos cuatro conceptos son la base de todo. Si un dato está mal capturado, todo lo que Plaris calcule después —incluido el Disponible y los planes del Agente— partirá de una base incorrecta.',
        },
      },
      {
        heading: 'Ingreso bruto, ingreso neto y dinero real',
        paragraphs: [
          'No es lo mismo lo que ganas que lo que llega a tu cuenta. El ingreso bruto es el que aparece antes de impuestos y descuentos; el neto es el que realmente recibes. Para presupuestar, usa siempre el neto.',
        ],
        items: [
          'Ingreso bruto: el sueldo antes de ISR, IMSS, aportaciones y otros descuentos. Sirve para comparar ofertas de trabajo, no para planear tu mes.',
          'Ingreso neto: lo que cae en tu cuenta después de descuentos. Es la cifra que debes usar en Plaris.',
          'Ingreso variable: si cobras por honorarios, comisiones o ventas, promedia los últimos 3 a 6 meses y usa una cifra conservadora. Si un mes fue malo, no presupuestes como si todos fueran buenos.',
          'Ingreso extraordinario: aguinaldo, bonos, devoluciones o regalos. No los incluyas en el mes hasta que los recibas; cuando lleguen, decide si van a ahorro, deuda o un gasto específico.',
        ],
        callout: {
          label: 'Ejemplo',
          text: 'Si tu recibo dice $30,000 brutos pero te depositan $24,000, tu presupuesto debe partir de $24,000. Presupuestar $30,000 te hace sentir que tienes $6,000 que en realidad no existen.',
        },
      },
      {
        heading: 'Gastos fijos, variables y gastos hormiga',
        paragraphs: [
          'No todos los gastos se comportan igual. Separarlos te ayuda a saber dónde sí puedes ajustar y dónde no. En Plaris puedes usar nombres claros en la pestaña Gastos para distinguirlos.',
        ],
        items: [
          'Gastos fijos: renta o hipoteca, servicios, colegiaturas, seguros, transporte base. Casi no cambian de un mes a otro y son difíciles de recortar de inmediato.',
          'Gastos variables: comida fuera, despensa, ropa, salidas, entretenimiento, transporte adicional. Cambian cada mes y son el primer lugar donde puedes ajustar.',
          'Gastos hormiga: pequeños, frecuentes y casi invisibles por separado. Un café, un snack, una propina, una app, una suscripción, un cargo de streaming o una compra de impulso. Sumados pueden pesar más que un gasto grande.',
          'Gastos fantasma: suscripciones o cargos que olvidaste que existían. No los usas, pero se cobran cada mes. Revísalos en tu estado de cuenta y cancela lo que no uses.',
          'No todos los gastos hormiga son malos. Si un café diario te da gusto y cabe en tu presupuesto, está bien. El problema es cuando se vuelven automáticos y no decides conscientemente sobre ellos.',
        ],
        callout: {
          label: 'Ejemplo',
          text: 'Un café de $35, cinco veces por semana, son $175 a la semana. Multiplicado por 4.33 semanas son cerca de $758 al mes y unos $9,100 al año. No es un gasto enorme, pero sí es dinero que desaparece sin que lo notes.',
        },
      },
      {
        heading: 'Cómo detectar y controlar los gastos hormiga',
        items: [
          'Revisa los últimos 30 días de tu estado de cuenta y marca todos los cargos pequeños y repetidos. No los juzgues todavía: primero hazlos visibles.',
          'Convierte cada gasto a su costo mensual y anual. Lo semanal se multiplica por 4.33; lo mensual por 12. Así comparas un café con una meta real.',
          'Agrupa por categoría: café y snacks, delivery, apps y suscripciones, transporte corto, compras de impulso. Ver el total por grupo suele ser más revelador que ver cargos sueltos.',
          'Distingue entre gusto consciente y gasto automático. Si lo disfrutas y lo elegiste, puedes conservarlo; si solo lo haces por costumbre, es el primer lugar para ajustar.',
          'Aplica la regla de las 24 horas a compras no esenciales mayores a $500. Si al día siguiente todavía lo quieres y cabe en tu presupuesto, adelante.',
          'Haz una auditoría de suscripciones cada tres meses: cuánto pagas, cuánto usas y cuál puedes cancelar sin perder algo importante.',
          'Asigna un monto semanal para gustos. Cuando el dinero tiene un límite claro, decides mejor y no te sientes en deuda contigo mismo.',
        ],
        callout: {
          label: 'Consejo',
          text: 'No se trata de eliminar todos los gustos. Se trata de que los gustos no decidan por ti. Un gasto hormiga que disfrutas y cabe es distinto de uno que solo ocurre por inercia.',
        },
      },
      {
        heading: 'Gasto necesario y gasto discrecional',
        paragraphs: [
          'Otra forma útil de clasificar es por importancia: lo que necesitas para vivir y cumplir tus compromisos, y lo que puedes reducir o posponer sin poner en riesgo tu estabilidad.',
        ],
        items: [
          'Gasto necesario: vivienda, alimentación básica, salud, servicios, transporte para trabajar, seguros obligatorios y pagos mínimos de deuda. No deberías recortarlo sin una razón muy fuerte.',
          'Gasto discrecional: entretenimiento, salidas, ropa extra, mejoras, hobbies y suscripciones. Aquí está casi siempre el margen de ajuste.',
          'En Plaris, la casilla “Necesario” de la pestaña Gastos marca lo que no deberías recortar. Lo que dejes sin marcar es donde Plaris buscará margen para ajustar tu presupuesto.',
          'No marques todo como necesario. Si todo es indispensable, no queda espacio para ajustar y el plan se vuelve rígido o poco realista.',
          'Necesario no significa intocable. Puedes renegociar la renta, cambiar un servicio, usar menos el auto o buscar una alternativa más barata sin eliminar la necesidad.',
        ],
      },
      {
        heading: 'Tu dinero disponible',
        paragraphs: [
          'Plaris calcula lo Disponible así: Ingresos − Gastos − Ahorros − Pagos de deuda. Es el dinero al que todavía no le has dado un trabajo. Para este cálculo, en Ahorros también cuentan las aportaciones mensuales a metas y al fondo de emergencia; en Deudas se resta el pago mensual, no el saldo total.',
        ],
        items: [
          'Disponible en cero: le asignaste un trabajo a cada peso. Es una muy buena señal, porque nada se “pierde” sin que te des cuenta.',
          'Disponible positivo: te sobra dinero. Puedes aumentar tu ahorro, adelantar deudas o acelerar tu meta.',
          'Disponible negativo: planeas gastar más de lo que ganas. Hay que recortar gastos o aumentar ingresos antes de seguir.',
          'El saldo de una deuda no se resta completo del Disponible. Si debes $50,000 pero pagas $2,000 al mes, lo que afecta tu mes son los $2,000, no los $50,000.',
        ],
        callout: {
          label: 'Ejemplo',
          text: 'Si ganas $30,000, gastas $17,500, apartas $12,500 para ahorro y no tienes deudas, tu Disponible es $0: cada peso tiene destino. Si además pagaras $2,000 de deuda, tu Disponible sería −$2,000 y tendrías que ajustar el plan.',
        },
      },
      {
        heading: 'Ahorro, fondo de emergencia e inversión',
        paragraphs: [
          'Ahorrar, tener un fondo de emergencia e invertir no son lo mismo. Cada uno cumple una función distinta y conviene no mezclarlos.',
        ],
        items: [
          'Ahorro: dinero que apartas para una meta o para seguridad. Debe estar disponible cuando lo necesites.',
          'Fondo de emergencia: dinero separado solo para imprevistos reales. Es tu red de seguridad, no una meta de consumo.',
          'Inversión: dinero que puedes dejar quieto por más tiempo y que acepta cierto riesgo a cambio de un posible rendimiento. No debe usarse para el fondo de emergencia ni para una meta de corto plazo.',
          'Antes de invertir, cubre tu fondo de emergencia y atiende las deudas con intereses altos. Un rendimiento incierto no compensa una deuda del 40% anual.',
          'La reserva protegida de tu perfil es la parte de tu ahorro que no debes tocar para tu meta. Sirve para que un imprevisto no te obligue a vender o endeudarte.',
        ],
        callout: {
          label: 'Ojo',
          text: 'Ahorrar no es invertir, e invertir no reemplaza el fondo de emergencia. Si tu dinero puede necesitarse mañana, no lo pongas en algo que pueda bajar de valor justo cuando lo necesites.',
        },
      },
      {
        heading: 'Fondo de emergencia: tu red de seguridad',
        paragraphs: [
          'Es dinero guardado solo para imprevistos reales: un problema de salud, perder el empleo, una reparación urgente. Evita que un mal momento te obligue a endeudarte.',
        ],
        items: [
          '¿Cuánto? Lo mínimo recomendado son 3 meses de gastos fijos o básicos. Si tus ingresos son variables o tienes dependientes económicos, apunta a 6 meses.',
          '¿Dónde? En una cuenta separada, de fácil acceso y sin riesgo. No en inversiones que puedan perder valor justo cuando lo necesites.',
          '¿Cuándo se usa? Solo en emergencias. Una oferta, un viaje o un gusto no son emergencias.',
          'Si lo usas, repónlo cuanto antes antes de seguir con tu meta.',
          'Si tienes deudas con intereses muy altos, puede tener sentido construir primero un colchón pequeño (por ejemplo, un mes de gastos) y después atacar la deuda. No te quedes sin ningún colchón.',
        ],
        callout: {
          label: 'Ejemplo',
          text: 'Si tus gastos fijos son $8,500 al mes, tu fondo de emergencia ideal es de $25,500 (3 meses). En tu perfil, la “Reserva protegida” es el dinero que Plaris no debe tocar para tu meta.',
        },
      },
      {
        heading: 'Deudas: cómo pensar en ellas',
        items: [
          'Saldo: cuánto debes hoy. Pago mensual: lo que pagas cada mes. Pago mínimo: lo que el banco exige como mínimo. Tasa de interés: cuánto te cuesta tener esa deuda.',
          'La tasa de interés importa más que el monto. Una deuda de $5,000 al 28% anual te cuesta cerca de $117 al mes solo en intereses, dinero que no te acerca a ninguna meta.',
          'Si tu pago mensual es menor que los intereses, el saldo crece aunque pagues. Es una señal de alerta: necesitas aumentar el pago o renegociar la deuda.',
          'Método avalancha: paga primero la deuda con mayor tasa de interés, mientras cubres el mínimo del resto. Es el que menos intereses te cuesta.',
          'Método bola de nieve: paga primero la deuda más pequeña para ganar motivación rápido. Cuesta un poco más en intereses, pero es más fácil de mantener.',
          'El pago mínimo de una tarjeta de crédito casi solo cubre intereses. Si solo pagas el mínimo, la deuda casi no baja.',
          'La utilización del crédito importa: usar más del 30% de tu límite en tarjetas puede encarecer o dificultar futuros créditos.',
          'Como referencia, tus pagos de deuda no deberían superar el 30% o 40% de tu ingreso neto. Si superan ese rango, tu presupuesto se vuelve frágil.',
          'Evita endeudarte para consumo (viajes, aparatos, ropa). Si algo no cabe en tu presupuesto, ahorra para ello.',
          'Registra los pagos de deuda en Deudas y no los repitas en Gastos, o tus números quedarán inflados.',
          'No consolides deudas solo por comodidad: compara la tasa, el CAT y el plazo. A veces el pago baja porque el plazo se alarga y terminas pagando más.',
        ],
      },
      {
        heading: 'Interés: el costo real del crédito',
        paragraphs: [
          'El interés es el precio de usar dinero que no es tuyo. Se expresa como una tasa anual, pero se cobra poco a poco sobre el saldo que debes. Dos créditos con el mismo monto pueden costar muy distinto según su tasa y sus comisiones.',
        ],
        items: [
          'Tasa anual: indica el costo en un año. Para estimar el interés de un mes, una aproximación es dividir la tasa anual entre 12. Un 28% anual equivale a cerca de 2.33% mensual, aunque los bancos pueden calcularlo por día.',
          'Interés simple: se calcula sobre el saldo original. Interés compuesto: se calcula sobre el saldo que ya incluye intereses. En tarjetas de crédito, si no pagas el total, los intereses se acumulan y el saldo puede crecer más rápido de lo que imaginas.',
          'CAT: costo anual total. Incluye intereses, comisiones y otros cargos. Es más útil que la tasa sola para comparar créditos.',
          'Paga el total de tu tarjeta, no el mínimo. El mínimo está diseñado para que la deuda dure; el total evita que los intereses se acumulen.',
          'Adelantar deuda cara es una de las mejores “inversiones” que existen: si una deuda cobra 28% anual, pagarla equivale a obtener ese rendimiento sin riesgo.',
          'Antes de tomar un crédito nuevo, compara CAT, plazo y pago mensual. Un pago cómodo con un plazo muy largo puede costar mucho más al final.',
        ],
        callout: {
          label: 'Ejemplo',
          text: 'Si debes $5,000 al 28% anual, los intereses del mes son aproximadamente $117. Si pagas solo $100, el saldo no baja: sube. Pagar $300 reduce la deuda de verdad.',
        },
      },
      {
        heading: 'Inflación: por qué tu meta puede costar más después',
        paragraphs: [
          'La inflación es el aumento general de precios. Significa que el mismo dinero compra menos con el tiempo. Si tu meta es a varios años, el precio de hoy puede no ser el precio de mañana.',
        ],
        items: [
          'Para metas de corto plazo (menos de un año), normalmente basta con el precio actual y un pequeño margen.',
          'Para metas de varios años, revisa el costo cada año o agrega un margen. Una laptop, un auto o un enganche pueden subir de precio.',
          'El fondo de emergencia debe estar disponible, aunque la inflación le reste poder de compra. Su función principal es la liquidez, no el rendimiento.',
          'Si ahorras en efectivo durante muchos años sin rendimiento, tu dinero pierde valor real cuando la inflación es mayor que el interés que ganas.',
          'No dejes que la inflación te paralice: para metas cercanas, un presupuesto constante y un margen razonable suelen ser suficientes.',
        ],
        callout: {
          label: 'Ejemplo',
          text: 'Si una meta cuesta $22,000 hoy y la inflación ronda el 5% anual, en dos años podría costar cerca de $24,255. Si tu plan no contempla ese aumento, podrías quedarte corto aunque cumplas los depósitos.',
        },
      },
      {
        heading: 'Patrimonio neto: la foto completa',
        paragraphs: [
          'El patrimonio neto es lo que tienes menos lo que debes. Es una foto de tu situación completa, no solo de lo que pasa en un mes.',
        ],
        items: [
          'Activos: efectivo, ahorros, inversiones, propiedades, auto y otros bienes que podrías convertir en dinero.',
          'Pasivos: tarjetas de crédito, préstamos personales, hipoteca, crédito automotriz, deudas con familiares.',
          'Patrimonio neto = activos − pasivos. Puede ser positivo o negativo; lo importante es la dirección en la que se mueve.',
          'Un presupuesto mensual equilibrado no siempre significa un patrimonio sano. Puedes tener flujo positivo y muchas deudas caras.',
          'Revísalo cada 3 o 6 meses. Si baja, revisa si fue por una compra planeada, una emergencia o deuda de consumo.',
          'No todas las deudas son malas: una hipoteca a tasa razonable puede acompañar la compra de un activo. La deuda de consumo con tasa alta es la que más pesa.',
        ],
        callout: {
          label: 'Ejemplo',
          text: 'Si tienes $20,000 en ahorros y debes $50,000 en tarjetas, tu patrimonio neto es −$30,000. Aunque tu presupuesto del mes esté equilibrado, tu foto completa todavía es negativa.',
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
          'Ahorrar por semana funciona mejor que por mes: son pasos pequeños y frecuentes, notas tu avance rápido y un mal mes no echa a perder todo el plan. Además, un año tiene 52 oportunidades de depósito, no solo 12.',
        ],
      },
      {
        heading: 'Cómo convertir una meta en un plan',
        paragraphs: [
          'La fórmula es sencilla: costo de la meta ÷ semanas disponibles = lo que debes apartar cada semana. Si ya tienes ahorrado, resta solo la parte que puedes usar sin tocar tu reserva protegida. Luego compara ese número con lo que realmente puedes ahorrar por semana.',
        ],
        callout: {
          label: 'Ejemplo',
          text: 'Una laptop de $22,000 en 90 días son 12.86 semanas: necesitas apartar cerca de $1,711 por semana. Si tu flujo libre es de $1,386 por semana, el plazo no es realista. Opciones: alargar el plazo, buscar una opción más barata, reducir gastos variables o aumentar tus ingresos.',
        },
        items: [
          'Una meta realista cabe dentro de lo que te sobra después de cubrir gastos, deudas y fondo de emergencia.',
          'Si tu plan exige más de lo que puedes ahorrar, Plaris te lo dirá y te propondrá un plazo o un monto más viable.',
          'Es mejor llegar un poco más tarde que abandonar el plan por exigirte demasiado.',
          'Antes de acelerar una meta, protege tu fondo de emergencia y atiende las deudas con intereses altos.',
        ],
      },
      {
        heading: 'Reglas prácticas de presupuesto',
        items: [
          'Regla 50/30/20: 50% para necesidades (renta, comida, transporte), 30% para gustos y 20% para ahorro y deudas. Es un punto de partida, no una ley; ajústala a tu realidad.',
          'Págate primero a ti: aparta tu ahorro apenas recibas tu dinero, no con lo que sobre al final del mes. Lo que sobra casi nunca alcanza.',
          'Presupuesto de base cero: dale destino a cada peso hasta que tu Disponible llegue a cero.',
          'Separa tus cuentas: una para gastos del día a día y otra para tu ahorro. Lo que no ves, lo gastas menos.',
          'Incluye los gastos anuales: seguros, tenencia, mantenimiento, regalos. Divide el total anual entre 12 y sepáralo cada mes.',
          'Aplica la regla de las 24 horas a compras no planeadas. Si al día siguiente sigue siendo una buena idea, decide con más calma.',
        ],
        callout: {
          label: 'Ejemplo',
          text: 'Con ingresos de $30,000, la regla 50/30/20 sugiere $15,000 en necesidades, $9,000 en gustos y $6,000 en ahorro y deudas.',
        },
      },
      {
        heading: 'Errores comunes',
        items: [
          'Ignorar los gastos pequeños y frecuentes (café, antojos, suscripciones). Sumados pesan mucho.',
          'Contar con ingresos que aún no recibes o presupuestar con el ingreso bruto.',
          'Usar tu fondo de emergencia para metas o compras.',
          'Pagar deudas caras mientras ahorras sin ningún orden.',
          'Presupuestar sin gastos imprevistos: siempre habrá alguno.',
          'No revisar tus números: un presupuesto que nunca se compara contra la realidad no sirve.',
          'Usar el crédito como si fuera ingreso y pagar solo el mínimo de la tarjeta.',
          'No incluir gastos anuales o irregulares, y luego sorprenderte cuando llegan.',
          'Mezclar gastos personales con gastos del negocio o del hogar sin separarlos.',
          'Marcar todos los gastos como “Necesario” y quedarte sin margen para ajustar.',
        ],
      },
      {
        heading: 'Hábitos que funcionan',
        items: [
          'Revisa tus finanzas una vez por semana, solo 10 minutos.',
          'Registra tus movimientos reales en el momento o al final del día.',
          'Cada mes compara Planeado contra Real y ajusta tu presupuesto con base en lo que de verdad pasó.',
          'Automatiza tu ahorro con una transferencia programada el día que cobras.',
          'Haz una auditoría de suscripciones y gastos hormiga cada tres meses.',
          'Usa la regla de las 24 horas antes de una compra no planeada.',
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
    text: 'El Agente es el centro de trabajo de Plaris. Reúne cuatro herramientas para revisar una compra, analizar o crear una meta, generar reportes y registrar movimientos, usando los datos de tu perfil y del mes que tengas seleccionado.',
    sections: [
      {
        heading: 'Qué puedes hacer en el Agente',
        items: [
          'Agente: revisa si te conviene una compra. Escribes qué quieres comprar, cuánto cuesta y, si quieres, el contexto de tu situación.',
          'Metas: analiza una meta que ya tienes o crea una nueva con nombre, costo, plazo, ahorro actual y reserva protegida.',
          'Reportes: genera un reporte de comparación, distribución o avance a partir de una plantilla o de una meta.',
          'Registrar: captura rápida de un gasto o un ingreso con monto y categoría.',
        ],
        callout: {
          label: 'Ojo',
          text: 'El Agente no mueve dinero real ni hace transferencias. Organiza y registra la información que tú confirmas; las decisiones y los pagos siguen siendo tuyos.',
        },
      },
      {
        heading: 'Antes de empezar',
        ordered: true,
        items: [
          'Completa Mi perfil → Perfil y meta: nombre de tu meta, costo, plazo en días, ahorro actual y reserva protegida.',
          'Captura tus ingresos, gastos, ahorros y deudas del mes en las demás pestañas del perfil. Mientras más completos estén, mejor será el contexto.',
          'Confirma el mes en la barra superior. El atajo Agente revisa compras con tus movimientos reales de ese mes; metas y reportes usan el presupuesto y tus datos de perfil y deudas.',
          'Si vas a usar las respuestas de IA, abre Ollama en tu computadora. Sin él, las consultas que dependen del modelo no pueden responder.',
        ],
      },
      {
        heading: 'Atajo Agente: ¿te conviene comprar algo?',
        items: [
          'Escribe qué quieres comprar. Por ejemplo: “Audífonos inalámbricos”.',
          'Indica el precio en pesos mexicanos. Es el dato principal para revisar el impacto en tu economía.',
          'Agrega contexto opcional: si está en oferta, si este mes tienes gastos extra, si tienes deuda o si dudas entre comprarlo o esperar.',
          'La revisión usa los ingresos, gastos y ahorros reales que registraste en Movimientos para ese mes, no el presupuesto planeado. Si aún no hay ingresos reales registrados, Plaris te lo dirá y no podrá confirmar la compra.',
          'Presiona el botón de enviar o usa Enter. Shift + Enter agrega un salto de línea si necesitas escribir más.',
        ],
        callout: {
          label: 'Ejemplo',
          text: '“Audífonos inalámbricos, $2,500. Los vi en oferta, pero este mes tengo gastos de regreso a clases y una tarjeta con deuda. No sé si me conviene comprarlos ahora.”',
        },
      },
      {
        heading: 'Atajo Metas: analiza o crea una meta',
        items: [
          'Meta existente: elige una meta de la lista. Los campos de costo, plazo, ahorro y reserva se llenan solos y no se editan ahí. Después presiona “Analizar meta”.',
          'Crear meta nueva: escribe el nombre, el costo, el plazo en días, el ahorro que ya tienes y la reserva protegida. Después presiona “Crear y analizar meta”.',
          'Al confirmar una meta nueva, Plaris la guarda junto con tus datos y la revisa contra tu presupuesto.',
          'La reserva protegida es dinero que no debe usarse para la meta. No puede ser mayor que el ahorro actual.',
        ],
        callout: {
          label: 'Consejo',
          text: 'Un plazo de 90 días es un buen punto de partida para metas pequeñas. Para compras grandes, usa un plazo realista: un plan demasiado ambicioso suele abandonarse antes de terminar.',
        },
      },
      {
        heading: 'Atajo Reportes: tres formas de ver tu dinero',
        items: [
          'Primero elige una plantilla o una meta. Si todavía no tienes ninguna, el selector estará vacío: crea una meta o guarda una plantilla antes de pedir un reporte.',
          'Reporte de comparación: muestra lo planeado contra lo real. Sirve para ver si tu presupuesto se está cumpliendo.',
          'Reporte de distribución: muestra en qué se reparte tu dinero. Sirve para ver qué categoría se lleva la mayor parte.',
          'Reporte de tracking: muestra cómo avanzas con el tiempo. Sirve para revisar si tu plan va por buen camino.',
        ],
      },
      {
        heading: 'Atajo Registrar: captura rápida',
        items: [
          'Elige si vas a registrar un gasto o un ingreso.',
          'Escribe el monto y elige una categoría. En gastos puedes usar Vivienda, Alimentos, Transporte, Servicios, Salud, Educación, Entretenimiento, Ropa y calzado, Suscripciones u Otros. En ingresos: Sueldo, Honorarios, Ventas o negocio, Apoyos y becas, Rendimientos, Regalos u Otros.',
          'Guarda el movimiento. Para capturar la fecha, una descripción o editar y eliminar registros, usa la página Movimientos.',
        ],
        callout: {
          label: 'Consejo',
          text: 'Registrar en el momento evita que se te olviden los gastos pequeños. Si dejas todo para fin de mes, los gastos hormiga son los primeros que desaparecen de tu memoria.',
        },
      },
      {
        heading: 'El panel Cada peso cuenta',
        items: [
          'A la izquierda del Agente está el panel “Cada peso cuenta”, con dos gráficas: “Lo que planeas” y “Lo que llevas”.',
          'Las gráficas comparan ingresos, gastos y ahorros del mes. Puedes arrastrarlas hacia arriba o abajo para cambiar su orden.',
          'La flecha del borde abre y cierra el panel. Cuando lo cierras, el formulario del Agente se centra y aprovecha todo el ancho.',
          'El panel tiene su propio desplazamiento. Si tu pantalla es pequeña, revisa las gráficas y luego vuelve al formulario.',
          'El botón “Ver tablas y gráficas” te lleva a la sección completa con las tablas y las gráficas circulares.',
        ],
      },
      {
        heading: 'Cómo obtener mejores resultados',
        items: [
          'Sé específico: menciona si tus ingresos son irregulares, si tienes deudas o si se acercan gastos grandes.',
          'Mantén tus datos al día: el Agente solo trabaja con lo que tú capturas.',
          'Revisa el mes seleccionado antes de pedir un análisis. Un dato de otro mes cambia por completo la respuesta.',
          'Si cambias tus datos o el mes, el Agente reinicia su formulario para no mostrarte un resultado desactualizado.',
          'Compara sus cifras con tus tablas. La IA puede equivocarse y es buena práctica verificar.',
        ],
      },
      {
        heading: 'Qué no hace el Agente',
        items: [
          'No mueve dinero, no hace pagos ni transferencias.',
          'No modifica tus datos por su cuenta: cuando creas una meta o registras un movimiento, el cambio se guarda porque tú lo confirmaste.',
          'No conoce información que no hayas capturado. Si falta un gasto o una deuda, su análisis estará incompleto.',
          'Puede equivocarse. Si una respuesta te parece rara, compárala con tus tablas y corrige los datos antes de tomar una decisión.',
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
    text: 'Aquí ves tus finanzas de un vistazo y comparas lo que planeaste contra lo que realmente pasó. También es el punto de entrada para registrar tus movimientos reales.',
    sections: [
      {
        heading: 'Planeado vs. Real',
        items: [
          'Planeado: el presupuesto que guardaste en tu perfil para ese mes (ingresos, gastos y ahorros). Es tu intención.',
          'Real: los movimientos que registraste con fecha en ese mes. Es lo que de verdad ocurrió.',
          'La comparación usa Ingresos, Gastos y Ahorros. Las metas y el fondo de emergencia se administran aparte y no aparecen como una barra en esta comparación.',
        ],
        callout: {
          label: 'Ojo',
          text: 'Un Real en cero no significa que cumpliste tu plan, sino que todavía no registraste movimientos de ese mes.',
        },
      },
      {
        heading: 'Qué puedes hacer aquí',
        items: [
          'Cambiar entre Gráficas y Tablas con importes. Ambas muestran la misma información, solo cambia cómo la ves.',
          'Arrastrar las tarjetas para ordenarlas a tu manera.',
          'Usar “Ayúdame a entender mis datos” para abrir el Análisis con el mes que estás viendo.',
          'Usar “Registrar movimientos” para capturar tus ingresos, gastos y ahorros reales.',
          'Cambiar el mes con el selector de la barra superior. Todo Plaris se mueve a ese mes.',
        ],
      },
      {
        heading: 'Cómo leer cada gráfica',
        items: [
          'Planeado y real (barras): compara lado a lado lo planeado contra lo real para ingresos, gastos y ahorros. Es la vista más rápida para detectar diferencias.',
          'Ingresos, Gastos y Ahorros (circulares): muestran cómo se reparte tu presupuesto planeado. Te dicen qué porción se lleva cada concepto.',
          'Deudas: muestra el saldo que debes registrado en tu perfil. El tamaño de la gráfica representa el saldo, no el pago mensual.',
          'Si una gráfica está vacía, revisa si registraste conceptos en tu perfil o si el mes seleccionado tiene datos.',
        ],
      },
      {
        heading: 'Cómo leer las tablas',
        items: [
          'La tabla “Planeado y real” muestra cuatro columnas: Tipo, Planeado, Real y Real menos planeado.',
          'Las tablas de cada sección muestran el concepto y su monto mensual. En Deudas verás el saldo y el pago mensual de cada deuda.',
          'Los totales también son mensuales. No los compares con un ingreso quincenal o semanal sin convertirlo primero.',
          'Puedes usar las tablas para encontrar la categoría exacta que se salió del plan, y luego volver a las gráficas para ver el panorama completo.',
        ],
      },
      {
        heading: 'Cómo registrar movimientos reales',
        ordered: true,
        items: [
          'Presiona “Registrar movimientos” o abre la página Movimientos desde el menú.',
          'Elige el tipo: Ingreso, Gasto o Ahorro.',
          'Escribe una categoría. Plaris te sugiere las categorías que ya usas en tu presupuesto, pero puedes escribir otra.',
          'Agrega una descripción si quieres recordar el detalle.',
          'Captura el importe y la fecha. La fecha decide a qué mes pertenece el movimiento.',
          'Guarda. El movimiento se suma a la serie Real de su mes y no cambia tu presupuesto planeado.',
        ],
        callout: {
          label: 'Consejo',
          text: 'Registra tus movimientos todos los días o al menos una vez por semana. Si lo dejas para fin de mes, olvidarás gastos pequeños y el Real quedará incompleto.',
        },
      },
      {
        heading: 'Cómo interpretar la diferencia',
        paragraphs: [
          'En las tablas verás “Real menos planeado”. El signo significa cosas distintas según el tipo:',
        ],
        items: [
          'Ingresos: si es negativo, recibiste menos de lo que esperabas (o aún no lo registras). Si es positivo, recibiste más.',
          'Gastos: si es positivo, gastaste más de lo planeado. Es una señal para revisar ese concepto. Si es negativo, gastaste menos; revisa que no hayas omitido un gasto necesario.',
          'Ahorros: si es negativo, ahorraste menos de lo que te propusiste. Si es positivo, ahorraste más.',
          'Deudas: no tiene una columna de Real como las otras secciones. La tabla muestra el saldo y el pago mensual que tienes registrados actualmente.',
        ],
      },
      {
        heading: 'Tips',
        items: [
          'Si un gasto siempre supera lo planeado, el problema suele ser un presupuesto poco realista, no tu disciplina. Ajusta el monto planeado.',
          'Revisa primero las barras para ver el panorama y luego baja a las tablas para encontrar dónde están las diferencias.',
          'Haz esta revisión cada semana, no solo a fin de mes: corregir a tiempo es mucho más fácil.',
          'Cambia el mes para comparar tendencias. Un mes malo no define tu situación; una racha de tres meses sí dice algo.',
          'Si un mes no tiene movimientos, no lo interpretes como un mes perfecto: probablemente falta registrarlo.',
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
    text: 'El Análisis es un chat con Plaris para entender tus propios números. No arma planes de compra ni metas (eso lo hace el Agente): aquí le preguntas qué significan tus tablas y gráficas del mes.',
    sections: [
      {
        heading: 'Cómo usarlo',
        ordered: true,
        items: [
          'Elige el mes en la barra superior.',
          'En “Datos que recibirá Plaris” marca las secciones que quieres analizar: Ingresos, Gastos, Ahorros y Deudas. Al entrar, Ingresos y Gastos vienen marcados.',
          'Revisa tus datos en las pestañas Tablas o Gráficas para ubicar lo que te interesa.',
          'Escribe tu pregunta en el chat y presiona “Preguntar a Plaris”.',
          'Si la respuesta te sirve, presiona “Guardar este análisis” para consultarla después en el menú lateral.',
        ],
      },
      {
        heading: 'Qué datos recibe Plaris',
        items: [
          'Solo recibe las secciones que tienes marcadas. Si desmarcas Deudas, el chat no sabrá nada de tus deudas.',
          'Si marcas Ahorros, también recibe tus metas y tu fondo de emergencia, porque forman parte de tu estrategia de ahorro.',
          'El chat usa el presupuesto planeado y los movimientos reales del mes seleccionado.',
          'Si no marcas ninguna sección, el chat se desactiva. Marca al menos una para comenzar.',
        ],
        callout: {
          label: 'Ojo',
          text: 'El chat no “adivina” lo que no le compartes. Si una respuesta parece incompleta, revisa si falta marcar una sección o si el mes no tiene datos registrados.',
        },
      },
      {
        heading: 'Privacidad: tú decides qué ve la IA',
        paragraphs: [
          'Plaris solo envía al modelo las secciones que tienes marcadas. Con la configuración predeterminada, todo se procesa localmente con Ollama en tu propia computadora: tus datos no se mandan a un servicio en la nube desde Plaris.',
        ],
      },
      {
        heading: 'Preguntas que puedes hacer',
        items: [
          '“¿Cuál es mi mayor gasto y cuánto representa de mis ingresos?”',
          '“Explícame la diferencia entre planeado y real de este mes.”',
          '“¿En qué estoy gastando más de lo que planeé?”',
          '“¿Qué porcentaje de mis ingresos estoy ahorrando?”',
          '“¿Cuánto me cuestan mis deudas cada mes?”',
          '“¿Mi fondo de emergencia cubre los meses que necesito?”',
          '“¿Qué gastos variables podría ajustar sin tocar los necesarios?”',
          '“¿Qué gastos pequeños se repiten y podrían ser gastos hormiga?”',
          '“Si quiero ahorrar $500 más al mes, ¿de dónde podría salir?”',
        ],
      },
      {
        heading: 'Cómo escribir una buena pregunta',
        items: [
          'Menciona el concepto y el mes: “En octubre, ¿por qué mis gastos de Alimentos subieron?” es mejor que “¿estoy bien?”.',
          'Pide una comparación concreta: “¿Cuánto más gasté en Transporte que lo planeado?”.',
          'Pide un siguiente paso: “¿Qué ajuste me recomiendas para el próximo mes?”.',
          'Si la respuesta es muy general, vuelve a preguntar con el número o la categoría exacta.',
        ],
      },
      {
        heading: 'Nueva conversación',
        paragraphs: [
          'Si cambias los datos, la selección de secciones o el mes, el chat inicia una conversación nueva. Esto evita que Plaris responda con información que ya no corresponde a lo que ves. Si una respuesta te interesa, guárdala antes de cambiar la selección.',
        ],
      },
      {
        heading: 'Historial',
        paragraphs: [
          'Los análisis guardados están en el menú lateral, dentro de “Análisis guardados”. Presiona “Ver historial” para desplegar la lista. Cada registro muestra el mes y la fecha en que lo guardaste; al abrirlo ves la conversación completa. Se conservan hasta 50 análisis.',
          'También puedes guardar una conversación desde el botón “Guardar este análisis”, que aparece después de que Plaris responde. No se guarda automáticamente: si no lo guardas, la conversación se pierde al cambiar de contexto.',
        ],
      },
      {
        heading: 'Qué no hace el chat',
        items: [
          'No modifica tus datos ni guarda cambios en tu presupuesto. Si le pides cambiar algo, te indicará en qué sección de tu perfil hacerlo.',
          'No ve las secciones que no marcaste.',
          'No recuerda conversaciones anteriores entre sesiones; solo lo que guardaste en el historial.',
          'Puede equivocarse. Si una respuesta te parece rara, compárala con tus tablas y verifica las cifras.',
          'No sustituye a un asesor financiero profesional.',
        ],
      },
      {
        heading: 'Análisis vs. Agente',
        items: [
          'Análisis: para entender tus números actuales (“¿qué significa esto?”).',
          'Agente: para revisar una compra, analizar o crear una meta, generar reportes o registrar un movimiento (“¿puedo lograr esto y cómo?”).',
          'Ambos usan el mes seleccionado, pero con propósitos distintos. Si quieres entender el pasado y el presente, usa Análisis; si quieres planear una acción, usa Agente.',
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
    text: 'Tu perfil es el punto de partida de Plaris: ahí capturas tu presupuesto, tus deudas y tu meta principal. Las plantillas te permiten guardar esa configuración y reutilizarla en otro momento.',
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
          'Los movimientos reales viven aparte del presupuesto. No los borras al cambiar de mes ni al aplicar una plantilla.',
        ],
      },
      {
        heading: 'Cómo llenar Ingresos, Gastos y Ahorros',
        ordered: true,
        items: [
          'Entra a la pestaña y agrega un renglón por cada concepto (por ejemplo: Sueldo, Renta, Ahorro para vacaciones).',
          'Escribe el importe mensual de cada uno, en pesos. Si un gasto es anual, divide el total entre 12.',
          'En Gastos, marca la casilla “Necesario” solo para lo que no deberías recortar. Esa marca ayuda a distinguir lo indispensable de lo ajustable.',
          'Guarda los cambios.',
          'Revisa la barra superior: tus totales y lo Disponible se actualizan.',
        ],
        callout: {
          label: 'Consejo',
          text: 'Separa tus gastos fijos de los variables usando nombres claros. Así es más fácil saber qué puedes recortar y qué no. No marques todo como necesario: si todo es indispensable, no hay margen de ajuste.',
        },
      },
      {
        heading: 'Cómo llenar Deudas',
        items: [
          'Registra cada deuda por separado con su nombre o institución.',
          'Saldo pendiente: cuánto debes hoy, no el monto original del crédito.',
          'Pago mensual: lo que pagas cada mes. Pago mínimo: lo que el banco exige como mínimo. Tasa de interés: el porcentaje que te cobran.',
          'Indica si la tasa es anual o mensual. La mayoría de los créditos se expresa en tasa anual, pero revisa tu contrato.',
          'No repitas ese pago en Gastos: Plaris ya lo descuenta de tu Disponible.',
          'Actualiza el saldo conforme vayas pagando. Si tu pago mensual es menor que los intereses, el saldo puede crecer.',
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
          'Reserva protegida (MXN): dinero que no debe tocarse para la meta, como tu fondo de emergencia. No puede ser mayor que el ahorro actual.',
        ],
        callout: {
          label: 'Ojo',
          text: 'Presiona “Guardar perfil” al terminar. Si cambias de pestaña sin guardar, pierdes los cambios.',
        },
      },
      {
        heading: 'Dónde quedan las metas y el fondo de emergencia',
        paragraphs: [
          'La configuración inicial te permite crear varias metas y un fondo de emergencia. Esos datos se guardan con tu presupuesto mensual y se conservan en las plantillas. En “Perfil y meta” administras la meta principal que usa el Agente; las metas adicionales y el fondo de emergencia viajan dentro de tu presupuesto y de tus plantillas.',
        ],
      },
      {
        heading: 'Plantillas: qué son y para qué sirven',
        paragraphs: [
          'Una plantilla es una copia guardada de tu presupuesto del mes, tus deudas y tu perfil (incluida tu meta principal). Te sirve para volver a una configuración que ya funcionó o para probar escenarios sin perder tus datos originales.',
        ],
        items: [
          'Un mes normal que repites cada mes.',
          'Un mes de vacaciones o con gastos extra.',
          'Un escenario de recorte para ver cómo cambiaría tu meta.',
          'Una base para comparar dos formas de organizar tu dinero.',
        ],
      },
      {
        heading: 'Cómo crear y usar plantillas',
        ordered: true,
        items: [
          'Deja tu presupuesto como quieres guardarlo y elige el mes correcto.',
          'Abre el menú lateral con el botón Φ y presiona “Nueva plantilla”.',
          'Ponle un nombre claro y presiona “Guardar plantilla”.',
          'Tus plantillas aparecen en “Plantillas guardadas” dentro del menú lateral y en la página Mis plantillas.',
          'Para usarla, abre la página Mis plantillas, presiona “Usar en [mes]” y confirma “Aplicar esta copia”.',
        ],
        callout: {
          label: 'Ojo',
          text: 'Aplicar una plantilla reemplaza el presupuesto del mes seleccionado, tus deudas y tu perfil. Tus movimientos reales no se borran: se conservan siempre.',
        },
      },
      {
        heading: 'El menú lateral',
        paragraphs: [
          'Se abre y se cierra con el botón Φ del encabezado o con el botón “Menú PLARIS” que aparece dentro del panel. Contiene:',
        ],
        items: [
          'Acciones: “Nueva plantilla” y “Análisis de tus datos”.',
          'Análisis guardados: el desplegable “Ver historial” con tus conversaciones guardadas.',
          'Plantillas guardadas: la lista de tus presupuestos reutilizables.',
          'Un acceso a tu perfil, pegado al fondo del menú.',
        ],
      },
      {
        heading: 'Buenas prácticas',
        items: [
          'Actualiza tu perfil al inicio de cada mes, antes de pedirle un plan al agente.',
          'Si tus ingresos cambian, actualízalos de inmediato: todo el análisis depende de ese dato.',
          'Guarda una plantilla antes de hacer cambios grandes, por si quieres regresar.',
          'Usa nombres claros y consistentes en tus categorías para que las tablas y gráficas sean fáciles de leer.',
          'Revisa tus deudas cada mes y actualiza el saldo. Un saldo viejo hace que el Disponible y los análisis sean incorrectos.',
        ],
      },
    ],
    link: '/plantillas',
    action: 'Ir a mis plantillas',
  },
];
