const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
import { fetchWithAuth } from '../../../core/utils/fetchInterceptor.ts';

export interface EntidadDetalle {
  id: number;
  nombre: string;
  rut: string;
  logo_url?: string;
  color_primario?: string;
  color_secundario?: string;
}

export interface EntidadResumen extends EntidadDetalle {
  acceso_id: number;
  correo: string;
}

export interface EntidadesResponse {
  entidades: EntidadResumen[];
}

export const getEntidades = async (search?: string): Promise<EntidadesResponse> => {
  const params = new URLSearchParams();
  if (search && search.trim()) {
    params.set('busqueda', search.trim());
  }
  const query = params.toString() ? `?${params.toString()}` : '';
  const response = await fetchWithAuth(`${API_BASE_URL}/portal/entidades${query}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Error al obtener entidades');
  }

  // Transformar respuesta anidada { acceso_id, correo, entidad } a plano
  const entidades = (data.entidades ?? []).map((item: any) => ({
    ...item.entidad,
    acceso_id: item.acceso_id,
    correo: item.correo,
  }));

  return { entidades };
};
