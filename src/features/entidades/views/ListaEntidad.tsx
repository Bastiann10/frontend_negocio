import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Building2, Layers, Users, ChevronRight, ChevronDown,
  Inbox, CreditCard, Calendar, Send, ArrowDownToLine, ArrowUpFromLine,
  CircleDot, Search, MoreVertical, Edit, Plus, Check, Clock,
  RefreshCw, AlertTriangle, Link2, Unlink, PackageCheck,
} from 'lucide-react';
import { getEntidades, type EntidadResumen } from '../services/entidades';
import { getAreas, getAreaPe, type AreaResumen, type AreaPe } from '../../areas/services/areas';
import { getAsignacionesByAreaPe, type Asignacion } from '../../asignaciones/services/asignaciones';
import { formatChileanRut, formatDateTime } from '../../../core/utils/format';
import { getRolById } from '../../../core/config/rol';
import { getEstadoAsignacionTLD } from '../../../core/config/estados';
import Loading from '../../../core/components/Loading';
import Pagination from '../../../core/components/Pagination';
import SmartImage from '../../../core/components/SmartImage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

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
  const [pageAreas, setPageAreas] = useState(1);
  const [limitAreas] = useState(10);
  const [totalAreas, setTotalAreas] = useState(0);

  // --- Personal del área ---
  const [areaPe, setAreaPe] = useState<AreaPe | null>(null);
  const [loadingPe, setLoadingPe] = useState(false);
  const [errorPe, setErrorPe] = useState<string | null>(null);

  // --- Asignaciones del personal ---
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);
  const [loadingAsignaciones, setLoadingAsignaciones] = useState(false);
  const [errorAsignaciones, setErrorAsignaciones] = useState<string | null>(null);

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

  const selectedEntidad = entidades.find((e) => e.id === selectedEntidadId);

  // Reset al cambiar de entidad
  useEffect(() => {
    setPageAreas(1);
    setSelectedAreaId(null);
    setAreaPe(null);
    setErrorPe(null);
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
      const response = await getAreas(selectedEntidadId, pageAreas, limitAreas);
      setAreas(response.areas);
      setTotalAreas(response.total);
      setSelectedAreaId((prev) => {
        if (prev !== null && response.areas.some((a) => a.id === prev)) return prev;
        return response.areas.length > 0 ? response.areas[0].id : null;
      });
    } catch (err: any) {
      setErrorAreas(err.message || 'Error al cargar áreas');
      setAreas([]);
      setTotalAreas(0);
      setSelectedAreaId(null);
    } finally {
      setLoadingAreas(false);
    }
  }, [selectedEntidadId, pageAreas, limitAreas]);

  useEffect(() => {
    fetchAreas();
  }, [fetchAreas]);

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
      return;
    }
    setLoadingAsignaciones(true);
    setErrorAsignaciones(null);
    getAsignacionesByAreaPe(areaPe.id)
      .then((data) => setAsignaciones(data.asignaciones))
      .catch((err: any) => setErrorAsignaciones(err.message || 'Error al cargar asignaciones'))
      .finally(() => setLoadingAsignaciones(false));
  }, [areaPe?.id]);

  const selectedArea = areas.find((a) => a.id === selectedAreaId);

  return (
    <div className="bg-background">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Entidades y Áreas</h1>
        <p className="text-sm text-foreground-secondary">
          Selecciona una entidad y un área para ver el personal y sus asignaciones TLD
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] gap-4 lg:gap-6 items-start">
        {/* ============== COLUMNA IZQUIERDA: Master Sidebar ============== */}
        <MasterSidebar
          entidades={entidades}
          loadingEntidades={loadingEntidades}
          errorEntidades={errorEntidades}
          selectedEntidadId={selectedEntidadId}
          onSelectEntidad={setSelectedEntidadId}
          selectedEntidad={selectedEntidad}
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
        />

        {/* ============== COLUMNA DERECHA: Workspace ============== */}
        <AreaWorkspace
          selectedEntidad={selectedEntidad}
          selectedArea={selectedArea}
          areaPe={areaPe}
          loadingPe={loadingPe}
          errorPe={errorPe}
          asignaciones={asignaciones}
          loadingAsignaciones={loadingAsignaciones}
          errorAsignaciones={errorAsignaciones}
        />
      </div>
    </div>
  );
}

