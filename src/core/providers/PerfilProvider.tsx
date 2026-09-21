import { createContext, useContext, useCallback, useEffect, useState, type ReactNode } from 'react';
import { getPerfil, type Perfil, type PerfilResumen } from '../../features/perfil/services/perfil';

interface PerfilContextType {
  perfil: Perfil | null;
  resumen: PerfilResumen | null;
  error: string | null;
  refetch: () => Promise<void>;
}

const PerfilContext = createContext<PerfilContextType | undefined>(undefined);

export function PerfilProvider({ children }: { children: ReactNode }) {
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [resumen, setResumen] = useState<PerfilResumen | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      const data = await getPerfil();
      setPerfil(data.perfil);
      setResumen(data.resumen);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error al obtener el perfil');
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return (
    <PerfilContext.Provider value={{ perfil, resumen, error, refetch }}>
      {children}
    </PerfilContext.Provider>
  );
}

export function usePerfil() {
  const context = useContext(PerfilContext);
  if (context === undefined) {
    throw new Error('usePerfil must be used within a PerfilProvider');
  }
  return context;
}
