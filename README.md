# 📊 Plaris

> *Inspirado en la filosofía y el pensamiento lógico de Platón y Aristóteles.*

Plaris es una plataforma web inteligente de gestión financiera personal impulsada por Inteligencia Artificial local. Ayuda a los usuarios a controlar sus gastos, proyectar metas de ahorro y tomar decisiones financieras fundamentadas mediante análisis interactivos y visualizaciones gráficas.

---

## 🎨 Paleta de Colores (Brand UI)

| Color | Código Hex | Vista Previa | Descripción |
| :--- | :--- | :--- | :--- |
| **Turquesa Negro** | `#106057` | ![#106057](https://via.placeholder.com/15/106057/000000?text=+) `#106057` | Color primario / Titulos / Fondos oscuros y contrastes |
| **Turquesa** | `#34b8a9` | ![#34b8a9](https://via.placeholder.com/15/34b8a9/000000?text=+) `#34b8a9` | Header / Color secundario / Subtitulos/ Acentos e indicadores principales |
| **Turquesa pastel apagado** | `#abe0da` | ![#abe0da](https://via.placeholder.com/15/abe0da/000000?text=+) `#abe0da` | Color para cajas de formularios |
| **Gris Claro** | `#fafafa` | ![#fafafa](https://via.placeholder.com/15/fafafa/000000?text=+) `#fafafa` | Fondo general de interfaz y tarjetas |
| **Amarillo** | `#ffd53f` | ![#ffd53f](https://via.placeholder.com/15/ffd53f/000000?text=+) `#ffd53f` | Destacados, alertas y llamadas a la acción (CTA) |

---

## 🚀 Funcionalidades Principales

- 💬 **Chat Financiero Inteligente:** Asistente de IA para responder dudas rápidas, estructurar presupuestos y analizar datos en tiempo real.
- 🤖 **IA Activa:** Asistencia automatizada sobre tus registros reales para optimizar tu flujo de dinero.
- 📈 **Gráficas y Tablas Interactivas:** Desglose completo de Entradas, Gastos y Ahorros.
- 🎯 **Proyección y Planificación:** Planificación de metas tanto manual (vía formularios) como asistida por IA según tu viabilidad financiera.
- 🧾 **Escaneo Inteligente de Recibos y Facturas:** Carga de archivos e imágenes para la extracción automática de gastos mediante visión computacional (**LA COMPU NO AGUANTA**).
- 📊 **Balance Real vs. Proyectado:** Comparativa directa entre la planificación teórica y el estado real de tus cuentas.
- 📖 **Guía Educativa:** Módulo de introducción a las finanzas personales para estructurar presupuestos desde cero.

---

## 🔄 Flujo de Navegación de la Aplicación

### 1. 💬 Chat Inicial (Pantalla Principal)
- Sección central para preguntas rápidas y consultas guiadas.
- **Top Bar Resumen:** Muestra los métricos clave en vivo (Entradas, Gastos, Ahorro acumulado, Por localizar, Fecha actual y Porcentaje de avance del periodo).

### 2. 📊 Resumen del Periodo
- **Panel Izquierdo:** 3 tablas organizadas (Entradas, Gastos, Ahorro).
- **Panel Derecho:** Visualización con gráficas interactivas personalizables y filtros por tiempo/categoría.

### 3. 🔍 Análisis de Tabla o Gráfica
- La IA genera un **diagnóstico detallado** del objeto seleccionado (tabla o gráfica).
- Explicación de riesgos, oportunidades de mejora y optimización de gastos.
- **Navegación directa:** Puedes hacer clic en cualquier gráfica o tabla del *Resumen* para ir directo a su análisis.
- Muestra el balance planeado de tus finanzas.

### 4. ⚙️ Datos Personales y Escaneo (EL ESCANEO NO LO AGUANTA)
- Registro de datos financieros base (Entradas, Gastos fijos/variables, Ahorro inicial).
- Carga de Recibos y Facturas:** Subida de imágenes o documentos escaneados para que la IA procese y extraiga los gastos automáticamente. (LA COMPU NO AGUANTA)
- Permite la carga manual o la asistencia directa de la IA para actualizar los datos.
- Refleja el balance real de dinero disponible.

### 5. 📚 Guía de Finanzas
- Tutorial interactivo sobre el uso de Plaris.
- Módulo educativo para aprender las bases de la gestión presupuestaria (reglas de porcentaje para Entradas, Gastos y Ahorro).

---

## 🛠️ Tecnologías y Arquitectura

- **Frontend:** React + Tailwind CSS
- **Gráficas:** Recharts / Chart.js
- **Motor de IA Local Ecosistema Meta Llama:** Ollama (`llama3.2:3b`, `llama3.1:8b`, `llama3.1:8b (con prompt de CoT)` `llama3.2-vision:11b`)

- **llama3.2:3b:** Clasificación Flash / Decisión - ollama pull llama3.2:3b
- **llama3.1:8b:** Plan Estándar + JSON para Gráficas	- ollama run llama3.1:8b
- **llama3.1:8b: (con prompt de CoT):** Plan Avanzado / Razonamiento - ollama run llama3.1:8b
- **llama3.2-vision:11b:** Escanear Facturas / Recibos (Opcional)	- ollama pull llama3.2-vision:11b

- **ollama pull llama3.2:3b**
- **ollama pull llama3.1:8b**
- **ollama pull llama3.2-vision:11b (Es imposible de usar en nuestras compus pero habria estado epico :c)**


---

<p center="align">
  <sub>Desarrollado con 💚 para el control total de tus finanzas personales.</sub>
</p>

https://excelfind.com/excel-templates/ultimate-excel-personal-budget-base/?ds24tr=yt
