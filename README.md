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
