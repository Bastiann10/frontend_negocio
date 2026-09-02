export interface Rol {
  id: number;
  nombre: string;
  descripcion: string;
}

export const roles: Rol[] = [
  { id: 0, nombre: 'Estandar', descripcion: 'Estándar' },
  { id: 1, nombre: 'Administrador', descripcion: 'Administrador' },
];

export function getRolById(id: number): Rol | null {
  return roles.find(rol => rol.id === id) || null;
}

export function getRolByNombre(nombre: string): Rol | null {
  return roles.find(rol => rol.nombre === nombre) || null;
}
