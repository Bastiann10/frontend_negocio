import { useEffect, useState } from 'react';
import { getAreas, type AreaResumen } from '../services/areas';
import Loading from '../../../core/components/Loading';

interface ListAreasProps {
  entidadId: number;
}

export default function ListAreas({ entidadId }: ListAreasProps) {
  const [areas, setAreas] = useState<AreaResumen[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getAreas(entidadId)
      .then((data) => setAreas(data.areas))
      .catch((err: any) => setError(err.message || 'Error al cargar áreas'))
      .finally(() => setLoading(false));
  }, [entidadId]);

  if (loading) {
    return <Loading text="Cargando áreas" />;
  }

  if (error) {
    return (
      <div className="text-center py-6">
        <p className="text-danger">{error}</p>
      </div>
    );
  }

  if (areas.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-foreground-secondary text-sm">Sin áreas asignadas</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-semibold text-foreground-secondary uppercase tracking-wide mb-2">
        Áreas
      </h2>
      {areas.map((item) => (
        <div
          key={item.id}
          className="bg-background rounded-xl border border-border p-3"
        >
          <p className="font-medium text-foreground text-sm">
            {item.codigo} - {item.nombre}
          </p>
          {item.descripcion && (
            <p className="text-xs text-foreground-secondary line-clamp-2">
              {item.descripcion}
            </p>
          )}
          {item.cargo && (
            <p className="text-xs text-foreground-secondary mt-1">
              Cargo: {item.cargo}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
