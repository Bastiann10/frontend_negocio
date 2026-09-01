import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

interface LogoContextType {
  logoUrl: string | null;
  isLoading: boolean;
}

const LogoContext = createContext<LogoContextType | undefined>(undefined);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export function LogoProvider({ children }: { children: ReactNode }) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);

  const hideInitialLoading = () => {
    const initialLoading = document.getElementById('initial-loading');
    if (initialLoading) {
      initialLoading.classList.add('hidden');
      setTimeout(() => {
        initialLoading.remove();
      }, 300);
    }
  };

  useEffect(() => {
    // Evitar múltiples cargas
    if (hasLoaded) return;

    const fetchLogo = async () => {
      try {
        // Usar fetch normal para evitar bucle de autenticación
        const response = await fetch(`${API_BASE_URL}/portal/configuracion/logo`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          cache: 'no-store',
        });

        if (response.ok) {
          const contentType = response.headers.get('content-type');

          let finalUrl: string;

          if (contentType && contentType.startsWith('image/')) {
            const blob = await response.blob();
            finalUrl = URL.createObjectURL(blob);
          } else {
            const data = await response.json();

            // Convertir URL relativa a absoluta
            const relativeUrl = data.logo_url || data.logoUrl;
            finalUrl = relativeUrl.startsWith('http')
              ? relativeUrl
              : `${API_BASE_URL}${relativeUrl}`;
          }

          // Precargar la imagen antes de mostrarla
          const img = new Image();
          img.onload = () => {
            setLogoUrl(finalUrl);
            setIsLoading(false);
            setHasLoaded(true);
            hideInitialLoading();
          };
          img.onerror = () => {
            console.error('LogoProvider: Image failed to load');
            setIsLoading(false);
            setHasLoaded(true);
            hideInitialLoading();
          };
          img.src = finalUrl;
        } else {
          console.error('LogoProvider: Response not ok:', response.status);
          setIsLoading(false);
          setHasLoaded(true);
          hideInitialLoading();
        }
      } catch (error) {
        console.error('LogoProvider: Error fetching logo:', error);
        setIsLoading(false);
        setHasLoaded(true);
        hideInitialLoading();
      }
    };

    fetchLogo();
  }, [hasLoaded]);

  return (
    <LogoContext.Provider value={{ logoUrl, isLoading }}>
      {children}
    </LogoContext.Provider>
  );
}

export function useLogo() {
  const context = useContext(LogoContext);
  if (context === undefined) {
    throw new Error('useLogo must be used within a LogoProvider');
  }
  return context;
}
