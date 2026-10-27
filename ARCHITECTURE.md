# Arquitectura de Plaris

## Cómo repartir el trabajo

| Sección                                    | Pantalla                  | Componentes principales                        |
| ------------------------------------------ | ------------------------- | ---------------------------------------------- |
| Agente                                     | src/pages/Dashboard.jsx   | src/components/agent/                          |
| Perfil, ingresos, gastos, ahorros y deudas | src/pages/Profile.jsx     | src/components/profile/ y BudgetRowsEditor.jsx |
| Tablas y gráficas                          | src/pages/Charts.jsx      | src/components/finance/                        |
| Análisis, chat e historial                 | src/pages/Analysis.jsx    | src/components/analysis/                       |
| Plantillas                                 | src/pages/Templates.jsx   | src/components/templates/                      |
| Guía                                       | src/pages/Guide.jsx       | src/components/guide/                          |
| Movimientos reales                         | src/pages/Movimientos.jsx | src/components/transactions/                   |
| Navegación y estructura                    | src/App.jsx               | src/components/layout/ y Navbar.jsx            |

Cada integrante puede trabajar en la carpeta de su sección. Eviten agregar lógica de otras funciones a Dashboard.

## Flujo de datos

BudgetProvider es el estado compartido y persiste en localStorage (plaris-budget-v1). No hay sincronización de cuentas ni servidor de datos.

- monthlyBudgets: ingresos, gastos y aportaciones de ahorro por mes, en centavos.
- transactions: movimientos reales por fecha, también en centavos.
- profile: nombre, meta, plazo, ahorro actual y reserva, compartidos entre meses.
- deudas_activas: saldo, pago, mínimo y tasa; montos en MXN. Los pagos se descuentan una sola vez en el motor. No duplicarlos como gastos.
- savedTemplates: copias de presupuesto, deudas y perfil. Aplicar reemplaza el mes destino, perfil y deudas; conserva los movimientos reales.
- analysisHistory: hasta 50 conversaciones guardadas con una copia de su contexto.

No cambien las unidades dentro de componentes. financeAdapter.js convierte centavos a MXN para el motor y el chat. Los cálculos deterministas están en domain/planner.js.

## Responsabilidades

- pages/: composición de pantallas y navegación.
- components/: presentación y edición de una función concreta.
- hooks/: acceso al mes seleccionado y solicitudes cancelables a Ollama.
- services/: persistencia, adaptación de datos y peticiones HTTP.
- config/: secciones y tipos compartidos.
- styles/: estilos por sección y reglas adaptables; styles.css solo importa las hojas.

Los formularios tienen un borrador local; Guardar confirma el cambio al estado compartido. Los botones del resumen enlazan a /perfil/incomes, /perfil/expenses, /perfil/savings y /perfil/debts. Los enlaces conservan ?mes=AAAA-MM. La ruta antigua /presupuesto/:section redirige al perfil.

El chat usa /api/chat con respuesta progresiva y recibe el contexto completo del mes (presupuesto, movimientos, perfil, deudas, metas y fondo de emergencia), con los últimos 12 mensajes. Las pestañas, filtros y páginas solo cambian la vista, no reducen los datos enviados. Consultar filas prepara una pregunta editable sin enviarla automáticamente. Al cambiar el mes o los datos se inicia una conversación nueva. El agente usa /api/generate con validación de propuestas. Ambos cancelan la petición al salir de la pantalla y tienen un límite de espera; el chat también permite detener una respuesta. Un fallo de Ollama no bloquea editar o visualizar datos.

Análisis incluye los movimientos del mes con fecha, categoría, descripción y monto convertido a MXN. analysisMovements.js calcula el desglose por categoría y descripción, sus porcentajes y un escenario hipotético de reducción a la mitad. Una categoría necesaria no implica que todas sus compras lo sean: el chat debe distinguirlas por su descripción, respetar la prioridad no negociable definida únicamente en el presupuesto planeado y pedir detalle cuando falte información. El campo Descripción se captura y edita desde Presupuesto y Movimientos; no se reclasifican ni modifican gastos desde el chat.

El dashboard de Análisis no muestra KPI y organiza tres paneles intercambiables: chat, datos con pestañas y detalle de categoría. En escritorio se ajustan ancho y altura con separadores; las flechas y los separadores también aceptan teclado. La distribución se persiste en plaris-analysis-layout-v1, separada de los datos financieros. Ampliar o mover paneles conserva el chat. En móvil los paneles se apilan y las tablas mantienen desplazamiento local.

La primera pestaña de datos es Planeado vs. real y reutiliza ComparisonTable en modo compacto. Conserva los estados de ingresos, gastos y ahorros; su botón prepara una pregunta para explicar las diferencias. Los cambios de pestaña usan transiciones de 200 ms como la Guía, y los paneles animan su posición al reorganizarse. Ambas animaciones respetan la preferencia de movimiento reducido.

## Desarrollo

- npm run dev: servidor local.
- npm run build: compilación de producción.
- npm run lint: revisión de código.
- npm run format: formato legible para todo src.
- npm run format:check: comprobar formato.
- npm test: pruebas del motor y adaptación de datos.

Copien .env.example a .env si necesitan cambiar host o modelos de Ollama. No suban datos financieros personales ni archivos .env.

El diseño ocupa el ancho disponible y usa cuadrículas fluidas. En móvil la navegación y los formularios se reorganizan; las tablas tienen desplazamiento local horizontal. No usen alturas fijas de página ni escondan el desbordamiento para tapar contenido.
