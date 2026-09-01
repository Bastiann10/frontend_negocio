import { fetchWithAuth } from '../utils/fetchInterceptor';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export interface LogEntry {
  id: number;
  actualizado_por: number;
  createdAt: string;
  usuario: {
    id: number;
    nombre: string;
    apellido: string;
    segundo_apellido?: string | null;
    correo?: string;
  };
  [key: string]: any;
}

export interface PaginatedLogResponse {
  data: LogEntry[];
  total: number;
  page: number;
  limit: number;
}

// GET /entidad/:id/log?page=1&limit=10
export const getLogEntidad = async (id: number, page: number = 1, limit: number = 10): Promise<PaginatedLogResponse> => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/entidad/${id}/log?page=${page}&limit=${limit}`, {
      method: 'GET',
      credentials: 'include',
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || data.error || 'Error al obtener log');
    return { data: data.data || [], total: data.total || 0, page: data.page || 1, limit: data.limit || 10 };
  } catch (error) {
    console.error('Error al obtener log de entidad:', error);
    throw error;
  }
};

// GET /acceso-entidad-pe/:id/log?page=1&limit=10
export const getLogAccesoEntidadPe = async (id: number, page: number = 1, limit: number = 10): Promise<PaginatedLogResponse> => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/acceso-entidad-pe/${id}/log?page=${page}&limit=${limit}`, {
      method: 'GET',
      credentials: 'include',
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || data.error || 'Error al obtener log');
    return { data: data.data || [], total: data.total || 0, page: data.page || 1, limit: data.limit || 10 };
  } catch (error) {
    console.error('Error al obtener log de acceso entidad PE:', error);
    throw error;
  }
};

// GET /area/:id/log?page=1&limit=10
export const getLogArea = async (id: number, page: number = 1, limit: number = 10): Promise<PaginatedLogResponse> => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/area/${id}/log?page=${page}&limit=${limit}`, {
      method: 'GET',
      credentials: 'include',
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || data.error || 'Error al obtener log');
    return { data: data.data || [], total: data.total || 0, page: data.page || 1, limit: data.limit || 10 };
  } catch (error) {
    console.error('Error al obtener log de área:', error);
    throw error;
  }
};

// GET /area-pe/:id/log (no paginado, devuelve array directo)
export const getLogAreaPe = async (id: number): Promise<LogEntry[]> => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/area-pe/${id}/log`, {
      method: 'GET',
      credentials: 'include',
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || data.error || 'Error al obtener log');
    return Array.isArray(data) ? data : data.data || [];
  } catch (error) {
    console.error('Error al obtener log de área PE:', error);
    throw error;
  }
};

// GET /personal-expuesto/:id/log?page=1&limit=10
export const getLogPersonalExpuesto = async (id: number, page: number = 1, limit: number = 10): Promise<PaginatedLogResponse> => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/personal-expuesto/${id}/log?page=${page}&limit=${limit}`, {
      method: 'GET',
      credentials: 'include',
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || data.error || 'Error al obtener log');
    return { data: data.data || [], total: data.total || 0, page: data.page || 1, limit: data.limit || 10 };
  } catch (error) {
    console.error('Error al obtener log de personal expuesto:', error);
    throw error;
  }
};
