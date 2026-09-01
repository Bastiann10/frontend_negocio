import { X, Clock, User } from 'lucide-react';
import TipTapEditor from './TipTapEditor';
import type { LogEntry } from '../services/logs';

// Sub-componente para renderizar la descripción con TipTap (useEditor es un hook)
function DescripcionTipTap({ content }: { content: string }) {
  return (
    <div className="tipap-editor">
      <div className="ProseMirror-wrapper">
        <TipTapEditor content={content} onChange={() => {}} editable={false} />
      </div>
    </div>
  );
}

interface LogModalProps {
  isOpen: boolean;
  onClose: () => void;
  log: LogEntry[];
  loading?: boolean;
  title?: string;
}

// Campos a excluir de la visualización (ya se muestran aparte)
const EXCLUDED_FIELDS = ['id', 'actualizado_por', 'createdAt', 'usuario', 'id_entidad', 'id_area', 'id_area_pe', 'id_personal_expuesto', 'id_acceso_entidad_pe', 'contrasena', 'descripcion'];

// Mapeo de nombres de campos a labels legibles
const FIELD_LABELS: Record<string, string> = {
  nombre: 'Nombre',
  apellido: 'Apellido',
  segundo_apellido: 'Segundo apellido',
  rut: 'RUT',
  correo: 'Correo',
  telefono: 'Teléfono',
  direccion: 'Dirección',
  representante_rut: 'RUT representante',
  representante_nombre: 'Nombre representante',
  tipo_entidad: 'Tipo de entidad',
  tipo: 'Tipo',
  descripcion: 'Descripción',
  color_primario: 'Color primario',
  color_secundario: 'Color secundario',
  logo_url: 'Logo',
  estado: 'Estado',
  codigo: 'Código',
  cargo: 'Cargo',
  rol: 'Rol',
  motivo: 'Motivo',
  fecha_expiracion: 'Fecha expiración',
  foto_url: 'Foto',
};

// Traduce un valor individual a texto legible según el campo
function formatSingleValue(key: string, value: any): string {
  if (value === null || value === undefined || value === '' || value === '(vacío)') return '(vacío)';
  if (key === 'estado') return value === 1 || value === '1' ? 'Activo' : 'Inactivo';
  if (key === 'tipo_entidad') return value === 1 || value === '1' ? 'Empresa' : 'Individual';
  if (key === 'tipo') return value === 1 || value === '1' ? 'Público' : 'Privado';
  if (key === 'rol') return value === 1 || value === '1' ? 'Administrador' : 'Estándar';
  if (key === 'fecha_expiracion' || key === 'createdAt') {
    return new Date(value).toLocaleString('es-ES');
  }
  if (key === 'foto_url' || key === 'logo_url') return 'Imagen actualizada';
  if (typeof value === 'string' && value.startsWith('http')) return value;
  return String(value);
}

// Parsea el formato "antes→después" del backend
// Devuelve null si no hubo cambio (antes === después)
function formatValue(key: string, value: any): string | null {
  if (value === null || value === undefined || value === '') return null;

  const strValue = String(value);

  // Si contiene "→", es un cambio antes→después
  if (strValue.includes('→')) {
    const parts = strValue.split('→');
    const before = parts[0].trim();
    const after = parts.slice(1).join('→').trim();

    const beforeFormatted = formatSingleValue(key, before);
    const afterFormatted = formatSingleValue(key, after);

    // Si no hubo cambio, no mostrar
    if (beforeFormatted === afterFormatted) return null;

    return `${beforeFormatted} → ${afterFormatted}`;
  }

  // Valor simple (sin cambio)
  return formatSingleValue(key, value);
}

export default function LogModal({ isOpen, onClose, log, loading, title = 'Log de cambios' }: LogModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-border shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-background-secondary rounded cursor-pointer text-foreground-secondary hover:text-foreground"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-info border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm text-foreground-secondary">Cargando log...</span>
              </div>
            </div>
          ) : log && log.length > 0 ? (
            <div className="space-y-4">
              {log.map((entry) => {
                const fields = Object.entries(entry)
                  .filter(([key]) => !EXCLUDED_FIELDS.includes(key))
                  .map(([key, value]) => ({ key, value, formatted: formatValue(key, value) }))
                  .filter((f) => f.formatted !== null);

                return (
                  <div key={entry.id} className="relative pl-8 pb-4 border-l-2 border-border last:border-l-transparent">
                    <div className="absolute -left-1.75 top-0 w-3 h-3 rounded-full bg-primary" />

                    <div className="bg-background-secondary rounded-lg p-4 space-y-2">
                      {/* Usuario */}
                      <div className="flex items-center gap-2 text-sm">
                        <User size={16} className="text-foreground-secondary" />
                        <span className="text-foreground-secondary">Actualizado por:</span>
                        <span className="text-foreground font-medium">
                          {entry.usuario?.nombre} {entry.usuario?.apellido}
                          {entry.usuario?.segundo_apellido ? ` ${entry.usuario.segundo_apellido}` : ''}
                        </span>
                      </div>

                      {/* Fecha */}
                      <div className="flex items-center gap-2 text-sm">
                        <Clock size={16} className="text-foreground-secondary" />
                        <span className="text-foreground-secondary">Fecha:</span>
                        <span className="text-foreground font-medium">
                          {new Date(entry.createdAt).toLocaleString('es-ES')}
                        </span>
                      </div>

                      {/* Campos específicos */}
                      {fields.length > 0 && (
                        <div className="pt-2 border-t border-border space-y-1.5">
                          {fields.map((f) => (
                            <div key={f.key} className="flex items-start gap-2 text-sm">
                              <span className="text-foreground-secondary shrink-0">
                                {FIELD_LABELS[f.key] || f.key}:
                              </span>
                              <span className="text-foreground font-medium break-all">
                                {f.formatted}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Descripción con TipTap */}
                      {entry.descripcion && (() => {
                        const desc = String(entry.descripcion);
                        if (desc.includes('→')) {
                          const parts = desc.split('→');
                          const before = parts[0].trim();
                          const after = parts.slice(1).join('→').trim();
                          if (before === after) return null;
                          return (
                            <div className="pt-2 border-t border-border space-y-2">
                              <div>
                                <span className="text-sm text-foreground-secondary">Descripción anterior:</span>
                                <div className="mt-1 text-foreground">
                                  <DescripcionTipTap content={before} />
                                </div>
                              </div>
                              <div>
                                <span className="text-sm text-foreground-secondary">Descripción nueva:</span>
                                <div className="mt-1 text-foreground">
                                  <DescripcionTipTap content={after} />
                                </div>
                              </div>
                            </div>
                          );
                        }
                        return (
                          <div className="pt-2 border-t border-border">
                            <span className="text-sm text-foreground-secondary">Descripción:</span>
                            <div className="mt-1 text-foreground">
                              <DescripcionTipTap content={desc} />
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-foreground-secondary">No hay registros en el log</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
