export function getChangedFields<T extends Record<string, any>>(
  original: T,
  updated: T
): Partial<T> {
  const changed: Partial<T> = {};

  // Normaliza un valor para comparación: null/undefined/'' se tratan como equivalentes
  const normalize = (value: any): string => {
    if (value === null || value === undefined || value === '') return '';
    return String(value);
  };

  for (const key in updated) {
    const origVal = normalize(original[key]);
    const newVal = normalize(updated[key]);
    if (origVal !== newVal) {
      changed[key] = updated[key];
    }
  }

  return Object.keys(changed).length > 0 ? changed : {};
}
