export interface DosimetriaData {
  personalExpuestoId: number;
  entidadId: number;
  dosisAcumuladaAnual: number;
  limiteLegalAnual: number;
  dosisPromedioMensual: number;
  comparacionAnioAnterior: string;
  tendenciaTrimestral: Array<{
    trimestre: string;
    dosis: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

export const dosimetriaData: DosimetriaData[] = [
  {
    personalExpuestoId: 1,
    entidadId: 1,
    dosisAcumuladaAnual: 1.6,
    limiteLegalAnual: 20,
    dosisPromedioMensual: 0.13,
    comparacionAnioAnterior: '+0.3 mSv',
    tendenciaTrimestral: [
      { trimestre: 'Q1 2024', dosis: 0.6 },
      { trimestre: 'Q2 2024', dosis: 0.3 },
      { trimestre: 'Q3 2024', dosis: 0.5 },
      { trimestre: 'Q4 2024', dosis: 0.2 },
      { trimestre: 'Q1 2025', dosis: 0.3 },
      { trimestre: 'Q2 2025', dosis: 0.4 },
      { trimestre: 'Q3 2025', dosis: 0.2 },
      { trimestre: 'Q4 2025', dosis: 0.3 },
      { trimestre: 'Q1 2026', dosis: 0.5 },
      { trimestre: 'Q2 2026', dosis: 0.8 },
      { trimestre: 'Q3 2026', dosis: 0.3 },
      { trimestre: 'Q4 2026', dosis: 0 },
    ],
    createdAt: '2025-01-15',
    updatedAt: '2026-07-30',
  },
  {
    personalExpuestoId: 1,
    entidadId: 2,
    dosisAcumuladaAnual: 2.3,
    limiteLegalAnual: 20,
    dosisPromedioMensual: 0.19,
    comparacionAnioAnterior: '+0.7 mSv',
    tendenciaTrimestral: [
      { trimestre: 'Q1 2024', dosis: 0.8 },
      { trimestre: 'Q2 2024', dosis: 0.5 },
      { trimestre: 'Q3 2024', dosis: 0.6 },
      { trimestre: 'Q4 2024', dosis: 0.4 },
      { trimestre: 'Q1 2025', dosis: 0.5 },
      { trimestre: 'Q2 2025', dosis: 0.6 },
      { trimestre: 'Q3 2025', dosis: 0.4 },
      { trimestre: 'Q4 2025', dosis: 0.5 },
      { trimestre: 'Q1 2026', dosis: 0.7 },
      { trimestre: 'Q2 2026', dosis: 0.9 },
      { trimestre: 'Q3 2026', dosis: 0.5 },
      { trimestre: 'Q4 2026', dosis: 0 },
    ],
    createdAt: '2025-01-15',
    updatedAt: '2026-07-30',
  },
  {
    personalExpuestoId: 2,
    entidadId: 2,
    dosisAcumuladaAnual: 2.1,
    limiteLegalAnual: 20,
    dosisPromedioMensual: 0.18,
    comparacionAnioAnterior: '+0.5 mSv',
    tendenciaTrimestral: [
      { trimestre: 'Q1 2025', dosis: 0.5 },
      { trimestre: 'Q2 2025', dosis: 0.6 },
      { trimestre: 'Q3 2025', dosis: 0.4 },
      { trimestre: 'Q4 2025', dosis: 0.6 },
      { trimestre: 'Q1 2026', dosis: 0.7 },
      { trimestre: 'Q2 2026', dosis: 0.9 },
      { trimestre: 'Q3 2026', dosis: 0.4 },
    ],
    createdAt: '2025-02-20',
    updatedAt: '2026-07-30',
  },
  {
    personalExpuestoId: 3,
    entidadId: 1,
    dosisAcumuladaAnual: 0.8,
    limiteLegalAnual: 20,
    dosisPromedioMensual: 0.07,
    comparacionAnioAnterior: '-0.2 mSv',
    tendenciaTrimestral: [
      { trimestre: 'Q1 2025', dosis: 0.2 },
      { trimestre: 'Q2 2025', dosis: 0.3 },
      { trimestre: 'Q3 2025', dosis: 0.1 },
      { trimestre: 'Q4 2025', dosis: 0.2 },
      { trimestre: 'Q1 2026', dosis: 0.3 },
      { trimestre: 'Q2 2026', dosis: 0.4 },
      { trimestre: 'Q3 2026', dosis: 0.1 },
    ],
    createdAt: '2025-03-10',
    updatedAt: '2026-07-30',
  },
];

export function getDosimetriaByPersonalId(personalId: number, entidadId?: number): DosimetriaData | undefined {
  if (entidadId !== undefined) {
    return dosimetriaData.find(d => d.personalExpuestoId === personalId && d.entidadId === entidadId);
  }
  return dosimetriaData.find(d => d.personalExpuestoId === personalId);
}

export function getPorcentajeUso(dosisAcumulada: number, limiteLegal: number): number {
  return (dosisAcumulada / limiteLegal) * 100;
}

export function getTrimestresByYear(tendenciaTrimestral: Array<{ trimestre: string; dosis: number }>): Record<string, Array<{ trimestre: string; dosis: number; originalIndex: number }>> {
  return tendenciaTrimestral.reduce((acc: Record<string, Array<{ trimestre: string; dosis: number; originalIndex: number }>>, item: { trimestre: string; dosis: number }, index: number) => {
    const year = item.trimestre.split(' ')[1];
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push({ ...item, originalIndex: index });
    return acc;
  }, {});
}

export function getYearsFromTrimestres(trimestresByYear: Record<string, any>): string[] {
  return Object.keys(trimestresByYear).sort().reverse();
}

export function getDosisAcumuladaAnio(trimestres: Array<{ dosis: number }>): number {
  return trimestres.reduce((sum: number, item: { dosis: number }) => sum + item.dosis, 0);
}
