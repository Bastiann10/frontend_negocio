import { useEffect, useState } from 'react';
import { getAreas, type AreaResumen } from '../services/areas';

export default function AreasPage() {
  const [areas, setAreas] = useState<AreaResumen[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    getAreas(1)
      .then((data) => setAreas(data.areas))
      .catch((err: any) => setError(err.message));
  }, []);

  if (error) {
    return <p className="text-danger">{error}</p>;
  }

  if (areas.length === 0) {
    return <p className="text-foreground-secondary">Cargando áreas...</p>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-foreground">Mis Áreas</h1>
      <div className="grid gap-4">
        {areas.map((item) => (
          <div
            key={item.id}
            className="bg-background rounded-xl border border-border p-4"
          >
            <p className="font-medium text-foreground">{item.codigo} - {item.nombre}</p>
            {item.entidad && (
              <p className="text-sm text-foreground-secondary">{item.entidad.nombre}</p>
            )}
            {item.cargo && (
              <p className="text-xs text-foreground-secondary">Cargo: {item.cargo}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
