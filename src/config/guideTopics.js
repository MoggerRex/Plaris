export const guideTopics = [
  {
    id: 'inicio',
    title: 'Guía Plaris',
    text: 'En Presupuesto puedes ajustar lo planeado y registrar tus ingresos, gastos y aportaciones reales en la misma pantalla. Después consulta el agente o explora los gráficos. Tus datos se guardan en este navegador; no se sincronizan entre dispositivos.',
    link: '/perfil',
    action: 'Abrir presupuesto',
  },
  {
    id: 'finanzas',
    title: 'Finanzas',
    text: 'Los ingresos son el dinero que recibes; los gastos son las salidas recurrentes. El ahorro planeado es lo que apartarás cada mes y el ahorro actual es el saldo que ya tienes. Registra los pagos de deuda en Deudas y evita duplicarlos en Gastos.',
  },
  {
    id: 'agente',
    title: 'Agente',
    text: 'Define una meta, su costo, plazo, ahorro actual y reserva protegida en tu perfil. El agente calcula tu presupuesto y usa Ollama para explicar opciones.',
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
    title: 'Tu presupuesto y plantillas',
    text: 'Presupuesto reúne lo planeado y los movimientos reales del mes. Guarda una plantilla de tus ingresos, gastos y ahorros planeados para reutilizarlos. Al aplicarla se reemplaza únicamente lo planeado del mes elegido y se actualiza la comparación. Tus movimientos reales, meta y deudas se conservan.',
    link: '/plantillas',
    action: 'Mis plantillas',
  },
];
