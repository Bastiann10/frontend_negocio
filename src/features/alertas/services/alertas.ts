const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
import { fetchWithAuth } from '../../../core/utils/fetchInterceptor.ts';

export interface AlertaDosisTrimestre {
  id: number;
  trimestre?: string;
  anio?: number;
  dosis?: number;
  umbral?: number;
  estado: number;
  estado_noti: number;
}

export interface AlertaDosisAnual {
  id: number;
  anio?: number;
  dosis?: number;
  umbral?: number;
  estado: number;
  estado_noti: number;
  dosis_trimestre_pe?: AlertaDosisTrimestre[];
  dosis_trimestre?: AlertaDosisTrimestre[];
}

export interface AlertaDosisPeriodo {
  id: number;
  dosis?: number;
  umbral?: number;
  estado: number;
  estado_noti: number;
  estado_periodo?: number;
  fecha_inicio?: string;
  fecha_fin?: string;
  entidad?: string;
  dosis_anual_pe?: AlertaDosisAnual[];
  dosis_anual?: AlertaDosisAnual[];
}

export const getAlertasDosis = async (): Promise<AlertaDosisPeriodo[]> => {
  const response = await fetchWithAuth(`${API_BASE_URL}/portal/alertas/dosis`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Error al obtener alertas de dosis');
  }

  return data;
};

export const marcarAlertaLeida = async (nivel: 'trimestre' | 'anual' | 'periodo', id: number): Promise<void> => {
  const response = await fetchWithAuth(`${API_BASE_URL}/portal/alertas/dosis/${nivel}/${id}/leido`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || 'Error al marcar alerta como leída');
  }
};
