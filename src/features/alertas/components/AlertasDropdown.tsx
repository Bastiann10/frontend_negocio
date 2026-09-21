import { useEffect, useRef, useState } from "react";
import { Bell, TriangleAlert } from "lucide-react";
import { getAlertasDosis, marcarAlertaLeida, type AlertaEntidad, type AlertaDosisPeriodo } from "../services/alertas.ts";

interface AlertaItem {
  id: number;
  nivel: 'trimestre' | 'anual' | 'periodo';
  tipo: string;
  detalle: string;
  dosis?: number;
  umbral?: number;
  estadoNoti: number;
}

interface PeriodoGrupo {
  id: number;
  rango: string;
  periodoAlerta: AlertaItem | null;
  items: AlertaItem[];
}

interface EntidadGrupo {
  entidad: string;
  periodos: PeriodoGrupo[];
  otros: AlertaItem[];
}

function formatDosis(dosis?: number) {
  return dosis != null ? Number(dosis.toFixed(2)).toLocaleString('es-CL') : '—';
}

function groupAlertas(alertas: AlertaEntidad[]): EntidadGrupo[] {
  const grupos: EntidadGrupo[] = [];

  for (const a of alertas) {
    const mkItem = (
      n: { id: number; dosis?: number; umbral?: number; estado_noti: number },
      nivel: AlertaItem['nivel'],
      tipo: string,
      detalle: string,
    ): AlertaItem => ({
      id: n.id, nivel, tipo, detalle,
      dosis: n.dosis, umbral: n.umbral, estadoNoti: n.estado_noti,
    });

    const otros: AlertaItem[] = [];
    for (const t of a.dosis_trimestre ?? []) {
      if (t.estado === 1) otros.push(mkItem(t, 'trimestre', t.trimestre, `${t.anio}`));
    }
    for (const an of a.dosis_anual ?? []) {
      if (an.estado === 1) otros.push(mkItem(an, 'anual', 'Dosis anual', `${an.anio}`));
      for (const t of an.dosis_trimestre ?? []) {
        if (t.estado === 1) otros.push(mkItem(t, 'trimestre', t.trimestre, `${t.anio}`));
      }
    }

    const periodosRaw: AlertaDosisPeriodo[] = Array.isArray(a.dosis_periodo)
      ? a.dosis_periodo
      : a.dosis_periodo ? [a.dosis_periodo] : [];

    const periodos: PeriodoGrupo[] = periodosRaw.map((p) => {
      const items: AlertaItem[] = [];
      for (const an of p.dosis_anual ?? []) {
        if (an.estado === 1) items.push(mkItem(an, 'anual', 'Dosis anual', `${an.anio}`));
        for (const t of an.dosis_trimestre ?? []) {
          if (t.estado === 1) items.push(mkItem(t, 'trimestre', t.trimestre, `${t.anio}`));
        }
      }
      const rango = p.fecha_inicio && p.fecha_fin
        ? `${new Date(p.fecha_inicio).getFullYear()} - ${new Date(p.fecha_fin).getFullYear()}`
        : '';
      return {
        id: p.id,
        rango,
        periodoAlerta: p.estado === 1 ? mkItem(p, 'periodo', 'Dosis período', rango) : null,
        items,
      };
    }).filter((g) => g.periodoAlerta !== null || g.items.length > 0);

    if (periodos.length > 0 || otros.length > 0) {
      grupos.push({ entidad: a.entidad, periodos, otros });
    }
  }

  return grupos;
}

