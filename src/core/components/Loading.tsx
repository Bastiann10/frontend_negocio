interface LoadingProps {
  text?: string;
}

export default function Loading({ text = "Cargando..." }: LoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 border-4 border-info/20 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-info rounded-full border-t-transparent animate-spin"></div>
      </div>
      <p className="text-foreground-secondary text-sm font-medium mt-4">{text}</p>
    </div>
  );
}
