const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export interface LoginCredentials {
  correo: string;
  contrasena: string;
}

export interface Personal {
  id: number;
  nombre: string;
  apellido: string;
  segundo_apellido?: string;
  rut: string;
  correo: string;
  entidad: {
    id: number;
    nombre: string;
  };
}

export interface LoginResponse {
  message: string;
  personal: Personal;
  accessToken: string;
}

export interface RefreshResponse {
  message: string;
  accessToken: string;
}

export interface LogoutResponse {
  message: string;
}

export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  const response = await fetch(`${API_BASE_URL}/portal/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(credentials),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.message || 'Error en el login');
  }

  return data;
};

export const refresh = async (): Promise<RefreshResponse> => {
  const response = await fetch(`${API_BASE_URL}/portal/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });

  if (response.status === 401) {
    throw new Error('Refresh token inválido o expirado');
  }

  const data = await response.json();
  return data;
};

export const logout = async (): Promise<LogoutResponse> => {
  const response = await fetch(`${API_BASE_URL}/portal/auth/logout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.message || 'Error al cerrar sesión');
  }

  return data;
};
