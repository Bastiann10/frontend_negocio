import { Link } from 'react-router';

export default function InicioPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Bienvenido al Portal</h1>
      <p className="text-foreground-secondary">
        Accede a tus datos, entidades, áreas, asignaciones y alertas desde este panel.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link to="/perfil" className="bg-background rounded-xl border border-border p-6 hover:border-primary transition-colors">
          <h2 className="font-medium text-foreground">Mi Perfil</h2>
        </Link>
        <Link to="/entidades" className="bg-background rounded-xl border border-border p-6 hover:border-primary transition-colors">
          <h2 className="font-medium text-foreground">Mis Entidades</h2>
        </Link>
        <Link to="/areas" className="bg-background rounded-xl border border-border p-6 hover:border-primary transition-colors">
          <h2 className="font-medium text-foreground">Mis Áreas</h2>
        </Link>
        <Link to="/asignaciones" className="bg-background rounded-xl border border-border p-6 hover:border-primary transition-colors">
          <h2 className="font-medium text-foreground">Asignaciones</h2>
        </Link>
        <Link to="/alertas" className="bg-background rounded-xl border border-border p-6 hover:border-primary transition-colors">
          <h2 className="font-medium text-foreground">Alertas</h2>
        </Link>
      </div>
    </div>
  );
}
