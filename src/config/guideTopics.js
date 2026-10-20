export const guideTopics = [
  {
    id: 'inicio',
    title: 'Guía Plaris',
    text: 'Empieza en tu perfil: registra ingresos, gastos, ahorros y deudas. Después consulta el agente o explora los gráficos. Tus datos se guardan en este navegador; no se sincronizan entre dispositivos.',
    link: '/perfil/resumen',
    action: 'Abrir mi perfil',
  },
  {
    id: 'finanzas',
    title: 'Finanzas',
    text: 'Los ingresos son el dinero que recibes; los gastos son las salidas recurrentes. El ahorro planeado es lo que apartarás cada mes y el ahorro actual es el saldo que ya tienes. Registra los pagos de deuda en Deudas y evita duplicarlos en Gastos.',
  },
  {
    id: 'agente',
    title: 'Agente',
    text: 'Define una meta, su costo, plazo, ahorro actual y reserva protegida en tu perfil. El agente calcula tu presupuesto y usa Ollama para explicar opciones. Estándar ofrece un resumen; Avanzado analiza deudas y alternativas con mayor detalle.',
    link: '/dashboard',
    action: 'Abrir el agente',
  },
  {
    id: 'graficas',
    title: 'Tablas y gráficas',
    text: 'Planeado representa el presupuesto mensual registrado. Real representa los movimientos que añadiste para ese mes. Puedes cambiar entre gráficas y tablas; ambas muestran la misma información. Un real en cero significa que aún no hay movimientos registrados, no que ya cumpliste tu plan.',
    link: '/graficas',
    action: 'Explorar mis datos',
  },
  {
    id: 'analisis',
    title: 'Análisis',
    text: 'Selecciona ingresos, gastos, ahorros o deudas y pregunta al chat qué significan. Cambiar los datos o la selección inicia una nueva conversación. Guarda las respuestas útiles para consultarlas en el historial.',
    link: '/analisis',
    action: 'Abrir el chat de análisis',
  },
  {
    id: 'perfil',
    title: 'Tu perfil y plantillas',
    text: 'Los botones del resumen te llevan al apartado correspondiente del perfil. Los presupuestos son mensuales; el perfil y las deudas son datos actuales compartidos. Guarda una plantilla para copiar presupuesto, deudas y meta. Aplicarla reemplaza los datos indicados; los movimientos reales se conservan.',
    link: '/plantillas',
    action: 'Mis plantillas',
  },
];
