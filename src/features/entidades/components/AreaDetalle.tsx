import { useState, useEffect, useRef } from 'react';
import {
  Briefcase,
  Inbox, CreditCard, Calendar, Send, ArrowDownToLine, ArrowUpFromLine,
  CircleDot, Check, ChevronDown, ChevronRight,
  AlertTriangle, Link2, Unlink, PackageCheck,
} from 'lucide-react';
import { getAniosByAreaPe, type PeriodoAnios, type AreaResumen, type AreaPe } from '../../areas/services/areas';
import { type Asignacion, type DosisAnual, type DosisPeriodo } from '../../asignaciones/services/asignaciones';
import { formatDateTime, getReadableTextColor } from '../../../core/utils/format';
import { getRolById } from '../../../core/config/rol';
import { getEstadoAsignacionTLD } from '../../../core/config/estados';
import Loading from '../../../core/components/Loading';
import { type EntidadResumen } from '../services/entidades';


/* =================================================================== */
/* =======================  AREA DETALLE  ============================ */
/* =================================================================== */

export interface AreaDetalleProps {
  selectedEntidad?: EntidadResumen;
  selectedArea?: AreaResumen;
  loadingAreas?: boolean;
  loadingEntidades?: boolean;
  areaPe: AreaPe | null;
  loadingPe: boolean;
  errorPe: string | null;
  asignaciones: Asignacion[];
  dosisAnuales?: DosisAnual[];
  dosisPeriodo?: DosisPeriodo | null;
  loadingAsignaciones: boolean;
  errorAsignaciones: string | null;
  selectedAsignacionId: number | null;
  onSelectAsignacion: (id: number) => void;
  selectedAnio: number | null;
  onSelectAnio: (anio: number | null) => void;
}

export default function AreaDetalle(props: AreaDetalleProps) {
  const { selectedArea, loadingAreas, loadingEntidades, areaPe } = props;

  if (loadingAreas) {
    return <Loading text="Cargando detalle" />;
  }

  if (!selectedArea) {
    if (loadingEntidades) {
      return <section className="min-h-[60vh]" />;
    }
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
    <section className="grid grid-cols-1 lg:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] gap-4 items-start">
      <AnioSelector
        areaPe={areaPe}
        asignaciones={props.asignaciones}
        dosisAnuales={props.dosisAnuales}
        dosisPeriodo={props.dosisPeriodo}
        loadingAsignaciones={props.loadingAsignaciones}
        errorAsignaciones={props.errorAsignaciones}
        selectedAsignacionId={props.selectedAsignacionId}
        onSelectAsignacion={props.onSelectAsignacion}
        selectedAnio={props.selectedAnio}
        onSelectAnio={props.onSelectAnio}
      />

      <AsignacionesSection
        asignaciones={props.asignaciones}
        dosisAnuales={props.dosisAnuales}
        dosisPeriodo={props.dosisPeriodo}
        loading={props.loadingAsignaciones}
        error={props.errorAsignaciones}
        hasAreaPe={!!areaPe}
        selectedAsignacionId={props.selectedAsignacionId}
      />
    </section>
  );
}

/* ---------- Selector de año ---------- */

