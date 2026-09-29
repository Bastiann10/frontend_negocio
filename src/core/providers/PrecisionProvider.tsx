import { createContext, useContext, useState, type ReactNode } from 'react';

interface PrecisionContextType {
  aproximar: boolean;
  toggleAproximar: () => void;
}

const PrecisionContext = createContext<PrecisionContextType | undefined>(undefined);

export function PrecisionProvider({ children }: { children: ReactNode }) {
  const [aproximar, setAproximar] = useState(false);

  return (
    <PrecisionContext.Provider
      value={{ aproximar, toggleAproximar: () => setAproximar((v) => !v) }}
    >
      {children}
    </PrecisionContext.Provider>
  );
}

export function usePrecision() {
  const context = useContext(PrecisionContext);
  if (context === undefined) {
    throw new Error('usePrecision must be used within a PrecisionProvider');
  }
  return context;
}
