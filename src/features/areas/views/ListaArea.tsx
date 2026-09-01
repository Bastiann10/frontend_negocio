import { useState, useEffect, useCallback } from 'react';
import { Building2 } from 'lucide-react';
import { getAreas, getAreaPe, type AreaResumen, type AreaPe } from '../services/areas';
import Loading from '../../../core/components/Loading';
import Pagination from '../../../core/components/Pagination';

interface ListaAreaPageProps {
  embedded?: boolean;
  entidadIdProp?: number;
  entidadNombre?: string;
  entidadColor?: string;
}

export default function ListaAreaPage({ embedded = false, entidadIdProp, entidadNombre, entidadColor }: ListaAreaPageProps = {}) {
  const [areas, setAreas] = useState<AreaResumen[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAreaId, setSelectedAreaId] = useState<number | null>(null);
  const [areaPe, setAreaPe] = useState<AreaPe | null>(null);
  const [loadingPe, setLoadingPe] = useState(false);
  const [errorPe, setErrorPe] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);

  const fetchAreas = useCallback(async () => {
    if (!entidadIdProp) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const response = await getAreas(entidadIdProp, page, limit);
      setAreas(response.areas);
      setTotal(response.total);
      if (response.areas.length > 0) {
        setSelectedAreaId((prev) => (prev !== null ? prev : response.areas[0].id));
      } else {
        setSelectedAreaId(null);
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar áreas');
    } finally {
      setLoading(false);
    }
  }, [entidadIdProp, page, limit]);

  useEffect(() => {
    setPage(1);
  }, [entidadIdProp]);

  useEffect(() => {
    fetchAreas();
  }, [fetchAreas]);

  useEffect(() => {
    if (!selectedAreaId || !entidadIdProp) {
      setAreaPe(null);
      setErrorPe(null);
      return;
    }
    setLoadingPe(true);
    setErrorPe(null);
    getAreaPe(selectedAreaId, entidadIdProp)
      .then((data) => setAreaPe(data.area_pe))
      .catch((err: any) => setErrorPe(err.message || 'Error al cargar información del personal'))
      .finally(() => setLoadingPe(false));
  }, [selectedAreaId, entidadIdProp]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  if (error) {
    return (
      <div className="text-center py-6">
        <p className="text-danger">{error}</p>
      </div>
    );
  }

  if (loading) {
    return <Loading text="Cargando áreas" />;
  }

  if (areas.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-foreground-secondary">No se encontraron áreas</p>
      </div>
    );
  }

  return (
    <div className={embedded ? '' : 'space-y-4'}>
      {!embedded && <h1 className="text-2xl font-bold text-foreground">Áreas</h1>}
      {embedded && entidadNombre && (
        <div className="mb-3">
          <p className="text-xs font-medium text-foreground-secondary uppercase tracking-wide">Áreas de</p>
          <p
            className="text-base font-semibold"
            style={{ color: entidadColor }}
          >
            {entidadNombre}
          </p>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {areas.map((area) => {
          const isSelected = area.id === selectedAreaId;
          return (
            <div
              key={area.id}
              onClick={() => setSelectedAreaId(area.id)}
              style={{ borderLeftColor: entidadColor }}
              className={`w-full rounded-2xl border border-l-4 p-3 cursor-pointer bg-background shadow-sm transition-all duration-150 ease-out ${
                isSelected
                  ? 'shadow-md'
                  : 'hover:bg-foreground/2 hover:shadow-md'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 p-1"
                  style={{ backgroundColor: `${entidadColor}1A` }}
                >
                  <Building2 size={20} style={{ color: entidadColor }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground whitespace-normal wrap-break-word">{area.nombre}</h3>
                  <p className="text-xs text-foreground-secondary">{area.codigo}</p>
                </div>
              </div>

              {area.descripcion && (
                <p className="text-xs text-foreground-secondary mt-2 pt-2 border-t border-border line-clamp-2">
                  {area.descripcion}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <Pagination
        page={page}
        limit={limit}
        total={total}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      {selectedAreaId && (
        <div className="mt-4 p-4 rounded-2xl border border-border bg-background shadow-sm">
          <p className="text-xs font-medium text-foreground-secondary uppercase tracking-wide mb-2">
            Información del personal
          </p>
          {loadingPe && <p className="text-sm text-foreground-secondary">Cargando...</p>}
          {errorPe && <p className="text-sm text-danger">{errorPe}</p>}
          {!loadingPe && !errorPe && areaPe && (
            <div className="space-y-1">
              <p className="text-sm text-foreground">
                <span className="font-medium">Cargo:</span> {areaPe.cargo}
              </p>
              <p className="text-sm text-foreground">
                <span className="font-medium">Rol:</span> {areaPe.rol}
              </p>
              <p className="text-sm text-foreground">
                <span className="font-medium">Estado:</span>{' '}
                {areaPe.estado === 1 ? 'Activo' : 'Inactivo'}
              </p>
              {areaPe.fecha_expiracion && (
                <p className="text-sm text-foreground">
                  <span className="font-medium">Expiración:</span>{' '}
                  {new Date(areaPe.fecha_expiracion).toLocaleDateString('es-CL')}
                </p>
              )}
            </div>
          )}
          {!loadingPe && !errorPe && !areaPe && (
            <p className="text-sm text-foreground-secondary">Sin información de personal</p>
          )}
        </div>
      )}
    </div>
  );
}