function AnioSelector({
  areaPe,
  asignaciones,
  dosisAnuales,
  dosisPeriodo,
  loadingAsignaciones,
  errorAsignaciones,
  selectedAsignacionId,
  onSelectAsignacion,
  selectedAnio,
  onSelectAnio,
}: {
  areaPe: AreaPe | null;
  asignaciones: Asignacion[];
  dosisAnuales?: DosisAnual[];
  dosisPeriodo?: DosisPeriodo | null;
  loadingAsignaciones: boolean;
  errorAsignaciones: string | null;
  selectedAsignacionId: number | null;
  onSelectAsignacion: (id: number) => void;
  selectedAnio: number | null;
  onSelectAnio: (anio: number | null) => void;
}) {
  const [periodos, setPeriodos] = useState<PeriodoAnios[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [periodoAbierto, setPeriodoAbierto] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  const toggleOpen = () => {
    if (!open && periodoAbierto === null) {
      const actual = periodos.find((p) => selectedAnio !== null && p.anios.includes(selectedAnio));
      setPeriodoAbierto(actual?.id ?? periodos[0]?.id ?? null);
    }
    setOpen(!open);
  };

  useEffect(() => {
    if (!areaPe?.id) {
      setPeriodos([]);
      return;
    }
    setLoading(true);
    setError(null);
    getAniosByAreaPe(areaPe.id)
      .then((data) => {
        setPeriodos(data);
        const todosAnios = data.flatMap((p) => p.anios);
        if (todosAnios.length > 0 && selectedAnio === null) {
          const anioActual = new Date().getFullYear();
          onSelectAnio(todosAnios.includes(anioActual) ? anioActual : Math.max(...todosAnios));
        }
      })
      .catch((err: any) => setError(err.message || 'Error al cargar años'))
      .finally(() => setLoading(false));
  }, [areaPe?.id]);

  if (!areaPe) return null;

  return (
    <div className="rounded-xl border border-border bg-background-secondary p-4 flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm text-foreground-secondary">
          Escoge el año para mostrar sus trimestres
        </span>
        <div className="relative w-full sm:w-auto" ref={dropdownRef}>
          <button
            type="button"
            onClick={toggleOpen}
            disabled={loading || !!error || periodos.length === 0}
            className="w-full sm:w-auto flex items-center justify-between gap-2 px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-focus-ring focus:border-transparent cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>{loading ? 'Cargando...' : error ? 'Error' : selectedAnio ?? 'Sin años'}</span>
            <ChevronDown size={14} className={`text-foreground-secondary transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
          </button>

          {open && (
            <div className="absolute left-0 right-0 sm:right-auto mt-1 w-full sm:w-56 bg-background border border-border rounded-xl shadow-lg z-50 animate-dropdown-in overflow-hidden">
              <div className="max-h-72 overflow-y-auto">
                {periodos.map((p) => {
                  const abierto = periodoAbierto === p.id;
                  const contieneSeleccion = selectedAnio !== null && p.anios.includes(selectedAnio);
                  return (
                    <div key={p.id} className="border-b border-border/50 last:border-b-0">
                      <button
                        type="button"
                        onClick={() => setPeriodoAbierto(abierto ? null : p.id)}
                        className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-foreground-secondary hover:bg-background-secondary transition-colors cursor-pointer"
                      >
                        <span>Período {p.anio_inicio} - {p.anio_fin}</span>
                        {abierto ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                      </button>
                      {(abierto || contieneSeleccion) && (
                        <div>
                          {p.anios.map((anio) => (
                            <button
                              key={anio}
                              type="button"
                              onClick={() => { onSelectAnio(anio); setOpen(false); }}
                              className={`w-full flex items-center justify-between px-3 py-2 pl-6 text-sm transition-colors cursor-pointer ${
                                anio === selectedAnio
                                  ? 'bg-primary/10 text-foreground font-medium'
                                  : 'text-foreground hover:bg-background-secondary'
                              }`}
                            >
                              <span>{anio}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {dosisAnuales && dosisAnuales.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-foreground-secondary">
          <span><strong className="text-foreground">{Number(dosisAnuales[0].dosis_total.toFixed(2)).toLocaleString('es-CL')} mSv</strong> / {dosisPeriodo?.configuracion_umbral?.umbral_anual ?? UMBRAL_ANUAL} mSv (umbral anual)</span>
        </div>
      )}

      {loadingAsignaciones && <Loading text="Cargando asignaciones" />}
      {!loadingAsignaciones && errorAsignaciones && (
        <p className="text-danger text-sm text-center py-6">{errorAsignaciones}</p>
      )}
      {!loadingAsignaciones && !errorAsignaciones && asignaciones.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Inbox size={24} className="text-foreground-secondary mb-2" />
          <p className="text-sm text-foreground-secondary">No han iniciado tus trimestres</p>
        </div>
      )}
      {!loadingAsignaciones && !errorAsignaciones && asignaciones.length > 0 && (
        <AsignacionesStepper
          asignaciones={asignaciones}
          selectedId={selectedAsignacionId}
          onSelect={onSelectAsignacion}
        />
      )}
    </div>
  );
}

/* ---------- Personal como Metric Cards ---------- */

export function PersonalMetricCards({
  areaPe,
  loadingPe,
  errorPe,
}: {
  areaPe: AreaPe | null;
  loadingPe: boolean;
  errorPe: string | null;
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
    { icon: <Briefcase size={14} />, label: 'Cargo', value: areaPe.cargo },
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
      <div className="rounded-xl border border-border bg-background-secondary p-4 flex flex-col gap-3">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-border">
          {cards.map((c) => (
            <div key={c.label} className="flex flex-col gap-2 lg:px-4 py-2 lg:py-0 first:lg:pl-0 last:lg:pr-0">
              <div className="flex items-center gap-1.5 text-foreground-secondary">
                {c.icon}
                <span className="text-xs uppercase tracking-wide">{c.label}</span>
              </div>
              <div className="flex items-center gap-2">
                {c.tone && (
                  <span
                    className={`w-2 h-2 rounded-full ${
                      c.tone === 'success' ? 'bg-success' : 'bg-danger'
                    }`}
                  />
                )}
                <span className="text-sm text-foreground">
                  {c.value}
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

/* =================================================================== */
/* ===================  ASIGNACION TLD  ============================== */
/* =================================================================== */

function AsignacionesSection({
  asignaciones,
  dosisAnuales,
  dosisPeriodo,
  loading,
  error,
  hasAreaPe,
  selectedAsignacionId,
}: {
  asignaciones: Asignacion[];
  dosisAnuales?: DosisAnual[];
  dosisPeriodo?: DosisPeriodo | null;
  loading: boolean;
  error: string | null;
  hasAreaPe: boolean;
  selectedAsignacionId: number | null;
}) {
  if (!hasAreaPe) return null;

  const selected = asignaciones.find((a) => a.id === selectedAsignacionId) ?? asignaciones.find((a) => a.es_actual) ?? asignaciones[0] ?? null;
  const dosisAnual = dosisAnuales?.find((d) => d.anio === selected?.trimestre?.anio) ?? dosisAnuales?.[0] ?? null;

  return (
    <div className="flex flex-col gap-4">
      {selected && (
        <DosisComparativaCard
          asignacion={selected}
          dosisAnual={dosisAnual}
          dosisPeriodo={dosisPeriodo ?? null}
        />
      )}

      <div className="rounded-2xl border border-border bg-background-secondary p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CreditCard size={14} className="text-foreground-secondary" />
            <h3 className="text-xs font-semibold text-foreground-secondary uppercase tracking-wide">
              Asignacion TLD
            </h3>
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

        {!loading && !error && selected && (
          <AsignacionDetail asignacion={selected} />
        )}
      </div>
    </div>
  );
}

/* ---------- Card de dosis (datos reales) ---------- */

const UMBRAL_TRIMESTRE = 5;
const UMBRAL_ANUAL = 20;
const UMBRAL_PERIODO = 50;

function DosisComparativaCard({
  asignacion,
  dosisAnual,
  dosisPeriodo,
}: {
  asignacion: Asignacion;
  dosisAnual: DosisAnual | null;
  dosisPeriodo: DosisPeriodo | null;
}) {
  const config = dosisPeriodo?.configuracion_umbral;
  const umbralTrim = config?.umbral_trimestre ?? UMBRAL_TRIMESTRE;
  const umbralAnual = config?.umbral_anual ?? UMBRAL_ANUAL;
  const umbralPeriodo = config?.umbral_periodo ?? UMBRAL_PERIODO;

  const dosisTrim = asignacion.dosis_trimestre?.dosis ?? null;
  const valorAnual = dosisAnual?.dosis_total ?? null;
  const valorPeriodo = dosisPeriodo?.dosis_total ?? null;
  const tieneLectura = asignacion.tiene_lectura === true;

  const nivel = (v: number | null, umbral: number) =>
    v === null ? 'normal'
    : v > umbral ? 'supera'
    : v >= umbral * 0.8 ? 'cerca'
    : 'normal';
  const nivelTrim = nivel(dosisTrim, umbralTrim);
  const nivelAnual = nivel(valorAnual, umbralAnual);
  const nivelPeriodo = nivel(valorPeriodo, umbralPeriodo);
  const hayAlerta = nivelTrim === 'supera' || nivelAnual === 'supera' || nivelPeriodo === 'supera';

  return (
    <div className={`rounded-2xl border bg-background-secondary p-5 ${hayAlerta ? 'border-danger/40' : 'border-border'}`}>
      {hayAlerta && (
        <div className="inline-flex items-center gap-2 mb-3 px-3 py-2 rounded-lg bg-danger/15 border border-danger/40 text-red-800 dark:text-red-300 text-sm w-fit">
          <AlertTriangle size={14} />
          Lectura por encima del umbral permitido
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg font-bold tracking-tight text-foreground">
              Lectura TLD — {asignacion.trimestre?.nombre_trimestre ?? 'Trimestre'}
            </h2>
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-foreground/5 text-foreground-secondary border border-border">
              {asignacion.trimestre?.anio}
            </span>
          </div>
          <p className="text-xs text-foreground-secondary mt-0.5">
            Dosis acumulada del trabajador
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 border-t border-border pt-3 md:border-t-0 md:pt-0 md:flex md:items-center md:gap-4">
          <DosisBloque
            label={`Trimestre ${asignacion.trimestre?.anio ?? ''}`}
            valor={tieneLectura ? dosisTrim : null}
            umbral={umbralTrim}
            nivel={tieneLectura ? nivelTrim : 'normal'}
            badge="Actual"
            sinLectura={!tieneLectura}
          />
          <DosisBloque
            label="Dosis anual"
            valor={valorAnual}
            umbral={umbralAnual}
            nivel={nivelAnual}
          />
          <DosisBloque
            label="Dosis período"
            valor={valorPeriodo}
            umbral={umbralPeriodo}
            nivel={nivelPeriodo}
          />
        </div>
      </div>
    </div>
  );
}

function DosisBloque({
  label,
  valor,
  umbral,
  nivel,
  badge,
  sinLectura,
}: {
  label: string;
  valor: number | null;
  umbral: number;
  nivel: 'normal' | 'cerca' | 'supera';
  badge?: string;
  sinLectura?: boolean;
}) {
  const colorTexto = nivel === 'supera' ? 'text-danger' : nivel === 'cerca' ? 'text-warning' : 'text-foreground';
  const borderClase = nivel === 'supera'
    ? 'border-danger/50 animate-[subtle-pulse-danger_1.8s_ease-in-out_infinite]'
    : nivel === 'cerca'
      ? 'border-warning/50 animate-[subtle-pulse-warning_1.8s_ease-in-out_infinite]'
      : 'border-foreground/30 animate-[subtle-pulse_1.8s_ease-in-out_infinite]';

  return (
    <div className={`bg-background/70 border-2 rounded-xl px-3.5 py-2 text-center flex flex-col justify-center ${borderClase}`}>
      <div className="flex items-center justify-center gap-1.5 flex-wrap">
        <p className="text-xs font-semibold uppercase tracking-wider text-foreground">
          {label}
        </p>
        {badge && (
          <span className="text-xs font-bold uppercase tracking-wider text-foreground/60 bg-foreground/10 px-1.5 py-0.5 rounded">
            {badge}
          </span>
        )}
      </div>
      {sinLectura ? (
        <p className="text-sm font-bold mt-0.5 text-foreground-secondary italic">Sin lectura</p>
      ) : (
        <p className={`text-sm font-bold mt-0.5 ${colorTexto}`}>
          {valor !== null ? Number(valor.toFixed(2)).toLocaleString('es-CL') : '—'}{' '}
          <span className={`text-sm font-medium ${colorTexto}`}>mSv</span>
          <span className="text-sm font-medium text-foreground-secondary"> / {umbral} mSv <span className="text-xs">(umbral)</span></span>
        </p>
      )}
    </div>
  );
}

/* ---------- Stepper vertical continuo ---------- */

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
    <>
      {/* Mobile: timeline horizontal centrado */}
      <div className="lg:hidden overflow-x-auto overflow-y-visible py-4">
        <div className="flex items-start justify-center min-w-max px-2">
          {sorted.map((asignacion, idx) => {
            const trimestre = asignacion.trimestre;
            const isSelected = asignacion.id === selectedId;
            const esActual = asignacion.es_actual === true;
            const color = trimestre?.color ?? 'var(--color-foreground-secondary)';

            let stepStatus: 'completado' | 'actual' | 'pendiente' = 'pendiente';
            if (asignacion.estado >= 7) {
              stepStatus = 'completado';
            } else if (asignacion.estado > 0 || esActual) {
              stepStatus = 'actual';
            } else {
              stepStatus = 'pendiente';
            }

            const isLast = idx === sorted.length - 1;
            const iconColor = color.startsWith('#')
              ? getReadableTextColor(color)
              : 'var(--color-background)';

            return (
              <div key={asignacion.id} className="flex items-start shrink-0">
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
                      <Check size={10} style={{ color: iconColor }} strokeWidth={3} />
                    )}
                    {stepStatus === 'actual' && (
                      <CircleDot size={12} className="absolute" style={{ color: iconColor }} strokeWidth={3} />
                    )}
                  </span>
                  <span
                    className="text-xs whitespace-nowrap transition-colors"
                    style={isSelected ? { color } : { color: 'var(--color-foreground)' }}
                  >
                    {trimestre
                      ? `${trimestre.nombre_trimestre.replace(' Trimestre', 'T')} ${trimestre.anio}`
                      : `#${asignacion.id}`}
                  </span>
                  <span className="flex items-center gap-1 text-xs whitespace-nowrap text-foreground">
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: getEstadoAsignacionTLD(asignacion.estado).color }}
                    />
                    {getEstadoAsignacionTLD(asignacion.estado).label}
                  </span>
                  {esActual && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full whitespace-nowrap" style={{ color, backgroundColor: `${color}1a` }}>
                      Actual
                    </span>
                  )}
                </button>

                {!isLast && (
                  <div className="flex-1 h-px mt-2 mx-2 min-w-8" style={{ backgroundColor: 'var(--color-border)' }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Desktop: timeline vertical */}
      <div className="hidden lg:block relative py-2 pl-7">
        {/* Línea vertical continua de fondo */}
        <div
          className="absolute left-2 top-6 bottom-6 w-px z-0"
          style={{ backgroundColor: 'var(--color-border)' }}
          aria-hidden
        />

        <div className="flex flex-col gap-4 relative z-10">
          {sorted.map((asignacion) => {
            const trimestre = asignacion.trimestre;
            const isSelected = asignacion.id === selectedId;
            const esActual = asignacion.es_actual === true;
            const color = trimestre?.color ?? 'var(--color-foreground-secondary)';

            let stepStatus: 'completado' | 'actual' | 'pendiente' = 'pendiente';
            if (asignacion.estado >= 7) {
              stepStatus = 'completado';
            } else if (asignacion.estado > 0 || esActual) {
              stepStatus = 'actual';
            } else {
              stepStatus = 'pendiente';
            }

            const iconColor = color.startsWith('#')
              ? getReadableTextColor(color)
              : 'var(--color-background)';

            return (
              <button
                key={asignacion.id}
                onClick={() => onSelect(asignacion.id)}
                className="group flex items-start gap-3 w-full text-left cursor-pointer py-1 -ml-7"
                title={
                  trimestre
                    ? `${trimestre.nombre_trimestre} ${trimestre.anio} · ${getEstadoAsignacionTLD(asignacion.estado).label}`
                    : `Asignación #${asignacion.id}`
                }
              >
                <span
                  className={`relative w-4 h-4 mt-0.5 rounded-full ring-4 ring-background-secondary transition-transform duration-150 flex items-center justify-center shrink-0 ${
                    isSelected ? 'scale-110 timeline-node-active' : 'group-hover:scale-110'
                  }`}
                  style={{ backgroundColor: color }}
                >
                  {stepStatus === 'completado' && (
                    <Check size={10} style={{ color: iconColor }} strokeWidth={3} />
                  )}
                  {stepStatus === 'actual' && (
                    <CircleDot
                      size={12}
                      className="absolute"
                      style={{ color: iconColor }}
                      strokeWidth={3}
                    />
                  )}
                </span>

                <div className="flex flex-col items-start min-w-0">
                  <span
                    className="text-sm transition-colors truncate"
                    style={isSelected ? { color } : { color: 'var(--color-foreground)' }}
                  >
                    {trimestre
                      ? `${trimestre.nombre_trimestre.replace(' Trimestre', 'T')} ${trimestre.anio}`
                      : `#${asignacion.id}`}
                  </span>
                  <span className="flex items-center gap-1 text-xs whitespace-nowrap text-foreground">
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: getEstadoAsignacionTLD(asignacion.estado).color }}
                    />
                    {getEstadoAsignacionTLD(asignacion.estado).label}
                  </span>
                  {esActual && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full whitespace-nowrap" style={{ color, backgroundColor: `${color}1a` }}>
                      Actual
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </>
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
            <p className="text-sm text-foreground truncate">
              {tarjeta?.codigo ?? 'Sin tarjeta asignada'}
            </p>
            {tarjeta?.cristal?.codigo && (
              <p className="text-xs text-foreground-secondary truncate">
                Cristal: {tarjeta.cristal.codigo}
              </p>
            )}
          </div>
        </div>
        <span className="flex items-center gap-1.5 text-xs whitespace-nowrap text-foreground">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: estadoColor }}
          />
          {estadoLabel}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
        <div className="flex flex-col gap-2">
          {trimestre && (
            <div>
              <p className="text-xs text-foreground-secondary uppercase tracking-wide mb-0.5">
                Período
              </p>
              <div className="flex items-center gap-2">
                <Calendar size={14} style={{ color }} />
                <span className="text-sm text-foreground">
                  {fmtPeriodo(trimestre.inicio, trimestre.termino)}
                </span>
              </div>
              <p className="text-xs text-foreground-secondary mt-0.5">
                {trimestre.nombre_trimestre} {trimestre.anio}
              </p>
            </div>
          )}
        </div>

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
                <span className="text-foreground-secondary font-medium min-w-20">
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
                <span className="text-foreground-secondary font-medium min-w-20">
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
