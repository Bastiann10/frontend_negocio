import { useState, useEffect } from 'react';
import { AlertTriangle, Activity, ChevronDown } from 'lucide-react';
import { getDosis, type DosisPeriodo, type DosisAnualPe } from '../services/dosis';
import { formatDosis } from '../../../core/utils/format';
import { usePrecision } from '../../../core/providers/PrecisionProvider';
import Loading from '../../../core/components/Loading';

const nivel = (v: number, umbral: number): 'normal' | 'cerca' | 'supera' =>
  v > umbral ? 'supera' : v >= umbral * 0.8 ? 'cerca' : 'normal';

const colorNivel = (n: 'normal' | 'cerca' | 'supera') =>
  n === 'supera' ? 'text-danger' : n === 'cerca' ? 'text-warning' : 'text-foreground';

const fmtFecha = (d: string) =>
  new Date(d).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' });



export default function DosisPeriodos() {
  const [periodos, setPeriodos] = useState<DosisPeriodo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(true);
  const [periodoAbierto, setPeriodoAbierto] = useState<number | null>(null);
  const [anioAbierto, setAnioAbierto] = useState<number | null>(null);

  useEffect(() => {
    getDosis()
      .then((data) => {
        setPeriodos(data);
        if (data.length > 0) {
          setPeriodoAbierto(data[0].id);
          if (data[0].dosis_anual_pe.length > 0) {
            setAnioAbierto(data[0].dosis_anual_pe[0].id);
          }
        }
      })
      .catch((err: any) => setError(err.message || 'Error al cargar dosis'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="rounded-2xl border border-border bg-background-secondary overflow-hidden">
      {/* Header general */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-3 px-5 py-4 cursor-pointer hover:bg-foreground/2 transition-colors text-left"
      >
        <div>
          <h3 className="text-sm font-semibold text-foreground-secondary uppercase tracking-wide">
            Resumen de dosis acumulada de la persona
          </h3>
          <p className="text-xs text-foreground-secondary mt-0.5">
            Suma de todas las áreas de cualquier entidad en donde trabaja
          </p>
        </div>
        <ChevronDown
          size={18}
          className={`text-foreground-secondary shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="border-t border-border p-4 flex flex-col gap-3">
          {loading && <Loading text="Cargando dosis" />}

          {!loading && error && (
            <div className="rounded-xl border border-danger/30 bg-danger/5 p-4 flex items-center gap-2 text-sm text-danger">
              <AlertTriangle size={16} />
              {error}
            </div>
          )}

          {!loading && !error && periodos.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Activity size={24} className="text-foreground-secondary mb-2" />
              <p className="text-sm text-foreground-secondary">No hay registros de dosis</p>
            </div>
          )}

          {!loading && !error && periodos.length > 0 && (
            <>
              <p className="text-xs font-semibold text-foreground-secondary uppercase tracking-wide px-1">
                Períodos dosimétricos
              </p>
              {periodos.map((periodo) => (
                <PeriodoItem
                  key={periodo.id}
                  periodo={periodo}
                  abierto={periodoAbierto === periodo.id}
                  onToggle={() => setPeriodoAbierto(periodoAbierto === periodo.id ? null : periodo.id)}
                  anioAbierto={anioAbierto}
                  onToggleAnio={(id) => setAnioAbierto(anioAbierto === id ? null : id)}
                />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------- Período ---------- */

function PeriodoItem({
  periodo,
  abierto,
  onToggle,
  anioAbierto,
  onToggleAnio,
}: {
  periodo: DosisPeriodo;
  abierto: boolean;
  onToggle: () => void;
  anioAbierto: number | null;
  onToggleAnio: (id: number) => void;
}) {
  const { aproximar } = usePrecision();
  const config = periodo.configuracion_umbral;
  const enCurso = periodo.estado_periodo === 0;
  const nivPeriodo = nivel(periodo.dosis_total, config.umbral_periodo);

  return (
    <div className="rounded-xl border border-border bg-background overflow-hidden">
      {/* Fila período */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 cursor-pointer hover:bg-foreground/2 transition-colors text-left"
      >
        <div className="flex items-center gap-2 min-w-0 flex-wrap">
          <span className="text-sm text-foreground">
            {fmtFecha(periodo.fecha_inicio)} → {fmtFecha(periodo.fecha_fin)}
          </span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
              enCurso
                ? 'bg-info/10 text-info border-info/30'
                : 'bg-success/10 text-success border-success/30'
            }`}
          >
            {enCurso ? 'En curso' : 'Finalizado'}
          </span>
        </div>
        <span className={`text-sm font-bold shrink-0 ${colorNivel(nivPeriodo)}`}>
          {formatDosis(periodo.dosis_total, aproximar)} / {config.umbral_periodo} mSv
        </span>
      </button>

      {/* Años */}
      {abierto && (
        <div className="border-t border-border">
          {periodo.dosis_anual_pe.map((anual) => (
            <AnioItem
              key={anual.id}
              anual={anual}
              umbralAnual={config.umbral_anual}
              umbralTrimestre={config.umbral_trimestre}
              abierto={anioAbierto === anual.id}
              onToggle={() => onToggleAnio(anual.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Año ---------- */

function AnioItem({
  anual,
  umbralAnual,
  umbralTrimestre,
  abierto,
  onToggle,
}: {
  anual: DosisAnualPe;
  umbralAnual: number;
  umbralTrimestre: number;
  abierto: boolean;
  onToggle: () => void;
}) {
  const { aproximar } = usePrecision();
  const nivAnual = nivel(anual.dosis_acumulada, umbralAnual);

  return (
    <div className="border-b border-border/50 last:border-b-0">
      {/* Fila año */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 pl-6 cursor-pointer hover:bg-foreground/2 transition-colors text-left"
      >
        <div className="flex items-center gap-2 min-w-0">
          <ChevronDown
            size={14}
            className={`text-foreground-secondary shrink-0 transition-transform ${abierto ? '' : '-rotate-90'}`}
          />
          <span className="text-sm font-semibold text-foreground">Año {anual.anio}</span>
        </div>
        <div className="flex items-center gap-3 shrink-0 text-sm">
          <span className="text-foreground-secondary">Total anual</span>
          <span className={`font-bold ${colorNivel(nivAnual)}`}>
            {formatDosis(anual.dosis_acumulada, aproximar)} / {umbralAnual} mSv
          </span>
        </div>
      </button>

      {/* Trimestres */}
      {abierto && (
        <div>
          {anual.dosis_trimestre_pe.map((trim) => {
            const nivTrim = nivel(trim.dosis_acumulada, umbralTrimestre);
            const nombre = trim.trimestre?.nombre_trimestre ?? `Trimestre ${trim.trimestre?.numero ?? ''}`;

            return (
              <div
                key={trim.id}
                className="flex items-center justify-between gap-3 px-4 py-2.5 pl-10 border-t border-border/50"
              >
                <span className="text-sm text-foreground-secondary">
                  {nombre} {trim.trimestre?.anio ?? ''}
                </span>
                <span className={`text-sm font-medium ${colorNivel(nivTrim)}`}>
                  {formatDosis(trim.dosis_acumulada, aproximar)} / {umbralTrimestre} mSv
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
