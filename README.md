# 📊 Plaris

> *Inspirado en la filosofía y el pensamiento lógico de Platón y Aristóteles.*

Plaris es una aplicación web de finanzas personales para planear presupuestos, registrar movimientos y comparar los importes planeados con los reales.

## Presupuesto personal

La aplicación abre directamente el onboarding de presupuesto base cero, sin registro ni inicio de sesión. El onboarding solo se completa una vez; después se puede administrar el presupuesto desde el dashboard.

- El presupuesto se guarda en `localStorage` en este navegador.
- Los presupuestos mensuales se crean desde una plantilla y se mantienen independientes entre meses.
- Los movimientos reales se almacenan por separado de los importes planeados.
- Si sobra dinero en el onboarding, se puede asignar a ahorro adicional o reservar como dinero libre para gastos no planeados.
- Los importes del presupuesto se calculan en centavos enteros y se presentan como MXN.
- El estado y acceso a datos están aislados en `src/context/` y `src/services/` para facilitar una futura integración con una API.
- La interfaz no carga hojas de estilo ni usa estilos en línea; el diseño se puede incorporar posteriormente con Tailwind CSS.

Para iniciar localmente: `npm install` y `npm run dev`. La aplicación no requiere backend.

## Asesor financiero local

El dashboard permite consultar a Ollama con el presupuesto y los movimientos del mes seleccionado. Requiere Ollama ejecutándose en `http://localhost:11434` y el modelo `llama3.1:8b` instalado (`ollama pull llama3.1:8b`). El navegador debe tener permitido el acceso a Ollama desde el origen de Vite.

`src/utils/selectores.js` genera el contexto del asesor con ingresos, gastos, ahorros y detalles de los movimientos en pesos MXN. El estado y `formatCurrency` siguen trabajando en centavos. `balanceActual` resta gastos a ingresos; `disponibleActual` también descuenta ahorro.

El estado incluye `deudas_activas` y `metas_financieras`, inicialmente vacíos, sin formulario de edición todavía. Si no hay una meta, el asesor recibe una solicitud de ajuste de presupuesto. Los objetivos de ahorro del onboarding siguen siendo partidas mensuales, no metas con costo y plazo.

Validación del selector: `node --test src/utils/selectores.test.js`.

---

## 🛠️ Tecnologías y Arquitectura

- **Frontend:** React, React Router y Vite
- **Gráficas:** Recharts
- **Presupuesto local:** Context API y `localStorage`, separado por mes


---

<p center="align">
  <sub>Desarrollado con 💚 para el control total de tus finanzas personales.</sub>
</p>

https://excelfind.com/excel-templates/ultimate-excel-personal-budget-base/?ds24tr=yt
