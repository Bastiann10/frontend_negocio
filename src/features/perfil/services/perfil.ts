const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
import { fetchWithAuth } from '../../../core/utils/fetchInterceptor.ts';

export interface ProfesionPersonal {
  id: number;
  id_personal_expuesto: number;
  id_profesion: number;
  creado_por: number;
  createdAt: string;
  profesion: {
    id: number;
    nombre: string;
  };
}

export interface Perfil {
  id: number;
  creado_por: number;
  nombre: string;
  apellido: string;
  segundo_apellido?: string;
  rut: string;
  correo: string;
  telefono?: string;
  foto_url?: string;
  estado: number;
  createdAt: string;
  updatedAt: string;
  profesion_personal: ProfesionPersonal[];
}

export interface PerfilResumen {
  entidades: number;
  areas: number;
  asignaciones_activas: number;
}

export interface PerfilResponse {
  perfil: Perfil;
  resumen: PerfilResumen;
}

export const getPerfil = async (): Promise<PerfilResponse> => {
  const response = await fetchWithAuth(`${API_BASE_URL}/portal/perfil`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Error al obtener el perfil');
  }

  return data;
};
