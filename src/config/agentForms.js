import {
  BarChart3,
  CalendarPlus,
  FileText,
  LineChart,
  PieChart,
  Target,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';

/** Atajos que cambian el formulario del agente. `icon: null` usa la Φ de Plaris. */
export const agentShortcuts = [
  {
    id: 'agente',
    label: 'Agente',
    icon: null,
    titleLine1: '¿QUÉ QUIERES',
    titleLine2: 'COMPRAR?',
    hint: 'Pregunta rápida: Plaris revisa la compra con tus movimientos reales y tu plan de ingresos, gastos y ahorros, protegiendo el fondo.',
  },
  {
    id: 'metas',
    label: 'Metas',
    icon: Target,
    titleLine1: '¿ANALIZAMOS TUS',
    titleLine2: 'METAS?',
    hint: 'Analiza una meta que ya tienes o crea una nueva; se guardará en tu perfil.',
  },
  {
    id: 'reportes',
    label: 'Reportes',
    icon: FileText,
    titleLine1: '¿QUÉ REPORTE',
    titleLine2: 'NECESITAS?',
    hint: 'Elige una plantilla o una meta y el tipo de reporte que quieres.',
  },
  {
    id: 'agendar',
    label: 'Registrar',
    icon: CalendarPlus,
    titleLine1: '¿REGISTRAMOS UN',
    titleLine2: 'MOVIMIENTO?',
    hint: 'Registra rápido un gasto o un ingreso.',
  },
];

export const reportTypes = [
  { id: 'comparison', label: 'Reporte de comparación', hint: 'Planeado vs. real', icon: BarChart3 },
  {
    id: 'distribution',
    label: 'Reporte de distribución',
    hint: 'En qué se reparte tu dinero',
    icon: PieChart,
  },
  {
    id: 'tracking',
    label: 'Reporte de tracking',
    hint: 'Cómo avanzas con el tiempo',
    icon: LineChart,
  },
];

/** Tipos de registro de "Agendar", con sus categorías. */
export const entryTypes = [
  {
    id: 'expense',
    label: 'Registrar gasto',
    icon: TrendingDown,
    categories: [
      'Vivienda',
      'Alimentos',
      'Transporte',
      'Servicios',
      'Salud',
      'Educación',
      'Entretenimiento',
      'Ropa y calzado',
      'Suscripciones',
      'Otros',
    ],
  },
  {
    id: 'income',
    label: 'Registrar ingreso',
    icon: TrendingUp,
    categories: [
      'Sueldo',
      'Honorarios',
      'Ventas o negocio',
      'Apoyos y becas',
      'Rendimientos',
      'Regalos',
      'Otros',
    ],
  },
];
