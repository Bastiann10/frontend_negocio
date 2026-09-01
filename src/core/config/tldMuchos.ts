export interface TLDAsociacion {
  id: number;
  personalExpuestoId: number;
  tarjetaTLDId: string;
  creadoPor: string;
  estado: 'Activa' | 'Inactiva' | 'Expirada';
  createdAt: string;
  updatedAt: string;
  fechaExpiracion: string;
}

export const tldAsociaciones: TLDAsociacion[] = [
  {
    id: 1,
    personalExpuestoId: 1,
    tarjetaTLDId: 'TLD-001234',
    creadoPor: 'admin@dosimetria.cl',
    estado: 'Activa',
    createdAt: '2024-02-01',
    updatedAt: '2024-07-30',
    fechaExpiracion: '2025-02-01',
  },
  {
    id: 2,
    personalExpuestoId: 2,
    tarjetaTLDId: 'TLD-001235',
    creadoPor: 'admin@dosimetria.cl',
    estado: 'Activa',
    createdAt: '2024-03-15',
    updatedAt: '2024-07-30',
    fechaExpiracion: '2025-03-15',
  },
  {
    id: 3,
    personalExpuestoId: 3,
    tarjetaTLDId: 'TLD-001236',
    creadoPor: 'admin@dosimetria.cl',
    estado: 'Expirada',
    createdAt: '2024-04-20',
    updatedAt: '2024-06-15',
    fechaExpiracion: '2024-10-20',
  },
];

export function getAsociacionByPersonalId(personalId: number): TLDAsociacion | undefined {
  return tldAsociaciones.find(asoc => asoc.personalExpuestoId === personalId);
}

export function getAsociacionesByTarjetaId(tarjetaId: string): TLDAsociacion[] {
  return tldAsociaciones.filter(asoc => asoc.tarjetaTLDId === tarjetaId);
}

export function getAsociacionesActivas(): TLDAsociacion[] {
  return tldAsociaciones.filter(asoc => asoc.estado === 'Activa');
}
