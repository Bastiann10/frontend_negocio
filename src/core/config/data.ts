export interface User {
  id: number;
  email: string;
  password: string;
  nombre: string;
  rolId: number;
  entidadId: number | null;
}

export interface PersonalExpuesto {
  id: number;
  nombre: string;
  apellido: string;
  rut: string;
  estado: string;
}

export interface PersonalExpuestoEntidad {
  id: number;
  personalExpuestoId: number;
  entidadId: number;
}

export interface PersonalExpuestoArea {
  id: number;
  personalExpuestoId: number;
  areaId: number;
}

export const usuarios: User[] = [
  { id: 1, email: 'opr@dosimetria.cl', password: 'opr123', nombre: 'Carlos OPR', rolId: 1, entidadId: null },
  { id: 2, email: 'epe@dosimetria.cl', password: 'epe123', nombre: 'María EPE', rolId: 2, entidadId: null },
];

export const personalExpuesto: PersonalExpuesto[] = [
  { id: 1, nombre: 'Juan Pérez', apellido: 'González', rut: '12.345.678-9', estado: 'Activo' },
  { id: 2, nombre: 'María', apellido: 'López', rut: '15.678.901-2', estado: 'Activo' },
  { id: 3, nombre: 'Carlos', apellido: 'Rodríguez', rut: '18.234.567-8', estado: 'Activo' },
  { id: 4, nombre: 'Ana', apellido: 'Martínez', rut: '19.345.678-5', estado: 'Activo' },
  { id: 5, nombre: 'Pedro', apellido: 'Sánchez', rut: '20.456.789-1', estado: 'Activo' },
  { id: 6, nombre: 'Laura', apellido: 'Fernández', rut: '21.567.890-4', estado: 'Activo' },
];

export const personalExpuestoEntidad: PersonalExpuestoEntidad[] = [
  { id: 1, personalExpuestoId: 1, entidadId: 1 },
  { id: 2, personalExpuestoId: 2, entidadId: 2 },
  { id: 3, personalExpuestoId: 3, entidadId: 1 },
  { id: 4, personalExpuestoId: 4, entidadId: 3 },
  { id: 5, personalExpuestoId: 5, entidadId: 1 },
  { id: 6, personalExpuestoId: 6, entidadId: 2 },
  { id: 7, personalExpuestoId: 1, entidadId: 2 },
  { id: 8, personalExpuestoId: 2, entidadId: 3 },
];

export const personalExpuestoArea: PersonalExpuestoArea[] = [
  { id: 1, personalExpuestoId: 1, areaId: 1 },
  { id: 2, personalExpuestoId: 2, areaId: 5 },
  { id: 3, personalExpuestoId: 3, areaId: 2 },
  { id: 4, personalExpuestoId: 4, areaId: 8 },
  { id: 5, personalExpuestoId: 5, areaId: 3 },
  { id: 6, personalExpuestoId: 6, areaId: 6 },
  { id: 7, personalExpuestoId: 1, areaId: 2 },
  { id: 8, personalExpuestoId: 2, areaId: 6 },
  { id: 9, personalExpuestoId: 3, areaId: 3 },
];

export function getPersonalExpuestoCountByArea(areaId: number): number {
  return personalExpuestoArea.filter(rel => rel.areaId === areaId).length;
}

export function getPersonalExpuestoByEntidadId(entidadId: number): PersonalExpuesto[] {
  const personalExpuestoIds = personalExpuestoEntidad
    .filter(rel => rel.entidadId === entidadId)
    .map(rel => rel.personalExpuestoId);
  
  return personalExpuesto.filter(p => personalExpuestoIds.includes(p.id));
}

export function getPersonalExpuestoCountByEntidadId(entidadId: number): number {
  return personalExpuestoEntidad.filter(rel => rel.entidadId === entidadId).length;
}

export function getEntidadesByPersonalExpuestoId(personalExpuestoId: number): number[] {
  return personalExpuestoEntidad
    .filter(rel => rel.personalExpuestoId === personalExpuestoId)
    .map(rel => rel.entidadId);
}
