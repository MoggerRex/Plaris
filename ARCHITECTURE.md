
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

El chat usa /api/chat y recibe solo las secciones seleccionadas, con los últimos 12 mensajes. Al cambiar el contexto se inicia una conversación nueva. El agente usa /api/generate con validación de propuestas. Ambos cancelan la petición al salir de la pantalla y tienen un límite de espera. Un fallo de Ollama no bloquea editar o visualizar datos.

## Desarrollo

- npm run dev: servidor local.
- npm run build: compilación de producción.
- npm run lint: revisión de código.
- npm run format: formato legible para todo src.
- npm run format:check: comprobar formato.
- npm test: pruebas del motor y adaptación de datos.

Copien .env.example a .env si necesitan cambiar host o modelos de Ollama. No suban datos financieros personales ni archivos .env.

El diseño ocupa el ancho disponible y usa cuadrículas fluidas. En móvil la navegación y los formularios se reorganizan; las tablas tienen desplazamiento local horizontal. No usen alturas fijas de página ni escondan el desbordamiento para tapar contenido.
