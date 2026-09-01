import { useEffect, useState } from 'react';
import { getEntidades, type EntidadResumen } from '../services/entidades';

export default function EntidadesPage() {
  const [entidades, setEntidades] = useState<EntidadResumen[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    getEntidades()
      .then((data) => setEntidades(data.entidades))
      .catch((err: any) => setError(err.message));
  }, []);

  if (error) {
    return <p className="text-danger">{error}</p>;
  }

  if (entidades.length === 0) {
    return <p className="text-foreground-secondary">Cargando entidades...</p>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-foreground">Mis Entidades</h1>
      <div className="grid gap-4">
        {entidades.map((item) => (
          <div
            key={item.id}
            className="bg-background rounded-xl border border-border p-4"
          >
            <p className="font-medium text-foreground">{item.nombre}</p>
            <p className="text-sm text-foreground-secondary">{item.rut}</p>
            {item.logo_url && (
              <img src={item.logo_url} alt={item.nombre} className="h-12 w-12 object-contain mt-2" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
