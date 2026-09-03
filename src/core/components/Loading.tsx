interface LoadingProps {
  text?: string;
  size?: 'sm' | 'md';
}

export default function Loading({ text = "Cargando...", size = 'md' }: LoadingProps) {
  const isSm = size === 'sm';
  return (
    <div className={`flex flex-col items-center justify-center ${isSm ? 'py-6' : 'py-12'}`}>
      <div className={`relative ${isSm ? 'w-8 h-8' : 'w-12 h-12'}`}>
        <div className={`absolute inset-0 ${isSm ? 'border-2' : 'border-4'} border-info/20 rounded-full`}></div>
        <div className={`absolute inset-0 ${isSm ? 'border-2' : 'border-4'} border-info rounded-full border-t-transparent animate-spin`}></div>
      </div>
      <p className={`text-foreground-secondary font-medium mt-3 ${isSm ? 'text-xs' : 'text-sm'}`}>{text}</p>
    </div>
  );
}
