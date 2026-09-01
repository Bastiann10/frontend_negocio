import { useState, useEffect } from 'react';
import { Power, X, Check, AlertTriangle } from 'lucide-react';

type ModalState = 'confirm' | 'loading' | 'success' | 'error';

interface ConfirmToggleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  currentState: number;
  title: string;
  confirmMessage: string;
  successMessage: string;
  errorMessage?: string;
}

export default function ConfirmToggleModal({
  isOpen,
  onClose,
  onConfirm,
  currentState,
  title,
  confirmMessage,
  successMessage,
  errorMessage = 'Ocurrió un error al procesar la solicitud.',
}: ConfirmToggleModalProps) {
  const [modalState, setModalState] = useState<ModalState>('confirm');

  useEffect(() => {
    if (isOpen) {
      setModalState('confirm');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isDeactivating = currentState === 1;

  const handleConfirm = async () => {
    setModalState('loading');
    try {
      await onConfirm();
      setModalState('success');
    } catch (error) {
      console.error('Error en ConfirmToggleModal:', error);
      setModalState('error');
    }
  };

  const handleClose = () => {
    if (modalState === 'loading') return;
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div
        className="bg-background rounded-xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {modalState === 'confirm' && (
          <>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isDeactivating ? 'bg-danger/10' : 'bg-success/10'
              }`}>
                <Power size={20} className={isDeactivating ? 'text-danger' : 'text-success'} />
              </div>
              <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            </div>
            <p className="text-foreground-secondary mb-6">{confirmMessage}</p>
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
                className={`flex-1 px-4 py-2 text-background rounded-lg cursor-pointer flex items-center justify-center gap-2 ${
                  isDeactivating
                    ? 'bg-danger hover:bg-danger/80'
                    : 'bg-success hover:bg-success/80'
                }`}
              >
                <Power size={16} />
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
            <p className="text-foreground-secondary mt-4">Procesando...</p>
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
                onClick={handleClose}
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
            <p className="text-foreground-secondary mb-6">{errorMessage}</p>
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
