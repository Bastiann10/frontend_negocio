import { useState, useEffect, useCallback, useRef } from 'react';
import { MoreVertical, Edit, Mail, Phone } from 'lucide-react';
import { getPerfil, updatePerfil, type Perfil as PerfilType, type PerfilResumen, type UpdatePerfilPayload } from '../services/perfil';
import { getEntidades, type EntidadResumen } from '../../entidades/services/entidades';
import { getAreas, getAreaPe, type AreaResumen, type AreaPe } from '../../areas/services/areas';
import { getAsignacionesByAreaPe, type Asignacion } from '../../asignaciones/services/asignaciones';
import { formatChileanRut } from '../../../core/utils/format';
import { EntidadDropdown, AreasAccordion } from '../../entidades/components/EntidadAreaSelector';
import AreaDetalle, { PersonalMetricCards } from '../../entidades/components/AreaDetalle';
import EditarPerfilModal from '../components/EditarPerfilModal';
import Loading from '../../../core/components/Loading';

export default function PerfilPage() {
  // --- Perfil ---
  const [perfil, setPerfil] = useState<PerfilType | null>(null);
  const [resumen, setResumen] = useState<PerfilResumen | null>(null);
  const [errorPerfil, setErrorPerfil] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

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

  // --- Asignaciones ---
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);
  const [loadingAsignaciones, setLoadingAsignaciones] = useState(false);
  const [errorAsignaciones, setErrorAsignaciones] = useState<string | null>(null);
  const [selectedAsignacionId, setSelectedAsignacionId] = useState<number | null>(null);
  const [selectedAnio, setSelectedAnio] = useState<number | null>(null);

  // Carga del perfil
  useEffect(() => {
    getPerfil()
      .then((data) => {
        setPerfil(data.perfil);
        setResumen(data.resumen);
      })
      .catch((err: any) => setErrorPerfil(err.message));
  }, []);

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

  useEffect(() => {
    if (!searchAreas && selectedAreaId !== null) {
      setSelectedArea(areas.find((a) => a.id === selectedAreaId));
    }
  }, [selectedAreaId, areas, searchAreas]);

  const totalPagesAreas = Math.max(1, Math.ceil(totalAreas / limitAreas));

  // Carga del personal del área
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

  const handleSavePerfil = async (payload: UpdatePerfilPayload): Promise<string> => {
    const res = await updatePerfil(payload);
    // Recargar perfil
    const data = await getPerfil();
    setPerfil(data.perfil);
    setResumen(data.resumen);
    return res.message;
  };

  if (errorPerfil) {
    return <p className="text-danger">{errorPerfil}</p>;
  }

  return (
    <div className="space-y-6">
      {/* 3 cards arriba: Perfil | Entidad | Área */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)_minmax(0,1.4fr)] gap-4 lg:gap-6 items-stretch">
        {/* Card 1: Perfil */}
        {perfil ? (
          <div className="rounded-2xl border border-border bg-linear-to-b from-background-secondary/50 to-background-secondary p-5">
            <div className="flex items-start gap-4">
              <div className="flex items-center gap-4 min-w-0">
                {perfil.foto_url ? (
                  <img
                    src={perfil.foto_url.startsWith('http') ? perfil.foto_url : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}${perfil.foto_url}`}
                    alt={perfil.nombre}
                    className="w-14 h-14 rounded-xl object-cover shrink-0 ring-1 ring-border max-[500px]:hidden"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-linear-to-br from-foreground/10 to-foreground/20 flex items-center justify-center shrink-0 ring-1 ring-border max-[500px]:hidden">
                    <span className="text-xl font-bold tracking-wider text-foreground-secondary">
                      {perfil.nombre.charAt(0)}{perfil.apellido.charAt(0)}
                    </span>
                  </div>
                )}

                <div className="min-w-0">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-success shrink-0" title="Activo" />
                    <h1 className="text-xl font-bold tracking-tight text-foreground">
                      {perfil.nombre} {perfil.apellido} {perfil.segundo_apellido ?? ''}
                    </h1>
                  </div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-foreground/5 text-foreground-secondary border border-border w-fit mt-1">
                    {formatChileanRut(perfil.rut)}
                  </span>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs font-medium text-foreground-secondary">
                    <span className="flex items-center gap-1.5 min-w-0">
                      <Mail size={12} className="shrink-0" />
                      <span className="break-all">{perfil.correo}</span>
                    </span>
                    {perfil.telefono && (
                      <span className="flex items-center gap-1.5 shrink-0">
                        <Phone size={12} />
                        {perfil.telefono}
                      </span>
                    )}
                  </div>

                  {perfil.profesion_personal.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {perfil.profesion_personal.map((p) => (
                        <span
                          key={p.id}
                          className="px-2 py-0.5 rounded-md text-xs font-medium bg-background border border-border text-foreground"
                        >
                          {p.profesion.nombre}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="relative shrink-0 ml-auto" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((o) => !o)}
                  title="Acciones"
                  className="p-2 rounded-xl border border-border bg-background text-foreground hover:bg-foreground/5 hover:border-foreground/20 transition-colors cursor-pointer"
                >
                  <MoreVertical size={16} />
                </button>
                {menuOpen && (
                  <div className="absolute z-20 top-full right-0 mt-1 rounded-lg border border-border bg-background shadow-lg overflow-hidden min-w-40 origin-top animate-[dropdown-in_0.05s_ease-out]">
                    <button
                      className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-foreground/5 cursor-pointer flex items-center gap-2"
                      onClick={() => {
                        setMenuOpen(false);
                        setEditModalOpen(true);
                      }}
                    >
                      <Edit size={14} /> Editar
                    </button>
                  </div>
                )}
              </div>
            </div>

            {resumen && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-background/60 border border-border text-xs mt-4 flex-wrap">
                <span className="text-foreground-secondary uppercase font-medium">Entidades: <strong className="text-foreground">{resumen.entidades}</strong></span>
                <span className="text-border">|</span>
                <span className="text-foreground-secondary uppercase font-medium">Áreas: <strong className="text-foreground">{resumen.areas}</strong></span>
                <span className="text-border">|</span>
                <span className="text-foreground-secondary uppercase font-medium">Trim. ({resumen.anio}): <strong className="text-foreground">{resumen.trimestres_iniciados}</strong></span>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-linear-to-b from-background-secondary/50 to-background-secondary p-5">
            <Loading text="Cargando perfil..." size="sm" />
          </div>
        )}

        {/* Card 2: Entidad */}
        <div className="rounded-2xl border border-border bg-background-secondary p-5 h-full">
          <EntidadDropdown
            entidades={entidades}
            loading={loadingEntidades}
            error={errorEntidades}
            selectedId={selectedEntidadId}
            onSelect={setSelectedEntidadId}
            selectedEntidad={selectedEntidad}
            onSearch={searchEntidades}
          />
        </div>

        {/* Card 3: Área */}
        <div className="rounded-2xl border border-border bg-background-secondary p-5 h-full flex flex-col gap-3">
          <AreasAccordion
            areas={areas}
            loading={loadingAreas}
            error={errorAreas}
            selectedAreaId={selectedAreaId}
            onSelectArea={setSelectedAreaId}
            selectedEntidad={selectedEntidad}
            loadingEntidades={loadingEntidades}
            pageAreas={pageAreas}
            limitAreas={limitAreas}
            totalAreas={totalAreas}
            totalPagesAreas={totalPagesAreas}
            onPageAreasChange={setPageAreas}
            onSearch={setSearchAreas}
          />

          {selectedArea && (
            <PersonalMetricCards
              areaPe={areaPe}
              loadingPe={loadingPe}
              errorPe={errorPe}
            />
          )}
        </div>
      </div>

      {/* Detalle abajo */}
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

      {/* Modal de edición */}
      <EditarPerfilModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        perfil={perfil}
        onSave={handleSavePerfil}
      />
    </div>
  );
}
