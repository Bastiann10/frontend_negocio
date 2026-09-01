export interface Rol {
  id: number;
  nombre: string;
  descripcion: string;
}

export const roles: Rol[] = [
  { id: 1, nombre: 'OPR', descripcion: 'Oficial de Protección Radiológica' },
  { id: 2, nombre: 'EPR', descripcion: 'Encargado de Personal Expuesto' },
];

export function getRolById(id: number): Rol | null {
  return roles.find(rol => rol.id === id) || null;
}

export function getRolByNombre(nombre: string): Rol | null {
  return roles.find(rol => rol.nombre === nombre) || null;
}
