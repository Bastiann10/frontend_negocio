const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
import { fetchWithAuth } from '../../../core/utils/fetchInterceptor.ts';

export interface AlertaAsignacion {
  id: number;
  tarjeta_tld: {
    id: number;
    codigo: string;
  };
  trimestre: {
    id: number;
    anio: number;
    inicio: string;
  };
}

export interface Alerta {
  tipo: string;
  area: {
    id: number;
    nombre: string;
  };
  anio: number;
  trimestre: number;
  asignacion: AlertaAsignacion;
}

export interface AlertasResponse {
  anio_actual: number;
  trimestre_actual: number;
  alertas: Alerta[];
}

export const getAlertas = async (): Promise<AlertasResponse> => {
  const response = await fetchWithAuth(`${API_BASE_URL}/portal/alertas`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Error al obtener alertas');
  }

  return data;
};
