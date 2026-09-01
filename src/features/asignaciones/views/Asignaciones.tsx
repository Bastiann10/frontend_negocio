import { useEffect, useState } from 'react';
import { getAsignaciones, entregarAsignacion, liberarAsignacion, type Asignacion } from '../services/asignaciones';

export default function AsignacionesPage() {
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    getAsignaciones()
      .then((data) => setAsignaciones(data.asignaciones))
      .catch((err: any) => setError(err.message));
  }, []);

  const entregar = async (id: number) => {
    try {
      const { asignacion } = await entregarAsignacion(id);
      setAsignaciones((prev) => prev.map((a) => (a.id === id ? asignacion : a)));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const liberar = async (id: number) => {
    try {
      const { asignacion } = await liberarAsignacion(id);
      setAsignaciones((prev) => prev.map((a) => (a.id === id ? asignacion : a)));
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (error) {
    return <p className="text-danger">{error}</p>;
  }

  if (asignaciones.length === 0) {
    return <p className="text-foreground-secondary">Sin asignaciones pendientes.</p>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-foreground">Asignaciones</h1>
      <div className="grid gap-4">
        {asignaciones.map((asignacion) => (
          <div
            key={asignacion.id}
            className="bg-background rounded-xl border border-border p-4 flex items-center justify-between"
          >
            <div>
              <p className="font-medium text-foreground">Asignación #{asignacion.id}</p>
              {asignacion.area_pe && (
                <p className="text-sm text-foreground-secondary">{asignacion.area_pe.area.nombre}</p>
              )}
              {asignacion.tarjeta_tld && (
                <p className="text-xs text-foreground-secondary">Tarjeta: {asignacion.tarjeta_tld.codigo}</p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => entregar(asignacion.id)}
                className="px-3 py-1 text-sm bg-primary text-white rounded-lg hover:bg-primary-hover"
              >
                Entregar
              </button>
              <button
                onClick={() => liberar(asignacion.id)}
                className="px-3 py-1 text-sm border border-border rounded-lg hover:bg-foreground/5"
              >
                Liberar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
