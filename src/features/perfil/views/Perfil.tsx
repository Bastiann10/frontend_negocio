import { useEffect, useState } from 'react';
import { getPerfil, type Perfil as PerfilType, type PerfilResumen } from '../services/perfil';

export default function PerfilPage() {
  const [perfil, setPerfil] = useState<PerfilType | null>(null);
  const [resumen, setResumen] = useState<PerfilResumen | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getPerfil()
      .then((data) => {
        setPerfil(data.perfil);
        setResumen(data.resumen);
      })
      .catch((err: any) => setError(err.message));
  }, []);

  if (error) {
    return <p className="text-danger">{error}</p>;
  }

  if (!perfil) {
    return <p className="text-foreground-secondary">Cargando perfil...</p>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-foreground">Mi Perfil</h1>
      <div className="bg-background rounded-xl border border-border p-6 space-y-2">
        <p><strong className="text-foreground-secondary">Nombre:</strong> {perfil.nombre} {perfil.apellido} {perfil.segundo_apellido}</p>
        <p><strong className="text-foreground-secondary">RUT:</strong> {perfil.rut}</p>
        <p><strong className="text-foreground-secondary">Correo:</strong> {perfil.correo}</p>
        <p><strong className="text-foreground-secondary">Teléfono:</strong> {perfil.telefono}</p>
        {perfil.profesion_personal.length > 0 && (
          <p><strong className="text-foreground-secondary">Profesión:</strong> {perfil.profesion_personal.map((p) => p.profesion.nombre).join(', ')}</p>
        )}
      </div>
      {resumen && (
        <div className="bg-background rounded-xl border border-border p-6 grid grid-cols-3 gap-4">
          <div>
            <p className="text-foreground-secondary text-sm">Entidades</p>
            <p className="text-2xl font-bold text-foreground">{resumen.entidades}</p>
          </div>
          <div>
            <p className="text-foreground-secondary text-sm">Áreas</p>
            <p className="text-2xl font-bold text-foreground">{resumen.areas}</p>
          </div>
          <div>
            <p className="text-foreground-secondary text-sm">Asignaciones activas</p>
            <p className="text-2xl font-bold text-foreground">{resumen.asignaciones_activas}</p>
          </div>
        </div>
      )}
    </div>
  );
}
