import { useState, useEffect, useRef } from 'react';

interface SmartImageProps {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  fallbackClassName?: string;
  fallbackColor?: string;
}

/**
 * Componente de imagen que analiza el brillo promedio de la imagen
 * y aplica un color de fondo que contraste: blanco si la imagen es oscura,
 * gris claro si la imagen es clara. Esto asegura que PNGs con transparencia
 * y fondos transparentes sean siempre visibles en cualquier modo (claro/oscuro).
 */
export default function SmartImage({
  src,
  alt,
  className = '',
  imgClassName = '',
  fallbackColor,
}: SmartImageProps) {
  const [bgColor, setBgColor] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!src) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const canvas = canvasRef.current || document.createElement('canvas');
        const size = 32;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(img, 0, 0, size, size);
        const data = ctx.getImageData(0, 0, size, size).data;

        let totalR = 0, totalG = 0, totalB = 0, count = 0;
        for (let i = 0; i < data.length; i += 4) {
          const a = data[i + 3];
          if (a > 10) {
            totalR += data[i];
            totalG += data[i + 1];
            totalB += data[i + 2];
            count++;
          }
        }

        if (count === 0) {
          setBgColor('#ffffff');
          return;
        }

        const avgR = totalR / count;
        const avgG = totalG / count;
        const avgB = totalB / count;
        const luminance = (0.299 * avgR + 0.587 * avgG + 0.114 * avgB) / 255;

        if (luminance > 0.6) {
          setBgColor('#e5e7eb');
        } else {
          setBgColor('#ffffff');
        }
      } catch {
        setBgColor('#ffffff');
      }
    };

    img.onerror = () => {
      setBgColor('#ffffff');
    };

    img.src = src;
  }, [src]);

  const background = fallbackColor || bgColor || undefined;

  return (
    <>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <div
        className={className}
        style={background ? { backgroundColor: background } : undefined}
      >
        <img
          src={src}
          alt={alt}
          className={imgClassName}
        />
      </div>
    </>
  );
}
