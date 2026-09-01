import { useEffect, useState } from 'react';
import { getAlertas, type Alerta } from '../services/alertas';

export default function AlertasPage() {
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [anio, setAnio] = useState<number | null>(null);
  const [trimestre, setTrimestre] = useState<number | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getAlertas()
      .then((data) => {
        setAlertas(data.alertas);
        setAnio(data.anio_actual);
        setTrimestre(data.trimestre_actual);
      })
      .catch((err: any) => setError(err.message));
  }, []);

  if (error) {
    return <p className="text-danger">{error}</p>;
  }

  if (alertas.length === 0) {
    return <p className="text-foreground-secondary">Sin alertas activas.</p>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-foreground">Alertas</h1>
      {anio && trimestre && (
        <p className="text-foreground-secondary">Año {anio} - Trimestre {trimestre}</p>
      )}
      <div className="grid gap-4">
        {alertas.map((alerta, index) => (
          <div
            key={index}
            className="bg-background rounded-xl border border-border p-4"
          >
            <p className="font-medium text-foreground capitalize">{alerta.tipo.replace(/_/g, ' ')}</p>
            {alerta.area && (
              <p className="text-sm text-foreground-secondary">Área: {alerta.area.nombre}</p>
            )}
            {alerta.asignacion && (
              <p className="text-xs text-foreground-secondary">Tarjeta: {alerta.asignacion.tarjeta_tld.codigo}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