export default function AlertasDropdown() {
  const [open, setOpen] = useState(false);
  const [grupos, setGrupos] = useState<EntidadGrupo[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  const cargarAlertas = () => {
    getAlertasDosis()
      .then((data) => setGrupos(groupAlertas(Array.isArray(data) ? data : [])))
      .catch(() => setGrupos([]));
  };

  useEffect(() => {
    cargarAlertas();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  const handleMarcarLeida = (item: AlertaItem) => {
    if (item.estadoNoti === 2) return;
    marcarAlertaLeida(item.nivel, item.id)
      .then(() => cargarAlertas())
      .catch(() => {});
  };

  const todosItems = grupos.flatMap((g) => [
    ...g.otros,
    ...g.periodos.flatMap((p) => [...(p.periodoAlerta ? [p.periodoAlerta] : []), ...p.items]),
  ]);
  const noLeidas = todosItems.filter((a) => a.estadoNoti !== 2).length;
  const total = todosItems.length;

  const renderItem = (a: AlertaItem, indent = false) => {
    const leida = a.estadoNoti === 2;
    return (
      <div
        key={`${a.nivel}-${a.id}`}
        className={`flex items-start gap-2.5 px-3 py-2.5 border-b border-border/50 last:border-b-0 ${indent ? 'pl-6' : ''} ${leida ? 'opacity-50' : ''}`}
      >
        <span className="mt-0.5 p-1.5 rounded-lg bg-danger/15 text-danger shrink-0">
          <TriangleAlert size={14} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground truncate">{a.tipo}</p>
          <p className="text-xs text-foreground-secondary">
            {a.detalle}
            {a.estadoNoti === 1 && <span className="text-foreground-secondary/60"> · notificado</span>}
            {leida && <span className="text-foreground-secondary/60"> · leído</span>}
          </p>
        </div>
        {a.dosis != null && (
          <span className="text-sm font-semibold text-danger shrink-0">
            {formatDosis(a.dosis)} mSv
            {a.umbral != null && <span className="font-normal text-foreground-secondary"> / {formatDosis(a.umbral)}</span>}
          </span>
        )}
        {a.estadoNoti === 1 && (
          <button
            type="button"
            onClick={() => handleMarcarLeida(a)}
            className="mt-0.5 px-2 py-1 rounded-lg text-xs font-medium shrink-0 transition-colors border border-border text-foreground-secondary cursor-pointer hover:bg-background-secondary hover:text-foreground"
          >
            Marcar leída
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-lg shrink-0 cursor-pointer transition-colors duration-100 ease-out text-background dark:text-foreground hover:bg-sidebar-hover"
        title="Alertas de dosis"
      >
        <Bell size={20} />
        {noLeidas > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-0.5 rounded-full bg-danger text-white text-[10px] font-bold leading-4 text-center">
            {noLeidas}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-96 max-w-[90vw] bg-background border border-border rounded-xl shadow-lg z-50 animate-dropdown-in overflow-hidden">
          <div className="px-3 py-2 border-b border-border">
            <span className="text-sm font-semibold text-foreground">Alertas de dosis</span>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {total === 0 ? (
              <div className="px-3 py-6 text-center text-sm text-foreground-secondary">
                Sin alertas
              </div>
            ) : (
              grupos.map((g) => (
                <div key={g.entidad}>
                  <div className="px-3 pt-2.5 pb-1 bg-background-secondary/60 border-b border-border/50">
                    <span className="text-xs font-semibold text-foreground-secondary uppercase tracking-wide">
                      {g.entidad}
                    </span>
                  </div>
                  {g.periodos.map((p) => (
                    <div key={p.id}>
                      <div className="px-3 py-2 border-b border-border/50 flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-foreground">
                          Período {p.rango}
                          {p.periodoAlerta?.dosis != null && (
                            <span className="font-semibold text-danger"> · {formatDosis(p.periodoAlerta.dosis)} mSv{p.periodoAlerta.umbral != null ? ` / ${formatDosis(p.periodoAlerta.umbral)}` : ''}</span>
                          )}
                        </span>
                        {p.periodoAlerta?.estadoNoti === 1 && (
                          <button
                            type="button"
                            onClick={() => handleMarcarLeida(p.periodoAlerta!)}
                            className="px-2 py-1 rounded-lg text-xs font-medium shrink-0 transition-colors border border-border text-foreground-secondary cursor-pointer hover:bg-background-secondary hover:text-foreground"
                          >
                            Marcar leída
                          </button>
                        )}
                      </div>
                      {p.items.map((a) => renderItem(a, true))}
                    </div>
                  ))}
                  {g.otros.map((a) => renderItem(a))}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
