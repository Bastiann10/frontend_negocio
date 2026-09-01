export interface TarjetaTLD {
  id: string;
  codigoQR: string;
  cristal1: number;
  cristal2: number;
  cristal3: number;
  cristal4: number;
  estado: 'Activa' | 'Inactiva' | 'En mantenimiento' | 'Caducada';
  createdAt: string;
  updatedAt: string;
}

export const tarjetasTLD: TarjetaTLD[] = [
  {
    id: 'TLD-001234',
    codigoQR: 'QR-TLD-001234-ABC123',
    cristal1: 0.4,
    cristal2: 0.5,
    cristal3: 0.3,
    cristal4: 0.4,
    estado: 'Activa',
    createdAt: '2024-01-10',
    updatedAt: '2024-07-30',
  },
  {
    id: 'TLD-001235',
    codigoQR: 'QR-TLD-001235-DEF456',
    cristal1: 0.3,
    cristal2: 0.4,
    cristal3: 0.5,
    cristal4: 0.3,
    estado: 'Activa',
    createdAt: '2024-02-15',
    updatedAt: '2024-07-30',
  },
  {
    id: 'TLD-001236',
    codigoQR: 'QR-TLD-001236-GHI789',
    cristal1: 0.5,
    cristal2: 0.6,
    cristal3: 0.4,
    cristal4: 0.5,
    estado: 'Inactiva',
    createdAt: '2024-03-20',
    updatedAt: '2024-06-15',
  },
];

export function getTarjetaById(id: string): TarjetaTLD | undefined {
  return tarjetasTLD.find(tarjeta => tarjeta.id === id);
}

export function getTarjetasByEstado(estado: TarjetaTLD['estado']): TarjetaTLD[] {
  return tarjetasTLD.filter(tarjeta => tarjeta.estado === estado);
}
