import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { X, AlertTriangle, UserX, ShieldAlert, KeyRound } from 'lucide-react';

type AuthErrorType = 'user_deleted' | 'user_inactive' | 'token_not_provided' | 'session_expired';

// Sistema de eventos globales para mostrar el modal
const AUTH_ERROR_EVENT = 'auth-error';

export function showAuthErrorModal(errorType: AuthErrorType) {
  const event = new CustomEvent<{ errorType: AuthErrorType }>(AUTH_ERROR_EVENT, {
    detail: { errorType }
  });
  window.dispatchEvent(event);
}

export default function AuthErrorModal() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [errorType, setErrorType] = useState<AuthErrorType>('session_expired');

  useEffect(() => {
    const handleAuthError = (e: Event) => {
      const customEvent = e as CustomEvent<{ errorType: AuthErrorType }>;
      setErrorType(customEvent.detail.errorType);
      setIsOpen(true);
    };

    window.addEventListener(AUTH_ERROR_EVENT, handleAuthError);
    return () => window.removeEventListener(AUTH_ERROR_EVENT, handleAuthError);
  }, []);

  if (!isOpen) return null;

  const getErrorConfig = () => {
    switch (errorType) {
      case 'user_deleted':
        return {
          icon: <UserX size={48} className="text-danger" />,
          title: 'Usuario Eliminado',
          message: 'Tu cuenta de usuario ha sido eliminada del sistema. Por favor contacta al administrador.',
          buttonText: 'Ir al Login'
        };
      case 'user_inactive':
        return {
          icon: <ShieldAlert size={48} className="text-warning" />,
          title: 'Usuario Inactivo',
          message: 'Tu cuenta de usuario se encuentra inactiva. Por favor contacta al administrador.',
          buttonText: 'Ir al Login'
        };
      case 'token_not_provided':
        return {
          icon: <KeyRound size={48} className="text-warning" />,
          title: 'Sesión No Iniciada',
          message: 'No se ha proporcionado un token de autenticación. Por favor inicia sesión nuevamente.',
          buttonText: 'Ir al Login'
        };
      case 'session_expired':
      default:
        return {
          icon: <AlertTriangle size={48} className="text-primary" />,
          title: 'Sesión Expirada',
          message: 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.',
          buttonText: 'Ir al Login'
        };
    }
  };

  const config = getErrorConfig();

  const handleGoToLogin = () => {
    localStorage.removeItem('dosimetria_session');
    navigate('/login', { replace: true });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-background rounded-xl w-full max-w-md p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            {config.icon}
            <h2 className="text-xl font-semibold text-foreground">{config.title}</h2>
          </div>
          <button
            onClick={handleGoToLogin}
            className="text-foreground-secondary hover:text-foreground cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <p className="text-foreground-secondary mb-6">{config.message}</p>

        <div className="flex gap-3">
          <button
            onClick={handleGoToLogin}
            className="flex-1 px-4 py-2 bg-foreground text-background rounded-lg hover:bg-foreground-secondary cursor-pointer"
          >
            {config.buttonText}
          </button>
          <button
            onClick={handleGoToLogin}
            className="px-4 py-2 text-foreground rounded-lg hover:bg-background-secondary cursor-pointer"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}