/* =================================================================== */
/* ====================  COLUMNA IZQUIERDA  ========================== */
/* =================================================================== */

interface MasterSidebarProps {
  entidades: EntidadResumen[];
  loadingEntidades: boolean;
  errorEntidades: string | null;
  selectedEntidadId: number | null;
  onSelectEntidad: (id: number) => void;
  selectedEntidad?: EntidadResumen;
  areas: AreaResumen[];
  loadingAreas: boolean;
  errorAreas: string | null;
  selectedAreaId: number | null;
  onSelectArea: (id: number) => void;
  pageAreas: number;
  limitAreas: number;
  totalAreas: number;
  totalPagesAreas: number;
  onPageAreasChange: (p: number) => void;
}

function MasterSidebar(props: MasterSidebarProps) {
  return (
    <aside className="flex flex-col gap-3 lg:sticky lg:top-6">
      <EntidadDropdown
        entidades={props.entidades}
        loading={props.loadingEntidades}
        error={props.errorEntidades}
        selectedId={props.selectedEntidadId}
        onSelect={props.onSelectEntidad}
        selectedEntidad={props.selectedEntidad}
      />

      <AreasAccordion
        areas={props.areas}
        loading={props.loadingAreas}
        error={props.errorAreas}
        selectedAreaId={props.selectedAreaId}
        onSelectArea={props.onSelectArea}
        selectedEntidad={props.selectedEntidad}
        pageAreas={props.pageAreas}
        limitAreas={props.limitAreas}
        totalAreas={props.totalAreas}
        totalPagesAreas={props.totalPagesAreas}
        onPageAreasChange={props.onPageAreasChange}
      />
    </aside>
  );
}

/* ---------- Entidad Dropdown + tarjeta compacta ---------- */

