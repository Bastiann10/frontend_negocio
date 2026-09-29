import { useEffect, useState } from 'react';
import { getAlertasDosis, type AlertaDosisPeriodo } from '../services/alertas';
import { formatDosis } from '../../../core/utils/format';
import { usePrecision } from '../../../core/providers/PrecisionProvider';

export default function AlertasPage() {
  const { aproximar } = usePrecision();
  const [alertas, setAlertas] = useState<AlertaDosisPeriodo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getAlertasDosis()
      .then((data) => setAlertas(Array.isArray(data) ? data : []))
      .catch((err: any) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (error) {
    return <p className="text-danger">{error}</p>;
  }

  if (loading) {
    return <p className="text-foreground-secondary">Cargando alertas...</p>;
  }

  const activas = alertas.filter((a) => a.estado === 1);

  if (activas.length === 0) {
    return <p className="text-foreground-secondary">Sin alertas activas.</p>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-foreground">Alertas</h1>
      <div className="grid gap-4">
        {activas.map((alerta) => {
          const rango = alerta.fecha_inicio && alerta.fecha_fin
            ? `${new Date(alerta.fecha_inicio).getFullYear()} - ${new Date(alerta.fecha_fin).getFullYear()}`
            : '';
          return (
            <div
              key={alerta.id}
              className="bg-background rounded-xl border border-border p-4"
            >
              <p className="font-medium text-foreground">Dosis período {rango}</p>
              {alerta.dosis != null && (
                <p className="text-sm text-danger">
                  {formatDosis(alerta.dosis, aproximar)} mSv
                  {alerta.umbral != null && (
                    <span className="text-foreground-secondary"> / {formatDosis(alerta.umbral, aproximar)} mSv</span>
                  )}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
