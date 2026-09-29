const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
import { fetchWithAuth } from '../../../core/utils/fetchInterceptor.ts';

export interface ConfiguracionUmbral {
  id: number;
  umbral_trimestre: number;
  umbral_anual: number;
  umbral_periodo: number;
}

export interface TrimestreInfo {
  id: number;
  numero: number;
  nombre_trimestre: string;
  anio: number;
}

export interface DosisTrimestreCal {
  id: number;
  id_trimestre: number;
  dosis_acumulada: number;
  estado: number;
  estado_noti: number;
}

export interface DosisTrimestrePe {
  id: number;
  id_dosis_anual_pe: number;
  id_trimestre: number;
  dosis_acumulada: number;
  estado: number;
  estado_noti: number;
  createdAt: string;
  updatedAt: string;
  creado_por: number;
  trimestre: TrimestreInfo;
  dosis_trimestre_cal: DosisTrimestreCal | null;
}

export interface DosisAnualCal {
  id: number;
  anio: number;
  dosis_acumulada: number;
  estado: number;
  estado_noti: number;
}

export interface DosisAnualPe {
  id: number;
  id_dosis_periodo: number;
  anio: number;
  dosis_acumulada: number;
  estado_noti: number;
  estado: number;
  createdAt: string;
  updatedAt: string;
  creado_por: number;
  dosis_trimestre_pe: DosisTrimestrePe[];
  dosis_anual_cal: DosisAnualCal | null;
}

export interface DosisPeriodo {
  id: number;
  fecha_inicio: string;
  fecha_fin: string;
  dosis_total: number;
  estado: number;
  estado_periodo: number;
  configuracion_umbral: ConfiguracionUmbral;
  dosis_anual_pe: DosisAnualPe[];
}

export const getDosis = async (): Promise<DosisPeriodo[]> => {
  const response = await fetchWithAuth(`${API_BASE_URL}/portal/dosis`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.message || 'Error al obtener dosis');
  }

  return data;
};
