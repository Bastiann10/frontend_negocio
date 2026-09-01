const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
import { fetchWithAuth } from '../../../core/utils/fetchInterceptor.ts';

export interface Area {
  id: number;
  id_entidad: number;
  creado_por: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  estado: number;
  createdAt: string;
  updatedAt: string;
  entidad: {
    id: number;
    nombre: string;
  };
}

export interface AreaResumen extends Area {
  cargo?: string;
  rol?: number;
}

export interface AreasResponse {
  areas: AreaResumen[];
  total: number;
  page: number;
  limit: number;
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
}

export interface AreaPeResponse {
  area_pe: AreaPe;
}

export interface AlertaArea {
  id: number;
  mensaje: string;
  nivel?: string;
  fecha?: string;
  estado?: number;
}

export interface AlertasAreaResponse {
  area_id: number;
  alertas: AlertaArea[];
}

export const getAreas = async (id_entidad: number, page = 1, limit = 10): Promise<AreasResponse> => {
  const params = new URLSearchParams({
    id_entidad: String(id_entidad),
    page: String(page),
    limit: String(limit),
  });
  const response = await fetchWithAuth(`${API_BASE_URL}/portal/areas?${params.toString()}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Error al obtener áreas');
  }

  return data;
};

export const getAreaPe = async (id: number, id_entidad: number): Promise<AreaPeResponse> => {
  const params = new URLSearchParams({ id_entidad: String(id_entidad) });
  const response = await fetchWithAuth(`${API_BASE_URL}/portal/areas/${id}/area-pe?${params.toString()}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Error al obtener área PE');
  }

  return data;
};

export const getAlertasArea = async (id: number): Promise<AlertasAreaResponse> => {
  const response = await fetchWithAuth(`${API_BASE_URL}/portal/areas/${id}/alertas`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Error al obtener alertas del área');
  }

  return data;
};
