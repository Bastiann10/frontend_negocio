const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const getLogoUrl = (): string => `${API_BASE_URL}/portal/configuracion/logo`;
