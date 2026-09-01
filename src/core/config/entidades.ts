import inacapLogo from '../../assets/inacap-logo.png';
import santoTomasLogo from '../../assets/ST-Logo-UST-01.png';
import { getPersonalExpuestoCountByEntidadId, getPersonalExpuestoByEntidadId, personalExpuesto } from './data';
import { getAreaCountByEntidadId } from './areas';

export interface PersonalExpuesto {
  id: number;
  nombre: string;
  apellido: string;
  rut: string;
  estado: string;
  telefono?: string;
  correo?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EntidadConfig {
  id: number;
  nombre: string;
  rut: string;
  estado: string;
  logo: string | null;
  sidebarBgColor: string;
  hoverBgColor: string;
  borderColor: string;
  avatarBgColor: string;
  avatarGradient: string;
  tldBgColor: string;
  personalExpuesto?: number;
  tldTotal?: number;
  alertas?: number;
  areas?: number;
}

// Calcular estadísticas dinámicamente basado en personalExpuesto
const getPersonalExpuestoCount = (entidadId: number): number => {
  return getPersonalExpuestoCountByEntidadId(entidadId);
};

// Filtrar personal expuesto por entidad - usando función de data.ts
export const getPersonalExpuestoByEntidad = (entidadId?: number): PersonalExpuesto[] => {
  if (entidadId === undefined || entidadId === null) {
    return personalExpuesto;
  }
  return getPersonalExpuestoByEntidadId(entidadId);
};

export const entidadesConfig: EntidadConfig[] = [
  {
    id: 1,
    nombre: 'INACAP',
    rut: '81.581.300-5',
    estado: 'Activa',
    logo: inacapLogo,
    sidebarBgColor: 'bg-red-900',
    hoverBgColor: 'hover:bg-red-800',
    borderColor: 'border-red-800',
    avatarBgColor: 'bg-red-600',
    avatarGradient: 'bg-linear-to-br from-red-500 to-red-600',
    tldBgColor: 'bg-danger',
    personalExpuesto: getPersonalExpuestoCount(1),
    tldTotal: getPersonalExpuestoCount(1),
    alertas: 0,
    areas: getAreaCountByEntidadId(1),
  },
  {
    id: 2,
    nombre: 'Santo Tomás',
    rut: '81.234.567-K',
    estado: 'Activa',
    logo: santoTomasLogo,
    sidebarBgColor: 'bg-green-900',
    hoverBgColor: 'hover:bg-green-800',
    borderColor: 'border-green-800',
    avatarBgColor: 'bg-green-600',
    avatarGradient: 'bg-linear-to-br from-green-500 to-green-600',
    tldBgColor: 'bg-success',
    personalExpuesto: getPersonalExpuestoCount(2),
    tldTotal: getPersonalExpuestoCount(2),
    alertas: 0,
    areas: getAreaCountByEntidadId(2),
  },
  {
    id: 3,
    nombre: 'Hospital Regional',
    rut: '81.345.678-1',
    estado: 'Activa',
    logo: null,
    sidebarBgColor: 'bg-blue-900',
    hoverBgColor: 'hover:bg-blue-800',
    borderColor: 'border-blue-800',
    avatarBgColor: 'bg-primary',
    avatarGradient: 'bg-linear-to-br from-blue-500 to-blue-600',
    tldBgColor: 'bg-primary',
    personalExpuesto: getPersonalExpuestoCount(3),
    tldTotal: getPersonalExpuestoCount(3),
    alertas: 0,
    areas: getAreaCountByEntidadId(3),
  },
];

export const getEntidadConfig = (nombre: string): EntidadConfig | null => {
  return entidadesConfig.find(config => config.nombre === nombre) || null;
};

export const getEntidadConfigById = (id: number): EntidadConfig | null => {
  return entidadesConfig.find(config => config.id === id) || null;
};
