const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
import { fetchWithAuth } from '../../../core/utils/fetchInterceptor.ts';

export interface TarjetaTld {
  id: number;
  creado_por: number;
  estado: number;
  createdAt: string;
  updatedAt: string;
  color: string;
  codigo: string;
  cristal: {
    id: number;
    id_tarjeta_tld: number;
    creado_por: number;
    codigo: string;
    estado: number;
    createdAt: string;
    updatedAt: string;
    posicion: number;
  };
}

export interface Trimestre {
  id: number;
  creado_por: number;
  nombre_trimestre: string;
  anio: number;
  color: string;
  inicio: string;
  termino: string;
  createdAt: string;
}

export interface AreaPe {
  id: number;
  id_acceso_entidad_pe: number;
  id_area: number;
  cargo: string;
  creado_por: number;
  estado: number;
  fecha_expiracion: string | null;
  createdAt: string;
  updatedAt: string;
  rol: number;
  area: {
    id: number;
    nombre: string;
  };
}

export interface Asignacion {
  id: number;
  id_tarjeta_tld: number | null;
  id_area_pe: number;
  creado_por: number;
  id_trimestre: number;
  fecha_recepcion: string | null;
  fecha_devolucion: string | null;
  fecha_envio: string | null;
  estado: number;
  createdAt: string;
  updatedAt: string;
  fecha_recepcion_devolucion: string | null;
  fecha_vinculacion_tld: string | null;
  fecha_desvinculacion_tld: string | null;
  tarjeta_tld: TarjetaTld | null;
  trimestre: Trimestre;
  area_pe: AreaPe;
  es_actual?: boolean;
}

export interface AsignacionesResponse {
  asignaciones: Asignacion[];
}

export interface EntregarAsignacionResponse {
  message: string;
  asignacion: Asignacion;
}

export interface LiberarAsignacionResponse {
  message: string;
  asignacion: Asignacion;
}

export const getAsignaciones = async (): Promise<AsignacionesResponse> => {
  const response = await fetchWithAuth(`${API_BASE_URL}/portal/asignaciones`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Error al obtener asignaciones');
  }

  return data;
};

export const getAsignacionesByAreaPe = async (idAreaPe: number): Promise<AsignacionesResponse> => {
  const response = await fetchWithAuth(`${API_BASE_URL}/portal/asignaciones/${idAreaPe}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Error al obtener asignaciones del personal');
  }

  return data;
};

export const entregarAsignacion = async (id: number): Promise<EntregarAsignacionResponse> => {
  const response = await fetchWithAuth(`${API_BASE_URL}/portal/asignaciones/${id}/entregar`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Error al entregar asignación');
  }

  return data;
};

export const liberarAsignacion = async (id: number): Promise<LiberarAsignacionResponse> => {
  const response = await fetchWithAuth(`${API_BASE_URL}/portal/asignaciones/${id}/liberar`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Error al liberar asignación');
  }

  return data;
};
