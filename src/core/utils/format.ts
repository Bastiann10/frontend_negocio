import type { UseFormSetValue } from 'react-hook-form';

/**
 * Limpia un número de teléfono chileno (elimina espacios pero mantiene +56)
 * @param phone - Número de teléfono formateado o sin formatear
 * @returns Número limpio (+56 seguido de dígitos, sin espacios)
 */
export function cleanChileanPhone(phone: string): string {
  if (!phone) return '';

  // Eliminar espacios
  const cleaned = phone.replace(/\s/g, '');

  // Eliminar caracteres no numéricos excepto el +
  const withoutSpecialChars = cleaned.replace(/[^\d+]/g, '');

  // Si no tiene +56, agregarlo
  if (!withoutSpecialChars.startsWith('+56')) {
    if (withoutSpecialChars.startsWith('56')) {
      return '+56' + withoutSpecialChars.substring(2);
    }
    return '+56' + withoutSpecialChars;
  }

  return withoutSpecialChars;
}

/**
 * Formatea un número de teléfono chileno con prefijo automático +56
 * @param phone - Número de teléfono (ej: "+56912345678" o "912345678" o "12345678")
 * @returns Número formateado (ej: "+56 9 1234 5678")
 */
export function formatChileanPhone(phone: string): string {
  if (!phone) return '+56';

  // Extraer solo los dígitos del input
  let digits = phone.replace(/\D/g, '');

  // Si el usuario borró parte del prefijo, asegurar que vuelva a +56
  if (digits.length < 3) {
    return '+56';
  }

  // Si ya incluye el prefijo 56, lo removemos para que el usuario escriba el resto
  if (digits.startsWith('56')) {
    digits = digits.substring(2);
  }

  // Limitar a 9 dígitos después del prefijo
  if (digits.length > 9) {
    digits = digits.substring(0, 9);
  }

  // Prefijo automático +56 y formateo progresivo del resto
  if (digits.length === 0) return '+56';
  if (digits.length === 1) return `+56 ${digits}`;
  if (digits.length <= 5) return `+56 ${digits[0]} ${digits.substring(1)}`;
  return `+56 ${digits[0]} ${digits.substring(1, 5)} ${digits.substring(5)}`;
}

/**
 * Valida un RUT chileno usando el algoritmo módulo 11
 * @param rut - RUT en cualquier formato (ej: "12.345.678-9", "123456789")
 * @returns true si el RUT es válido, false en caso contrario
 */
export function isValidChileanRut(rut: string): boolean {
  if (!rut) return false;

  const cleaned = cleanChileanRut(rut).toUpperCase();

  // Debe tener al menos 2 caracteres (cuerpo + dv)
  if (cleaned.length < 2) return false;

  const body = cleaned.slice(0, -1);
  const dv = cleaned.slice(-1);

  // El cuerpo debe ser numérico
  if (!/^\d+$/.test(body)) return false;

  // El dígito verificador debe ser numérico o 'K'
  if (!/^[0-9K]$/.test(dv)) return false;

  // Algoritmo módulo 11
  let sum = 0;
  let multiplier = 2;

  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i], 10) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const mod11 = 11 - (sum % 11);
  let expectedDv: string;

  if (mod11 === 11) expectedDv = '0';
  else if (mod11 === 10) expectedDv = 'K';
  else expectedDv = mod11.toString();

  return dv === expectedDv;
}

/**
 * Limpia un RUT chileno (elimina puntos y guiones)
 * @param rut - RUT formateado o sin formatear
 * @returns RUT limpio (solo dígitos y dígito verificador)
 */
export function cleanChileanRut(rut: string): string {
  if (!rut) return '';

  // Eliminar puntos, guiones, espacios y normalizar K a mayúscula
  return rut.replace(/[.-\s]/g, '').toUpperCase();
}

/**
 * Formatea un RUT chileno
 * @param rut - RUT sin formato (ej: "815813005" o "81581300-5")
 * @returns RUT formateado (ej: "81.581.300-5")
 */
export function formatChileanRut(rut: string): string {
  if (!rut) return '';

  // Limpiar primero
  const cleaned = cleanChileanRut(rut);

  // Si está vacío después de limpiar, devolver original
  if (cleaned.length === 0) return rut;

  // Separar el dígito verificador
  const body = cleaned.slice(0, -1);
  const dv = cleaned.slice(-1);

  // Formatear el cuerpo con puntos
  let formattedBody = '';
  for (let i = body.length - 1, count = 0; i >= 0; i--, count++) {
    if (count > 0 && count % 3 === 0) {
      formattedBody = '.' + formattedBody;
    }
    formattedBody = body[i] + formattedBody;
  }

  return `${formattedBody}-${dv}`;
}

/**
 * Genera un handler onChange para formatear un RUT chileno en tiempo real
 * @param setValue - Función de react-hook-form para actualizar el valor
 * @param field - Nombre del campo a formatear
 * @returns Handler onChange que formatea el RUT mientras se escribe
 */
export function formatRutOnChange(setValue: UseFormSetValue<any>, field: string) {
  return (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const cleaned = cleanChileanRut(value);
    const formatted = formatChileanRut(cleaned);
    setValue(field, formatted, { shouldValidate: false, shouldDirty: true });
  };
}

/**
 * Genera un handler onChange para formatear un teléfono chileno en tiempo real
 * @param setValue - Función de react-hook-form para actualizar el valor
 * @param field - Nombre del campo a formatear
 * @returns Handler onChange que formatea el teléfono mientras se escribe
 */
export function formatPhoneOnChange(setValue: UseFormSetValue<any>, field: string) {
  return (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formatted = formatChileanPhone(value);
    setValue(field, formatted, { shouldValidate: false, shouldDirty: true });
  };
}

/**
 * Normaliza un objeto de datos eliminando espacios extra de los campos de texto
 * @param data - Objeto con datos a normalizar
 * @returns Objeto con campos de texto normalizados (trim)
 */
export function normalizeData<T extends Record<string, any>>(data: T): T {
  const normalized: any = {};
  
  for (const key in data) {
    const value = data[key];
    
    if (typeof value === 'string') {
      normalized[key] = value.trim();
    } else {
      normalized[key] = value;
    }
  }
  
  return normalized;
}

/**
 * Calcula el color de texto más legible (blanco o negro) sobre un color de fondo hex.
 * Usa la fórmula de luminancia relativa del W3C.
 * @param hex - Color de fondo en formato hex (#rrggbb o #rgb)
 * @returns '#ffffff' para fondos oscuros, '#000000' para fondos claros
 */
export function getReadableTextColor(hex: string): string {
  if (!hex) return '#000000';
  let c = hex.replace('#', '');
  if (c.length === 3) {
    c = c.split('').map((ch) => ch + ch).join('');
  }
  const r = parseInt(c.substring(0, 2), 16) / 255;
  const g = parseInt(c.substring(2, 4), 16) / 255;
  const b = parseInt(c.substring(4, 6), 16) / 255;
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

/**
 * Formatea una fecha con hora en formato chileno (24h, mes abreviado)
 * @param date - Fecha como string ISO o Date
 * @returns Fecha formateada (ej: "02 sept. 2026, 16:30") o '—' si es null/undefined
 */
export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return '—';
  return new Date(date).toLocaleString('es-CL', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: false,
  });
}
