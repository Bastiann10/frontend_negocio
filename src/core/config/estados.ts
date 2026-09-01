export const ESTADO_ENTIDAD = {
  0: 'Inactiva',
  1: 'Activa'
} as const;

export const getEstadoEntidadLabel = (estado: number): string => {
  return ESTADO_ENTIDAD[estado as keyof typeof ESTADO_ENTIDAD] || 'Desconocido';
};

export interface EstadoAsignacionTLD {
  value: number;
  label: string;
  color: string;
}

export const ESTADOS_ASIGNACION_TLD: EstadoAsignacionTLD[] = [
  { value: 0, label: 'Gestionando', color: '#6b7280' },
  { value: 1, label: 'En envío', color: '#3b82f6' },
  { value: 2, label: 'Recepcionado', color: '#10b981' },
  { value: 3, label: 'En uso', color: '#f59e0b' },
  { value: 4, label: 'Devuelta', color: '#8b5cf6' },
  { value: 5, label: 'Recepcionado devolución', color: '#06b6d4' },
  { value: 6, label: 'En lectura dosimetría', color: '#fde047' },
  { value: 7, label: 'Finalizado', color: '#84cc16' },
];

export const getEstadoAsignacionTLD = (estado: number): EstadoAsignacionTLD => {
  return ESTADOS_ASIGNACION_TLD.find(e => e.value === estado) || { value: -1, label: 'Desconocido', color: '#6b7280' };
};