function EntidadDropdown({
  entidades,
  loading,
  error,
  selectedId,
  onSelect,
  selectedEntidad,
}: {
  entidades: EntidadResumen[];
  loading: boolean;
  error: string | null;
  selectedId: number | null;
  onSelect: (id: number) => void;
  selectedEntidad?: EntidadResumen;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  // Cerrar al clickear fuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entidades;
    return entidades.filter(
      (e) =>
        e.nombre.toLowerCase().includes(q) ||
        e.rut.toLowerCase().includes(q),
    );
  }, [entidades, query]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 px-1">
        <span className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 bg-foreground/5 text-foreground-secondary">
          <Building2 size={14} />
        </span>
        <h2 className="text-xs font-semibold text-foreground-secondary uppercase tracking-wide">
          Entidad
        </h2>
      </div>

      {loading && <Loading text="Cargando entidades" />}
      {error && <p className="text-danger text-sm text-center py-4">{error}</p>}

      {!loading && !error && (
        <>
          {/* Dropdown button */}
          <div className="relative" ref={ref}>
            <button
              onClick={() => setOpen((o) => !o)}
              className="w-full text-left rounded-xl border border-border bg-background-secondary p-3 cursor-pointer transition-all duration-150 hover:bg-foreground/3 flex items-center gap-3"
              style={
                selectedEntidad
                  ? { borderLeft: `4px solid ${selectedEntidad.color_primario}` }
                  : undefined
              }
            >
              {selectedEntidad ? (
                <>
                  {selectedEntidad.logo_url ? (
                    <SmartImage
                      src={
                        selectedEntidad.logo_url.startsWith('http')
                          ? selectedEntidad.logo_url
                          : `${API_BASE_URL}${selectedEntidad.logo_url}`
                      }
                      alt={`Logo ${selectedEntidad.nombre}`}
                      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 p-1 bg-white/60 dark:bg-black/20"
                      imgClassName="w-full h-full object-contain"
                    />
                  ) : (
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${selectedEntidad.color_primario}1A` }}
                    >
                      <Building2 size={16} style={{ color: selectedEntidad.color_primario }} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm truncate">
                      {selectedEntidad.nombre}
                    </p>
                    <p className="text-xs text-foreground-secondary">
                      {formatChileanRut(selectedEntidad.rut)}
                    </p>
                  </div>
                  <ChevronDown
                    size={16}
                    className={`text-foreground-secondary shrink-0 transition-transform duration-150 ${
                      open ? 'rotate-180' : ''
                    }`}
                  />
                </>
              ) : (
                <span className="text-sm text-foreground-secondary flex-1">
                  Selecciona una entidad...
                </span>
              )}
            </button>

            {/* Dropdown panel */}
            {open && (
              <div className="absolute z-20 top-full left-0 right-0 mt-1 rounded-xl border border-border bg-background shadow-lg overflow-hidden">
                {/* Buscador */}
                <div className="p-2 border-b border-border">
                  <div className="relative">
                    <Search
                      size={14}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 text-foreground-secondary"
                    />
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Buscar entidad o RUT..."
                      autoFocus
                      className="w-full pl-8 pr-3 py-1.5 text-sm rounded-lg bg-background-secondary border border-border text-foreground placeholder:text-foreground-secondary focus:outline-none focus:ring-1 focus:ring-primary/40"
                    />
                  </div>
                </div>

                {/* Lista */}
                <div className="max-h-72 overflow-y-auto">
                  {filtered.length === 0 && (
                    <p className="text-sm text-foreground-secondary text-center py-6">
                      Sin resultados
                    </p>
                  )}
                  {filtered.map((entidad) => {
                    const isSelected = entidad.id === selectedId;
                    return (
                      <button
                        key={entidad.id}
                        onClick={() => {
                          onSelect(entidad.id);
                          setOpen(false);
                          setQuery('');
                        }}
                        className={`w-full text-left px-3 py-2.5 cursor-pointer flex items-center gap-3 transition-colors ${
                          isSelected ? 'bg-foreground/5' : 'hover:bg-foreground/3'
                        }`}
                        style={{ borderLeft: `3px solid ${entidad.color_primario}` }}
                      >
                        {entidad.logo_url ? (
                          <SmartImage
                            src={
                              entidad.logo_url.startsWith('http')
                                ? entidad.logo_url
                                : `${API_BASE_URL}${entidad.logo_url}`
                            }
                            alt={`Logo ${entidad.nombre}`}
                            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 p-1 bg-white/60 dark:bg-black/20"
                            imgClassName="w-full h-full object-contain"
                          />
                        ) : (
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                            style={{ backgroundColor: `${entidad.color_primario}1A` }}
                          >
                            <Building2 size={14} style={{ color: entidad.color_primario }} />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground text-sm truncate">
                            {entidad.nombre}
                          </p>
                          <p className="text-xs text-foreground-secondary">
                            {formatChileanRut(entidad.rut)}
                          </p>
                        </div>
                        {isSelected && (
                          <Check size={14} className="text-primary shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/* ---------- Areas Accordion ---------- */

function AreasAccordion({
  areas,
  loading,
  error,
  selectedAreaId,
  onSelectArea,
  selectedEntidad,
  pageAreas,
  limitAreas,
  totalAreas,
  totalPagesAreas,
  onPageAreasChange,
}: {
  areas: AreaResumen[];
  loading: boolean;
  error: string | null;
  selectedAreaId: number | null;
  onSelectArea: (id: number) => void;
  selectedEntidad?: EntidadResumen;
  pageAreas: number;
  limitAreas: number;
  totalAreas: number;
  totalPagesAreas: number;
  onPageAreasChange: (p: number) => void;
}) {
  const [query, setQuery] = useState('');
  const accent = selectedEntidad?.color_primario;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return areas;
    return areas.filter(
      (a) =>
        a.nombre.toLowerCase().includes(q) ||
        a.codigo.toLowerCase().includes(q),
    );
  }, [areas, query]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 px-1">
        <span
          className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
          style={accent ? { backgroundColor: `${accent}1A`, color: accent } : undefined}
        >
          <Layers size={14} />
        </span>
        <h2 className="text-xs font-semibold text-foreground-secondary uppercase tracking-wide">
          Áreas
        </h2>
        {totalAreas > 0 && (
          <span className="text-xs text-foreground-secondary bg-foreground/5 rounded-full px-2 py-0.5">
            {totalAreas}
          </span>
        )}
      </div>

      {!selectedEntidad && !loading && (
        <EmptyState text="Selecciona una entidad" />
      )}

      {selectedEntidad && loading && <Loading text="Cargando áreas" />}

      {selectedEntidad && !loading && error && (
        <p className="text-danger text-sm text-center py-4">{error}</p>
      )}

      {selectedEntidad && !loading && !error && (
        <>
          {/* Filtro rápido */}
          {areas.length > 0 && (
            <div className="relative">
              <Search
                size={14}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-foreground-secondary"
              />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filtrar área..."
                className="w-full pl-8 pr-3 py-1.5 text-sm rounded-lg bg-background border border-border text-foreground placeholder:text-foreground-secondary focus:outline-none focus:ring-1 focus:ring-primary/40"
              />
            </div>
          )}

          {areas.length === 0 && <EmptyState text="Sin áreas asignadas" />}

          {areas.length > 0 && filtered.length === 0 && (
            <p className="text-sm text-foreground-secondary text-center py-4">
              Sin coincidencias
            </p>
          )}

          {/* Lista accordion */}
          <div className="flex flex-col gap-1.5">
            {filtered.map((area) => {
              const isSelected = area.id === selectedAreaId;
              return (
                <AreaAccordionItem
                  key={area.id}
                  area={area}
                  isSelected={isSelected}
                  onSelect={() => onSelectArea(area.id)}
                  accent={accent}
                />
              );
            })}
          </div>

          {/* Paginación */}
          {totalAreas > limitAreas && (
            <Pagination
              page={pageAreas}
              limit={limitAreas}
              total={totalAreas}
              totalPages={totalPagesAreas}
              onPageChange={onPageAreasChange}
            />
          )}
        </>
      )}
    </div>
  );
}

function AreaAccordionItem({
  area,
  isSelected,
  onSelect,
  accent,
}: {
  area: AreaResumen;
  isSelected: boolean;
  onSelect: () => void;
  accent?: string;
}) {
  // El item es siempre "expanded" cuando está seleccionado (muestra preview),
  // colapsado cuando no. Click selecciona.
  return (
    <button
      onClick={onSelect}
      className={`text-left w-full rounded-xl border border-border bg-background-secondary p-3 cursor-pointer transition-all duration-150 ease-out ${
        isSelected ? 'border-foreground bg-foreground/3' : 'hover:bg-foreground/3'
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={accent ? { backgroundColor: `${accent}1A` } : undefined}
        >
          <Layers size={14} style={{ color: accent }} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-foreground text-sm truncate">{area.nombre}</h3>
          <p className="text-xs text-foreground-secondary truncate">{area.codigo}</p>
        </div>
        <ChevronRight
          size={16}
          className={`text-foreground-secondary shrink-0 transition-transform duration-150 ${
            isSelected ? 'rotate-90' : ''
          }`}
        />
      </div>
      {isSelected && area.descripcion && (
        <p className="text-xs text-foreground-secondary mt-2 pt-2 border-t border-border line-clamp-2">
          {area.descripcion}
        </p>
      )}
    </button>
  );
}

/* =================================================================== */
/* =====================  COLUMNA DERECHA  =========================== */
/* =================================================================== */

interface AreaWorkspaceProps {
  selectedEntidad?: EntidadResumen;
  selectedArea?: AreaResumen;
  areaPe: AreaPe | null;
  loadingPe: boolean;
  errorPe: string | null;
  asignaciones: Asignacion[];
  loadingAsignaciones: boolean;
  errorAsignaciones: string | null;
}

function AreaWorkspace(props: AreaWorkspaceProps) {
  const { selectedEntidad, selectedArea, areaPe, loadingPe, errorPe } = props;
  const accent = selectedEntidad?.color_primario;

  if (!selectedArea) {
    return (
      <section className="rounded-2xl border border-dashed border-border bg-background-secondary/50 min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
        <Inbox size={32} className="text-foreground-secondary mb-3" />
        <p className="text-sm text-foreground-secondary">
          Selecciona un área para ver su detalle
        </p>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-4">
      {/* ----- Header del área ----- */}
      <AreaHeader
        selectedEntidad={selectedEntidad}
        selectedArea={selectedArea}
        areaPe={areaPe}
        accent={accent}
      />

      {/* ----- Ficha de personal (Metric Cards) ----- */}
      <PersonalMetricCards
        areaPe={areaPe}
        loadingPe={loadingPe}
        errorPe={errorPe}
        accent={accent}
      />

      {/* ----- Asignaciones TLD ----- */}
      <AsignacionesSection
        asignaciones={props.asignaciones}
        loading={props.loadingAsignaciones}
        error={props.errorAsignaciones}
        hasAreaPe={!!areaPe}
      />
    </section>
  );
}

/* ---------- Header del área ---------- */

function AreaHeader({
  selectedEntidad,
  selectedArea,
  areaPe,
  accent,
}: {
  selectedEntidad?: EntidadResumen;
  selectedArea: AreaResumen;
  areaPe: AreaPe | null;
  accent?: string;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
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

  const activo = areaPe?.estado === 1;

  return (
    <div
      className="rounded-2xl bg-background-secondary border border-border p-5"
      style={accent ? { borderTop: `3px solid ${accent}` } : undefined}
    >
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-foreground-secondary mb-2">
        <Building2 size={12} />
        <span className="truncate">{selectedEntidad?.nombre ?? 'Entidad'}</span>
        <ChevronRight size={12} />
        <span className="text-foreground font-medium truncate">{selectedArea.nombre}</span>
      </div>

      {/* Título + acciones */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
            style={accent ? { backgroundColor: `${accent}1A` } : undefined}
          >
            <Layers size={20} style={{ color: accent }} />
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-semibold text-foreground truncate">
              {selectedArea.nombre}
            </h2>
            <p className="text-sm text-foreground-secondary">
              {selectedArea.codigo}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {areaPe && (
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${
                activo ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
              }`}
            >
              {activo ? 'Activo' : 'Inactivo'}
            </span>
          )}

          {/* Menu de acciones */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              title="Acciones"
              className="p-2 rounded-lg border border-border bg-background text-foreground hover:bg-foreground/5 cursor-pointer"
            >
              <MoreVertical size={16} />
            </button>
            {menuOpen && (
              <div className="absolute z-20 top-full right-0 mt-1 rounded-lg border border-border bg-background shadow-lg overflow-hidden min-w-[10rem]">
                <button
                  className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-foreground/5 cursor-pointer flex items-center gap-2"
                  onClick={() => setMenuOpen(false)}
                >
                  <Edit size={14} /> Editar
                </button>
                <button
                  className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-foreground/5 cursor-pointer flex items-center gap-2"
                  onClick={() => setMenuOpen(false)}
                >
                  <Plus size={14} /> Agregar personal
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Personal como Metric Cards ---------- */

function PersonalMetricCards({
  areaPe,
  loadingPe,
  errorPe,
  accent,
}: {
  areaPe: AreaPe | null;
  loadingPe: boolean;
  errorPe: string | null;
  accent?: string;
}) {
  if (loadingPe) return <Loading text="Cargando personal" />;

  if (errorPe) {
    return (
      <div className="rounded-2xl border border-danger/30 bg-danger/5 p-4 flex items-center gap-2 text-sm text-danger">
        <AlertTriangle size={16} />
        {errorPe}
      </div>
    );
  }

  if (!areaPe) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-background-secondary/50 p-8 flex flex-col items-center justify-center text-center">
        <Inbox size={24} className="text-foreground-secondary mb-2" />
        <p className="text-sm text-foreground-secondary">Sin información de personal</p>
      </div>
    );
  }

  const activo = areaPe.estado === 1;
  const expiracion = formatDateTime(areaPe.fecha_expiracion);

  const cards = [
    { icon: <Users size={14} />, label: 'Cargo', value: areaPe.cargo },
    { icon: <CreditCard size={14} />, label: 'Rol', value: getRolById(areaPe.rol)?.descripcion ?? String(areaPe.rol) },
    {
      icon: <CircleDot size={14} />,
      label: 'Estado',
      value: activo ? 'Activo' : 'Inactivo',
      tone: activo ? ('success' as const) : ('danger' as const),
    },
    { icon: <Calendar size={14} />, label: 'Expiración', value: expiracion },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 px-1">
        <span
          className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
          style={accent ? { backgroundColor: `${accent}1A`, color: accent } : undefined}
        >
          <Users size={14} />
        </span>
        <h3 className="text-xs font-semibold text-foreground-secondary uppercase tracking-wide">
          Personal del área
        </h3>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-xl border border-border bg-background-secondary p-4 flex flex-col gap-2"
          >
            <div className="flex items-center gap-1.5 text-foreground-secondary">
              {c.icon}
              <span className="text-xs uppercase tracking-wide">{c.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`text-sm font-medium ${
                  c.tone === 'success'
                    ? 'text-success'
                    : c.tone === 'danger'
                      ? 'text-danger'
                      : 'text-foreground'
                }`}
              >
                {c.value}
              </span>
              {c.tone && (
                <span
                  className={`w-2 h-2 rounded-full ${
                    c.tone === 'success' ? 'bg-success' : 'bg-danger'
                  }`}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer con metadatos secundarios */}
      <div className="flex items-center gap-4 text-xs text-foreground-secondary px-1">
        <span className="flex items-center gap-1" title="Fecha de creación">
          <Clock size={12} /> Creado: {formatDateTime(areaPe.createdAt)}
        </span>
        <span className="flex items-center gap-1" title="Última actualización">
          <RefreshCw size={12} /> Actualizado: {formatDateTime(areaPe.updatedAt)}
        </span>
      </div>
    </div>
  );
}

/* =================================================================== */
/* ===================  ASIGNACIONES TLD  =========================== */
/* =================================================================== */

function AsignacionesSection({
  asignaciones,
  loading,
  error,
  hasAreaPe,
}: {
  asignaciones: Asignacion[];
  loading: boolean;
  error: string | null;
  hasAreaPe: boolean;
}) {
  if (!hasAreaPe) return null;

  return (
    <div className="rounded-2xl border border-border bg-background-secondary p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CreditCard size={14} className="text-foreground-secondary" />
          <h3 className="text-xs font-semibold text-foreground-secondary uppercase tracking-wide">
            Asignaciones TLD
          </h3>
          <span className="text-xs text-foreground-secondary bg-foreground/5 rounded-full px-2 py-0.5">
            {asignaciones.length}
          </span>
        </div>
      </div>

      {loading && <Loading text="Cargando asignaciones" />}

      {!loading && error && (
        <p className="text-danger text-sm text-center py-6">{error}</p>
      )}

      {!loading && !error && asignaciones.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Inbox size={24} className="text-foreground-secondary mb-2" />
          <p className="text-sm text-foreground-secondary">No han iniciado tus trimestres</p>
        </div>
      )}

      {!loading && !error && asignaciones.length > 0 && (
        <AsignacionesTimeline asignaciones={asignaciones} />
      )}
    </div>
  );
}

/* ---------- Stepper horizontal continuo ---------- */

function AsignacionesTimeline({ asignaciones }: { asignaciones: Asignacion[] }) {
  const inicial = asignaciones.find((a) => a.es_actual) ?? asignaciones[0] ?? null;
  const [selectedId, setSelectedId] = useState<number | null>(
    inicial ? inicial.id : null,
  );

  useEffect(() => {
    if (asignaciones.length === 0) {
      setSelectedId(null);
      return;
    }
    if (!asignaciones.some((a) => a.id === selectedId)) {
      const actual = asignaciones.find((a) => a.es_actual) ?? asignaciones[0];
      setSelectedId(actual.id);
    }
  }, [asignaciones, selectedId]);

  const selected = asignaciones.find((a) => a.id === selectedId) ?? null;

  return (
    <div className="flex flex-col gap-5">
      {/* Stepper */}
      <AsignacionesStepper
        asignaciones={asignaciones}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />

      {/* Card destacada */}
      {selected && <AsignacionDetail asignacion={selected} />}
    </div>
  );
}

function AsignacionesStepper({
  asignaciones,
  selectedId,
  onSelect,
}: {
  asignaciones: Asignacion[];
  selectedId: number | null;
  onSelect: (id: number) => void;
}) {
  const sorted = [...asignaciones].sort(
    (a, b) => (a.trimestre?.inicio ?? '').localeCompare(b.trimestre?.inicio ?? ''),
  );

  return (
    <div className="overflow-x-auto overflow-y-visible -mx-2 px-2 py-4">
      <div className="flex items-start min-w-full justify-center">
        {sorted.map((asignacion, idx) => {
          const trimestre = asignacion.trimestre;
          const isSelected = asignacion.id === selectedId;
          const esActual = asignacion.es_actual === true;
          const color = trimestre?.color ?? 'var(--color-foreground-secondary)';

          // Determinar estado del paso según el campo 'estado' de la asignación
          // 0=Gestionando, 1=En envío, 2=Recepcionado, 3=En uso, 4=Devuelta,
          // 5=Recepcionado devolución, 6=En lectura dosimetría, 7=Finalizado, 8=Fin del trimestre
          let stepStatus: 'completado' | 'actual' | 'pendiente' = 'pendiente';
          if (asignacion.estado >= 7) {
            stepStatus = 'completado';
          } else if (asignacion.estado > 0 || esActual) {
            stepStatus = 'actual';
          } else {
            stepStatus = 'pendiente';
          }

          const isLast = idx === sorted.length - 1;

          return (
            <div key={asignacion.id} className="flex items-start shrink-0">
              {/* Nodo + label */}
              <button
                onClick={() => onSelect(asignacion.id)}
                className="flex flex-col items-center gap-1.5 px-2 cursor-pointer group"
                title={
                  trimestre
                    ? `${trimestre.nombre_trimestre} ${trimestre.anio} · ${getEstadoAsignacionTLD(asignacion.estado).label}`
                    : `Asignación #${asignacion.id}`
                }
              >
                <span
                  className={`relative w-4 h-4 rounded-full ring-4 ring-background-secondary transition-transform duration-150 flex items-center justify-center ${
                    isSelected ? 'scale-110 timeline-node-active' : 'group-hover:scale-110'
                  }`}
                  style={{ backgroundColor: color }}
                >
                  {stepStatus === 'completado' && (
                    <Check size={10} className="text-background-secondary" strokeWidth={3} />
                  )}
                  {stepStatus === 'actual' && (
                    <CircleDot
                      size={12}
                      className="absolute text-background-secondary"
                      strokeWidth={3}
                    />
                  )}
                </span>
                <span
                  className={`text-xs whitespace-nowrap transition-colors ${
                    isSelected ? 'font-medium' : ''
                  }`}
                  style={isSelected ? { color } : { color: 'var(--color-foreground-secondary)' }}
                >
                  {trimestre
                    ? `${trimestre.nombre_trimestre.replace(' Trimestre', 'T')} ${trimestre.anio}`
                    : `#${asignacion.id}`}
                </span>
                <span className="flex items-center gap-1 text-xs font-medium whitespace-nowrap text-foreground-secondary">
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: getEstadoAsignacionTLD(asignacion.estado).color }}
                  />
                  {getEstadoAsignacionTLD(asignacion.estado).label}
                </span>
                {esActual && (
                  <span className="text-xs font-medium px-1.5 py-0.5 rounded-full whitespace-nowrap" style={{ color, backgroundColor: `${color}1a` }}>
                    Actual
                  </span>
                )}
              </button>

              {/* Conector */}
              {!isLast && (
                <div
                  className="flex-1 h-px mt-2 mx-2 min-w-[3rem]"
                  style={{ backgroundColor: color }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Card de asignación (2 columnas) ---------- */

function AsignacionDetail({ asignacion }: { asignacion: Asignacion }) {
  const tarjeta = asignacion.tarjeta_tld;
  const trimestre = asignacion.trimestre;
  const estadoInfo = getEstadoAsignacionTLD(asignacion.estado);
  const estadoLabel = estadoInfo.label;
  const estadoColor = estadoInfo.color;
  const color = trimestre?.color ?? 'var(--color-foreground-secondary)';

  const fmtDate = (d: string | null | undefined) =>
    d ? formatDateTime(d) : null;

  const fmtPeriodo = (inicio: string, termino: string) => {
    const i = fmtDate(inicio);
    const t = fmtDate(termino);
    return i && t ? `${i} – ${t}` : '—';
  };

  // Matriz de fechas del ciclo TLD
  const estados = [
    {
      icon: <Send size={14} />,
      label: 'Envío',
      fecha: asignacion.fecha_envio,
    },
    {
      icon: <ArrowDownToLine size={14} />,
      label: 'Recepción',
      fecha: asignacion.fecha_recepcion,
    },
    {
      icon: <Link2 size={14} />,
      label: 'Vinculación TLD',
      fecha: asignacion.fecha_vinculacion_tld,
    },
    {
      icon: <Unlink size={14} />,
      label: 'Desvinculación TLD',
      fecha: asignacion.fecha_desvinculacion_tld,
    },
    {
      icon: <ArrowUpFromLine size={14} />,
      label: 'Devolución',
      fecha: asignacion.fecha_devolucion,
    },
    {
      icon: <PackageCheck size={14} />,
      label: 'Recepción devolución',
      fecha: asignacion.fecha_recepcion_devolucion,
    },
  ];

  return (
    <div className="rounded-xl border border-border bg-background p-4">
      {/* Cabecera */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-border">
        <div className="flex items-center gap-3 min-w-0">
          {tarjeta?.color && (
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: tarjeta.color }}
              title={tarjeta.codigo}
            />
          )}
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {tarjeta?.codigo ?? `Asignación #${asignacion.id}`}
            </p>
            {tarjeta?.cristal?.codigo && (
              <p className="text-xs text-foreground-secondary truncate">
                Cristal: {tarjeta.cristal.codigo}
              </p>
            )}
          </div>
        </div>
        <span className="flex items-center gap-1.5 text-xs font-medium whitespace-nowrap text-foreground">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: estadoColor }}
          />
          {estadoLabel}
        </span>
      </div>

      {/* 3 columnas: período / ciclo parte 1 / ciclo parte 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
        {/* Columna 1: período */}
        <div className="flex flex-col gap-2">
          {trimestre && (
            <div>
              <p className="text-xs text-foreground-secondary uppercase tracking-wide mb-0.5">
                Período
              </p>
              <div className="flex items-center gap-2">
                <Calendar size={14} style={{ color }} />
                <span className="text-sm text-foreground font-medium">
                  {fmtPeriodo(trimestre.inicio, trimestre.termino)}
                </span>
              </div>
              <p className="text-xs text-foreground-secondary mt-0.5">
                {trimestre.nombre_trimestre} {trimestre.anio}
              </p>
            </div>
          )}
        </div>

        {/* Columna 2: ciclo TLD - envío y recepción */}
        <div className="flex flex-col gap-2">
          <p className="text-xs text-foreground-secondary uppercase tracking-wide mb-0.5">
            Envío y recepción
          </p>
          {estados.slice(0, 3).map((e) => {
            const done = !!e.fecha;
            return (
              <div
                key={e.label}
                className="flex items-center gap-2 text-sm rounded-lg px-2.5 py-1.5 border border-border"
              >
                <span
                  className={`shrink-0 ${done ? 'text-success' : 'text-foreground-secondary'}`}
                >
                  {e.icon}
                </span>
                <span className="text-foreground-secondary font-medium min-w-[5rem]">
                  {e.label}:
                </span>
                <span
                  className={`ml-auto text-xs ${
                    done ? 'text-foreground' : 'text-foreground-secondary italic'
                  }`}
                >
                  {done ? fmtDate(e.fecha) : 'Pendiente'}
                </span>
              </div>
            );
          })}
        </div>

        {/* Columna 3: ciclo TLD - devolución y cierre */}
        <div className="flex flex-col gap-2">
          <p className="text-xs text-foreground-secondary uppercase tracking-wide mb-0.5">
            Devolución y cierre
          </p>
          {estados.slice(3).map((e) => {
            const done = !!e.fecha;
            return (
              <div
                key={e.label}
                className="flex items-center gap-2 text-sm rounded-lg px-2.5 py-1.5 border border-border"
              >
                <span
                  className={`shrink-0 ${done ? 'text-success' : 'text-foreground-secondary'}`}
                >
                  {e.icon}
                </span>
                <span className="text-foreground-secondary font-medium min-w-[5rem]">
                  {e.label}:
                </span>
                <span
                  className={`ml-auto text-xs ${
                    done ? 'text-foreground' : 'text-foreground-secondary italic'
                  }`}
                >
                  {done ? fmtDate(e.fecha) : 'Pendiente'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ---------- UI helpers ---------- */

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center rounded-xl border border-dashed border-border bg-background-secondary/50">
      <Inbox size={22} className="text-foreground-secondary mb-2" />
      <p className="text-sm text-foreground-secondary">{text}</p>
    </div>
  );
}
