import { useState, useEffect, useCallback } from 'react';
import { getEntidades, type EntidadResumen } from '../services/entidades';
import { getAreas, getAreaPe, type AreaResumen, type AreaPe } from '../../areas/services/areas';
import { getAsignacionesByAreaPe, type Asignacion } from '../../asignaciones/services/asignaciones';
import EntidadAreaSelector from '../components/EntidadAreaSelector';
import AreaDetalle from '../components/AreaDetalle';

export default function ListaEntidadPage() {
  // --- Entidades ---
  const [entidades, setEntidades] = useState<EntidadResumen[]>([]);
  const [loadingEntidades, setLoadingEntidades] = useState(true);
  const [errorEntidades, setErrorEntidades] = useState<string | null>(null);
  const [selectedEntidadId, setSelectedEntidadId] = useState<number | null>(null);

  // --- Áreas ---
  const [areas, setAreas] = useState<AreaResumen[]>([]);
  const [loadingAreas, setLoadingAreas] = useState(false);
  const [errorAreas, setErrorAreas] = useState<string | null>(null);
  const [selectedAreaId, setSelectedAreaId] = useState<number | null>(null);
  const [selectedArea, setSelectedArea] = useState<AreaResumen | undefined>(undefined);
  const [pageAreas, setPageAreas] = useState(1);
  const [limitAreas] = useState(10);
  const [totalAreas, setTotalAreas] = useState(0);
  const [searchAreas, setSearchAreas] = useState('');

  // --- Personal del área ---
  const [areaPe, setAreaPe] = useState<AreaPe | null>(null);
  const [loadingPe, setLoadingPe] = useState(false);
  const [errorPe, setErrorPe] = useState<string | null>(null);

  // --- Asignaciones del personal ---
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);
  const [loadingAsignaciones, setLoadingAsignaciones] = useState(false);
  const [errorAsignaciones, setErrorAsignaciones] = useState<string | null>(null);
  const [selectedAsignacionId, setSelectedAsignacionId] = useState<number | null>(null);
  const [selectedAnio, setSelectedAnio] = useState<number | null>(null);

  // Carga inicial de entidades
  useEffect(() => {
    getEntidades()
      .then((data) => {
        setEntidades(data.entidades);
        if (data.entidades.length > 0) {
          setSelectedEntidadId(data.entidades[0].id);
        }
      })
      .catch((err: any) => setErrorEntidades(err.message || 'Error al cargar entidades'))
      .finally(() => setLoadingEntidades(false));
  }, []);

  // Búsqueda de entidades vía API
  const searchEntidades = useCallback(async (query: string) => {
    try {
      setLoadingEntidades(true);
      setErrorEntidades(null);
      const data = await getEntidades(query);
      setEntidades(data.entidades);
    } catch (err: any) {
      setErrorEntidades(err.message || 'Error al buscar entidades');
    } finally {
      setLoadingEntidades(false);
    }
  }, []);

  const selectedEntidad = entidades.find((e) => e.id === selectedEntidadId);

  // Reset al cambiar de entidad
  useEffect(() => {
    setPageAreas(1);
    setSelectedAreaId(null);
    setSelectedArea(undefined);
    setAreaPe(null);
    setErrorPe(null);
    setSearchAreas('');
    setSelectedAnio(null);
  }, [selectedEntidadId]);

  // Carga de áreas
  const fetchAreas = useCallback(async () => {
    if (!selectedEntidadId) {
      setAreas([]);
      setTotalAreas(0);
      return;
    }
    try {
      setLoadingAreas(true);
      setErrorAreas(null);
      const response = await getAreas(selectedEntidadId, pageAreas, limitAreas, searchAreas);
      setAreas(response.areas);
      setTotalAreas(response.total);
      if (!searchAreas) {
        setSelectedAreaId((prev) => {
          if (prev !== null && response.areas.some((a) => a.id === prev)) return prev;
          return response.areas.length > 0 ? response.areas[0].id : null;
        });
      }
    } catch (err: any) {
      setErrorAreas(err.message || 'Error al cargar áreas');
      setAreas([]);
      setTotalAreas(0);
      if (!searchAreas) {
        setSelectedAreaId(null);
      }
    } finally {
      setLoadingAreas(false);
    }
  }, [selectedEntidadId, pageAreas, limitAreas, searchAreas]);

  useEffect(() => {
    fetchAreas();
  }, [fetchAreas]);

  // Actualizar selectedArea solo cuando cambia selectedAreaId o areas (sin búsqueda)
  useEffect(() => {
    if (!searchAreas && selectedAreaId !== null) {
      setSelectedArea(areas.find((a) => a.id === selectedAreaId));
    }
  }, [selectedAreaId, areas, searchAreas]);

  const totalPagesAreas = Math.max(1, Math.ceil(totalAreas / limitAreas));

  // Carga del personal del área seleccionada
  useEffect(() => {
    if (!selectedAreaId || !selectedEntidadId) {
      setAreaPe(null);
      setErrorPe(null);
      setAsignaciones([]);
      setErrorAsignaciones(null);
      return;
    }
    setLoadingPe(true);
    setErrorPe(null);
    getAreaPe(selectedAreaId, selectedEntidadId)
      .then((data) => setAreaPe(data.area_pe))
      .catch((err: any) => setErrorPe(err.message || 'Error al cargar información del personal'))
      .finally(() => setLoadingPe(false));
  }, [selectedAreaId, selectedEntidadId]);

  // Carga de asignaciones
  useEffect(() => {
    if (!areaPe?.id) {
      setAsignaciones([]);
      setErrorAsignaciones(null);
      setSelectedAsignacionId(null);
      return;
    }
    setLoadingAsignaciones(true);
    setErrorAsignaciones(null);
    getAsignacionesByAreaPe(areaPe.id, selectedAnio ?? undefined)
      .then((data) => {
        setAsignaciones(data.asignaciones);
        const actual = data.asignaciones.find((a) => a.es_actual) ?? data.asignaciones[0];
        setSelectedAsignacionId(actual ? actual.id : null);
      })
      .catch((err: any) => setErrorAsignaciones(err.message || 'Error al cargar asignaciones'))
      .finally(() => setLoadingAsignaciones(false));
  }, [areaPe?.id, selectedAnio]);

  return (
    <div className="bg-background">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Entidades y Áreas</h1>
        <p className="text-sm text-foreground">
          Selecciona una entidad y un área para ver el personal y sus asignaciones TLD
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] gap-4 lg:gap-6 items-start">
        <EntidadAreaSelector
          entidades={entidades}
          loadingEntidades={loadingEntidades}
          errorEntidades={errorEntidades}
          selectedEntidadId={selectedEntidadId}
          onSelectEntidad={setSelectedEntidadId}
          selectedEntidad={selectedEntidad}
          onSearchEntidades={searchEntidades}
          areas={areas}
          loadingAreas={loadingAreas}
          errorAreas={errorAreas}
          selectedAreaId={selectedAreaId}
          onSelectArea={setSelectedAreaId}
          pageAreas={pageAreas}
          limitAreas={limitAreas}
          totalAreas={totalAreas}
          totalPagesAreas={totalPagesAreas}
          onPageAreasChange={setPageAreas}
          onSearchAreas={setSearchAreas}
        />

        <AreaDetalle
          selectedEntidad={selectedEntidad}
          selectedArea={selectedArea}
          loadingEntidades={loadingEntidades}
          loadingAreas={loadingAreas}
          areaPe={areaPe}
          loadingPe={loadingPe}
          errorPe={errorPe}
          asignaciones={asignaciones}
          loadingAsignaciones={loadingAsignaciones}
          errorAsignaciones={errorAsignaciones}
          selectedAsignacionId={selectedAsignacionId}
          onSelectAsignacion={setSelectedAsignacionId}
          selectedAnio={selectedAnio}
          onSelectAnio={setSelectedAnio}
        />
      </div>
    </div>
  );
}
