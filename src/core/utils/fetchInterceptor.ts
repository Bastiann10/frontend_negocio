import { refresh } from '../../features/auth/services/auth.ts';
import { showAuthErrorModal } from '../components/AuthErrorModal';

let refreshPromise: Promise<boolean> | null = null;

/**
 * Wrapper de fetch con interceptor para renovar tokens automáticamente
 */
export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const response = await fetch(url, {
    ...options,
    credentials: 'include', // Incluir cookies automáticamente
  });

  // Endpoints de autenticación: devolver la respuesta tal cual (no intentar refresh)
  const isAuthEndpoint =
    url.includes('/portal/auth/login') ||
    url.includes('/portal/auth/refresh') ||
    url.includes('/portal/auth/logout');

  if (isAuthEndpoint || (response.status !== 401 && response.status !== 403)) {
    return response;
  }

  // Intentar leer el body del error
  let errorData: { error?: string } = {};
  try {
    errorData = await response.clone().json();
  } catch {
    // Si no es JSON, continuar con el refresh como fallback
  }

  // 403: Usuario inactivo → mostrar modal y no intentar refrescar
  if (response.status === 403 && errorData.error === 'Usuario inactivo') {
    showAuthErrorModal('user_inactive');
    throw new Error(errorData.error);
  }

  // Cualquier otro 403 no debe intentar refresh
  if (response.status === 403) {
    throw new Error(errorData.error || 'Acceso denegado');
  }

  // 401 de rutas protegidas: intentar refrescar el token en segundo plano
  if (!refreshPromise) {
    refreshPromise = refresh()
      .then((data: { accessToken?: string }) => {
        refreshPromise = null;
        return !!data.accessToken;
      })
      .catch(() => {
        refreshPromise = null;
        return false;
      });
  }

  const refreshSuccess = await refreshPromise;

  if (!refreshSuccess) {
    showAuthErrorModal('session_expired');
    throw new Error(errorData.error || 'Sesión expirada');
  }

  // Reintentar la request original con el nuevo token
  return fetch(url, {
    ...options,
    credentials: 'include',
  });
}
