export interface DosisComparativa {
  trimestre: number;
  titulo: string;
  badge: string;
  descripcion: string;
  umbral: number;
  trimestreActual: {
    anio: number;
    valor: number;
  };
  trimestreAnterior: {
    anio: number;
    valor: number;
  };
  diferencia: {
    absoluta: number;
    porcentaje: number;
  };
}

export const dosisComparativaPorTrimestre: DosisComparativa[] = [
  {
    trimestre: 1,
    titulo: 'Lectura TLD — Primer Trimestre',
    badge: '2026 vs 2025',
    descripcion: 'Comparativa de administración trimestral interanual',
    umbral: 5,
    trimestreActual: { anio: 2026, valor: 4.2 },
    trimestreAnterior: { anio: 2025, valor: 0.8 },
    diferencia: { absoluta: 3.4, porcentaje: 425.0 },
  },
  {
    trimestre: 2,
    titulo: 'Lectura TLD — Segundo Trimestre',
    badge: '2026 vs 2025',
    descripcion: 'Comparativa de administración trimestral interanual',
    umbral: 5,
    trimestreActual: { anio: 2026, valor: 1.2 },
    trimestreAnterior: { anio: 2025, valor: 2.1 },
    diferencia: { absoluta: -0.9, porcentaje: -42.9 },
  },
  {
    trimestre: 3,
    titulo: 'Lectura TLD — Tercer Trimestre',
    badge: '2026 vs 2025',
    descripcion: 'Comparativa de administración trimestral interanual',
    umbral: 5,
    trimestreActual: { anio: 2026, valor: 5.2 },
    trimestreAnterior: { anio: 2025, valor: 3.4 },
    diferencia: { absoluta: 1.8, porcentaje: 52.9 },
  },
  {
    trimestre: 4,
    titulo: 'Lectura TLD — Cuarto Trimestre',
    badge: '2026 vs 2025',
    descripcion: 'Comparativa de administración trimestral interanual',
    umbral: 5,
    trimestreActual: { anio: 2026, valor: 0.9 },
    trimestreAnterior: { anio: 2025, valor: 1.7 },
    diferencia: { absoluta: -0.8, porcentaje: -47.1 },
  },
];
