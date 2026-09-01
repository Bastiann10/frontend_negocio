import { useState } from 'react';
import { X, AlertCircle, User, Building2, Check } from 'lucide-react';
import { formatChileanRut } from '../utils/format';

export interface PreviewTrimestrePersona {
  personal: string;
  rut: string;
}

export interface PreviewTrimestreGroup {
  nombre?: string;
  personas: PreviewTrimestrePersona[];
}

interface PreviewTrimestreModalProps {
  open: boolean;
  onClose: () => void;
  groups: PreviewTrimestreGroup[];
  total: number;
  loading: boolean;
  onConfirm: () => Promise<{ trimestres_iniciados: number }>;
  onSuccess?: (trimestresIniciados: number) => void;
}

export default function PreviewTrimestreModal({
  open,
  onClose,
  groups,
  total,
  loading,
  onConfirm,
  onSuccess,
}: PreviewTrimestreModalProps) {
  const [confirmando, setConfirmando] = useState(false);
  const [success, setSuccess] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleConfirm = async () => {
    setConfirmando(true);
    setError(null);
    try {
      const response = await onConfirm();
      setSuccess(response.trimestres_iniciados);
      onSuccess?.(response.trimestres_iniciados);
    } catch (err: any) {
      setError(err.message || 'Error al iniciar trimestre');
    } finally {
      setConfirmando(false);
    }
  };

  const handleClose = () => {
    setSuccess(null);
    setError(null);
    setConfirmando(false);
    onClose();
  };

  const hasGroups = groups.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-background rounded-xl border border-border shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Iniciar Trimestre</h2>
          <button
            onClick={handleClose}
            className="text-foreground-secondary hover:text-foreground cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="relative w-10 h-10">
                <div className="absolute inset-0 border-4 border-info/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-info rounded-full border-t-transparent animate-spin"></div>
              </div>
              <p className="text-foreground-secondary mt-3 text-sm">Cargando preview...</p>
            </div>
          ) : success !== null ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-14 h-14 bg-success/20 rounded-full flex items-center justify-center mb-4">
                <Check size={28} className="text-success" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">Trimestres Iniciados</h3>
              <p className="text-sm text-foreground-secondary">
                {success} trimestre(s) iniciado(s) correctamente.
              </p>
            </div>
          ) : hasGroups ? (
            <>
              {/* Aviso */}
              <div className="flex items-start gap-3 p-4 rounded-lg bg-info/10 border border-info/30 mb-4">
                <AlertCircle size={20} className="text-info shrink-0 mt-0.5" />
                <p className="text-sm text-foreground">
                  Se registrarán los trimestres de los siguientes personales ({total} en total).
                </p>
              </div>

              {/* Lista agrupada o plana */}
              <div className="space-y-4">
                {groups.map((group, gIdx) => (
                  <div key={gIdx}>
                    {group.nombre && (
                      <div className="flex items-center gap-2 mb-2">
                        <Building2 size={14} className="text-foreground-secondary" />
                        <h3 className="text-sm font-medium text-foreground">{group.nombre}</h3>
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {group.personas.map((persona, pIdx) => (
                        <div
                          key={pIdx}
                          className="flex items-center gap-3 p-3 rounded-lg bg-background-secondary border border-border"
                        >
                          <div className="w-9 h-9 rounded-lg bg-foreground/10 flex items-center justify-center shrink-0">
                            <User size={16} className="text-foreground-secondary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{persona.personal}</p>
                            <p className="text-xs text-foreground-secondary truncate">{formatChileanRut(persona.rut)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Error */}
              {error && (
                <div className="mt-4 p-3 rounded-lg bg-danger/10 border border-danger/30 flex items-center gap-2 text-sm text-danger">
                  <AlertCircle size={16} className="shrink-0" />
                  {error}
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-foreground-secondary text-center py-8">No se pudo cargar la información.</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-5 border-t border-border">
          {success !== null ? (
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm bg-primary text-white dark:text-foreground rounded-lg hover:bg-primary-hover cursor-pointer"
            >
              Cerrar
            </button>
          ) : (
            <>
              <button
                onClick={handleClose}
                disabled={confirmando}
                className="px-4 py-2 text-sm text-foreground border border-border rounded-lg hover:bg-foreground/5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                disabled={loading || !hasGroups || confirmando}
                className="px-4 py-2 text-sm bg-primary text-white dark:text-foreground rounded-lg hover:bg-primary-hover cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {confirmando ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white dark:border-foreground border-t-transparent rounded-full animate-spin" />
                    Iniciando...
                  </>
                ) : (
                  'Confirmar e Iniciar'
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
