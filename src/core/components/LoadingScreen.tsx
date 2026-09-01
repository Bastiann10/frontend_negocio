export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-background dark:bg-background flex items-center justify-center z-9999">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-info mx-auto mb-4"></div>
        <p className="text-foreground text-xl font-semibold">Cargando página interna</p>
      </div>
    </div>
  );
}
