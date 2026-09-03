import { useState, useEffect, useRef } from 'react';
import {
  Building2, Layers, ChevronDown, Search, Check, Inbox,
} from 'lucide-react';
import { type EntidadResumen } from '../services/entidades';
import { type AreaResumen } from '../../areas/services/areas';
import { formatChileanRut } from '../../../core/utils/format';
import Loading from '../../../core/components/Loading';
import Pagination from '../../../core/components/Pagination';
import SmartImage from '../../../core/components/SmartImage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

/* =================================================================== */
/* ====================  ENTIDAD AREA SELECTOR  ====================== */
/* =================================================================== */

export interface EntidadAreaSelectorProps {
  // Entidades
  entidades: EntidadResumen[];
  loadingEntidades: boolean;
  errorEntidades: string | null;
  selectedEntidadId: number | null;
  onSelectEntidad: (id: number) => void;
  selectedEntidad?: EntidadResumen;
  onSearchEntidades: (query: string) => void;
  // Áreas
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
  onSearchAreas: (query: string) => void;
}

export default function EntidadAreaSelector(props: EntidadAreaSelectorProps) {
  return (
    <aside className="flex flex-col gap-3 lg:sticky lg:top-6">
      <EntidadDropdown
        entidades={props.entidades}
        loading={props.loadingEntidades}
        error={props.errorEntidades}
        selectedId={props.selectedEntidadId}
        onSelect={props.onSelectEntidad}
        selectedEntidad={props.selectedEntidad}
        onSearch={props.onSearchEntidades}
      />

      <AreasAccordion
        areas={props.areas}
        loading={props.loadingAreas}
        error={props.errorAreas}
        selectedAreaId={props.selectedAreaId}
        onSelectArea={props.onSelectArea}
        selectedEntidad={props.selectedEntidad}
        loadingEntidades={props.loadingEntidades}
        pageAreas={props.pageAreas}
        limitAreas={props.limitAreas}
        totalAreas={props.totalAreas}
        totalPagesAreas={props.totalPagesAreas}
        onPageAreasChange={props.onPageAreasChange}
        onSearch={props.onSearchAreas}
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
  onSearch,
}: {
  entidades: EntidadResumen[];
  loading: boolean;
  error: string | null;
  selectedId: number | null;
  onSelect: (id: number) => void;
  selectedEntidad?: EntidadResumen;
  onSearch: (query: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = () => {
    onSearch(query);
  };

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

      {loading && <Loading text="Cargando entidades" size="sm" />}
      {error && <p className="text-danger text-sm text-center py-4">{error}</p>}

      {!loading && !error && (
        <>
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

            {open && (
              <div className="absolute z-20 top-full left-0 right-0 mt-1 rounded-xl border border-border bg-background shadow-lg overflow-hidden origin-top animate-[dropdown-in_0.05s_ease-out]">
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
                      onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
                      placeholder="Buscar entidad o RUT..."
                      autoFocus
                      className="w-full pl-8 pr-9 py-1.5 text-sm rounded-lg bg-background-secondary border border-border text-foreground placeholder:text-foreground-secondary focus:outline-none focus:ring-1 focus:ring-primary/40"
                    />
                    <button
                      onClick={handleSearch}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-foreground-secondary hover:text-foreground cursor-pointer"
                      title="Buscar"
                    >
                      <Search size={14} />
                    </button>
                  </div>
                </div>

                <div className="max-h-72 overflow-y-auto">
                  {entidades.length === 0 && (
                    <p className="text-sm text-foreground-secondary text-center py-6">
                      Sin resultados
                    </p>
                  )}
                  {entidades.map((entidad) => {
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
  loadingEntidades,
  pageAreas,
  limitAreas,
  totalAreas,
  totalPagesAreas,
  onPageAreasChange,
  onSearch,
}: {
  areas: AreaResumen[];
  loading: boolean;
  error: string | null;
  selectedAreaId: number | null;
  onSelectArea: (id: number) => void;
  selectedEntidad?: EntidadResumen;
  loadingEntidades?: boolean;
  pageAreas: number;
  limitAreas: number;
  totalAreas: number;
  totalPagesAreas: number;
  onPageAreasChange: (p: number) => void;
  onSearch: (query: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const accent = selectedEntidad?.color_primario;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = () => {
    onPageAreasChange(1);
    onSearch(query);
  };

  const selectedArea = areas.find((a) => a.id === selectedAreaId);

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
          <span className="text-xs text-foreground bg-foreground/5 rounded-full px-2 py-0.5">
            {totalAreas}
          </span>
        )}
      </div>

      {!selectedEntidad && !loading && !loadingEntidades && (
        <EmptyState text="Selecciona una entidad" />
      )}

      {selectedEntidad && loading && <Loading text="Cargando áreas" size="sm" />}

      {selectedEntidad && !loading && error && (
        <p className="text-danger text-sm text-center py-4">{error}</p>
      )}

      {selectedEntidad && !loading && !error && (
        <>
          {areas.length === 0 && <EmptyState text="Sin áreas asignadas" />}

          {areas.length > 0 && (
            <div className="relative" ref={ref}>
              <button
                onClick={() => setOpen((o) => !o)}
                className="w-full text-left rounded-xl border border-border bg-background-secondary p-3 cursor-pointer transition-all duration-150 hover:bg-foreground/3 flex items-center gap-3"
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={accent ? { backgroundColor: `${accent}1A` } : undefined}
                >
                  <Layers size={16} style={{ color: accent }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-foreground text-sm truncate">
                    {selectedArea?.nombre ?? 'Selecciona un área...'}
                  </p>
                  <p className="text-xs text-foreground-secondary">
                    {selectedArea?.codigo ?? ''}
                  </p>
                </div>
                <ChevronDown
                  size={16}
                  className={`text-foreground-secondary shrink-0 transition-transform duration-150 ${
                    open ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {open && (
                <div className="absolute z-20 top-full left-0 right-0 mt-1 rounded-xl border border-border bg-background shadow-lg overflow-hidden origin-top animate-[dropdown-in_0.05s_ease-out]">
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
                        onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
                        placeholder="Buscar área o código..."
                        autoFocus
                        className="w-full pl-8 pr-9 py-1.5 text-sm rounded-lg bg-background-secondary border border-border text-foreground placeholder:text-foreground-secondary focus:outline-none focus:ring-1 focus:ring-primary/40"
                      />
                      <button
                        onClick={handleSearch}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-foreground-secondary hover:text-foreground cursor-pointer"
                        title="Buscar"
                      >
                        <Search size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="max-h-72 overflow-y-auto">
                    {areas.length === 0 && (
                      <p className="text-sm text-foreground-secondary text-center py-6">
                        Sin resultados
                      </p>
                    )}
                    {areas.map((area) => {
                      const isSelected = area.id === selectedAreaId;
                      return (
                        <button
                          key={area.id}
                          onClick={() => {
                            onSelectArea(area.id);
                            setOpen(false);
                            setQuery('');
                          }}
                          className={`w-full text-left px-3 py-2.5 cursor-pointer flex items-center gap-3 transition-colors ${
                            isSelected ? 'bg-foreground/5' : 'hover:bg-foreground/3'
                          }`}
                        >
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                            style={accent ? { backgroundColor: `${accent}1A` } : undefined}
                          >
                            <Layers size={14} style={{ color: accent }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-foreground text-sm truncate">
                              {area.nombre}
                            </p>
                            <p className="text-xs text-foreground-secondary">
                              {area.codigo}
                            </p>
                          </div>
                          {isSelected && (
                            <Check size={14} className="text-primary shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {totalAreas > limitAreas && (
                    <div className="border-t border-border p-2">
                      <Pagination
                        page={pageAreas}
                        limit={limitAreas}
                        total={totalAreas}
                        totalPages={totalPagesAreas}
                        onPageChange={onPageAreasChange}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </>
      )}
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
