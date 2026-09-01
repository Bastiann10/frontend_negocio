import { useState, useEffect } from 'react';
import { Edit, X, Check, AlertTriangle } from 'lucide-react';

type ModalState = 'confirm' | 'loading' | 'success' | 'error';

interface ChangedField {
  label: string;
  oldValue: string;
  newValue: string;
}

interface ConfirmEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  onSuccess?: () => void;
  title: string;
  changedFields: ChangedField[];
  successMessage: string;
  errorMessage?: string;
}

export default function ConfirmEditModal({
  isOpen,
  onClose,
  onConfirm,
  onSuccess,
  title,
  changedFields,
  successMessage,
  errorMessage = 'Ocurrió un error al procesar la solicitud.',
}: ConfirmEditModalProps) {
  const [modalState, setModalState] = useState<ModalState>('confirm');
  const [currentErrorMessage, setCurrentErrorMessage] = useState(errorMessage);

  useEffect(() => {
    if (isOpen) {
      setModalState('confirm');
      setCurrentErrorMessage(errorMessage);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setModalState('loading');
    try {
      await onConfirm();
      setModalState('success');
    } catch (error: any) {
      console.error('Error en ConfirmEditModal:', error);
      const backendMessage = error?.message || error?.response?.data?.message || error?.data?.message;
      setCurrentErrorMessage(backendMessage || errorMessage);
      setModalState('error');
    }
  };

  const handleClose = () => {
    if (modalState === 'loading') return;
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-60">
      <div
        className="bg-background rounded-xl w-full max-w-xl max-h-[85vh] overflow-y-auto p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {modalState === 'confirm' && (
          <>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Edit size={20} className="text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            </div>
            <p className="text-foreground-secondary mb-6 text-base">¿Estás seguro de editar esta información?</p>
            {changedFields.length > 0 && (
              <div className="mb-8 space-y-3 max-h-60 overflow-y-auto">
                {changedFields.map((field, index) => (
                  <div key={index} className="flex flex-col gap-1 p-4 rounded-lg bg-background-secondary">
                    <span className="text-sm font-medium text-foreground">{field.label}</span>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-foreground-secondary line-through">{field.oldValue || '(vacío)'}</span>
                      <span className="text-foreground-secondary">→</span>
                      <span className="text-foreground font-medium">{field.newValue || '(vacío)'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-2 text-foreground rounded-lg hover:bg-background-secondary cursor-pointer flex items-center justify-center gap-2"
              >
                <X size={16} />
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 px-4 py-2 bg-primary text-white dark:text-foreground rounded-lg hover:bg-primary-hover cursor-pointer flex items-center justify-center gap-2"
              >
                <Edit size={16} />
                Confirmar
              </button>
            </div>
          </>
        )}

        {modalState === 'loading' && (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 border-4 border-success/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-success rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p className="text-foreground-secondary mt-4">Guardando cambios...</p>
          </div>
        )}

        {modalState === 'success' && (
          <>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center">
                <Check size={20} className="text-success" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Completado</h3>
            </div>
            <p className="text-foreground-secondary mb-6">{successMessage}</p>
            <div className="flex justify-end">
              <button
                onClick={() => {
                  if (onSuccess) onSuccess();
                  handleClose();
                }}
                className="px-4 py-2 bg-success text-background rounded-lg hover:bg-success/80 cursor-pointer flex items-center gap-2"
              >
                <Check size={16} />
                Aceptar
              </button>
            </div>
          </>
        )}

        {modalState === 'error' && (
          <>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-danger/10 rounded-full flex items-center justify-center">
                <AlertTriangle size={20} className="text-danger" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Error</h3>
            </div>
            <p className="text-foreground-secondary mb-6">{currentErrorMessage}</p>
            <div className="flex justify-end">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-foreground rounded-lg hover:bg-background-secondary cursor-pointer flex items-center gap-2"
              >
                <X size={16} />
                Cerrar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
