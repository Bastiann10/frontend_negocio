import { entidadesConfig } from './entidades';

export interface Area {
  id: number;
  nombre: string;
  entidadId: number;
  entidadLogo?: string | null;
}

export const areasData: Area[] = [
  // Áreas para INACAP (entidadId: 1)
  { id: 1, nombre: 'Radiología', entidadId: 1 },
  { id: 2, nombre: 'Odontología', entidadId: 1 },
  { id: 3, nombre: 'Laboratorio', entidadId: 1 },
  { id: 4, nombre: 'Quirófano', entidadId: 1 },
  
  // Áreas para Santo Tomás (entidadId: 2)
  { id: 5, nombre: 'Radiología', entidadId: 2 },
  { id: 6, nombre: 'Odontología', entidadId: 2 },
  { id: 7, nombre: 'Laboratorio Clínico', entidadId: 2 },
  
  // Áreas para Hospital Regional (entidadId: 3)
  { id: 8, nombre: 'Radiología', entidadId: 3 },
  { id: 9, nombre: 'Medicina Nuclear', entidadId: 3 },
  { id: 10, nombre: 'Radioterapia', entidadId: 3 },
  { id: 11, nombre: 'Quirófano', entidadId: 3 },
  { id: 12, nombre: 'Laboratorio', entidadId: 3 },
];

export function getAreasByEntidadId(entidadId: number): Area[] {
  return areasData
    .filter(area => area.entidadId === entidadId)
    .map(area => ({
      ...area,
      entidadLogo: getEntidadLogoByEntidadId(area.entidadId),
    }));
}

export function getAreaCountByEntidadId(entidadId: number): number {
  return areasData.filter(area => area.entidadId === entidadId).length;
}

export function getEntidadLogoByEntidadId(entidadId: number): string | null {
  const entidad = entidadesConfig.find(e => e.id === entidadId);
  return entidad ? entidad.logo : null;
}

export function getAreasWithLogo(): Area[] {
  return areasData.map(area => ({
    ...area,
    entidadLogo: getEntidadLogoByEntidadId(area.entidadId),
  }));
}
