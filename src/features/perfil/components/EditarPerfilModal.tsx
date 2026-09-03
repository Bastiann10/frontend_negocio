import { useState, useEffect } from 'react';
import { X, Check, AlertTriangle, Edit, Eye, EyeOff } from 'lucide-react';
import { type Perfil, type UpdatePerfilPayload } from '../services/perfil';

type ModalState = 'form' | 'loading' | 'success' | 'error';

interface EditarPerfilModalProps {
  isOpen: boolean;
  onClose: () => void;
  perfil: Perfil | null;
  onSave: (payload: UpdatePerfilPayload) => Promise<string>;
}

export default function EditarPerfilModal({ isOpen, onClose, perfil, onSave }: EditarPerfilModalProps) {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [segundoApellido, setSegundoApellido] = useState('');
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [cambiarPassword, setCambiarPassword] = useState(false);
  const [passwordActual, setPasswordActual] = useState('');
  const [passwordNueva, setPasswordNueva] = useState('');
  const [passwordConfirmar, setPasswordConfirmar] = useState('');
  const [modalState, setModalState] = useState<ModalState>('form');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showPassActual, setShowPassActual] = useState(false);
  const [showPassNueva, setShowPassNueva] = useState(false);
  const [showPassConfirmar, setShowPassConfirmar] = useState(false);

  useEffect(() => {
    if (isOpen && perfil) {
      setNombre(perfil.nombre);
      setApellido(perfil.apellido);
      setSegundoApellido(perfil.segundo_apellido ?? '');
      setCorreo(perfil.correo);
      setTelefono(perfil.telefono ?? '');
      setCambiarPassword(false);
      setPasswordActual('');
      setPasswordNueva('');
      setPasswordConfirmar('');
      setModalState('form');
      setErrorMsg('');
      setSuccessMsg('');
      setShowPassActual(false);
      setShowPassNueva(false);
      setShowPassConfirmar(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    if (modalState === 'loading') return;
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (cambiarPassword) {
      if (!passwordActual || !passwordNueva || !passwordConfirmar) {
        setErrorMsg('Completa todos los campos de contraseña');
        return;
      }
      if (passwordNueva !== passwordConfirmar) {
        setErrorMsg('Las contraseñas nuevas no coinciden');
        return;
      }
    }

    // Solo enviar campos que cambiaron nulos ver que pasa ahi
    if (!perfil) return;
    const payload: UpdatePerfilPayload = {};
    if (nombre !== perfil.nombre) payload.nombre = nombre;
    if (apellido !== perfil.apellido) payload.apellido = apellido;
    if (segundoApellido !== (perfil.segundo_apellido ?? '')) payload.segundo_apellido = segundoApellido;
    if (correo !== perfil.correo) payload.correo = correo;
    if (telefono !== (perfil.telefono ?? '')) payload.telefono = telefono;

    if (cambiarPassword) {
      payload.contrasena_actual = passwordActual;
      payload.contrasena_nueva = passwordNueva;
    }

    if (Object.keys(payload).length === 0) {
      setErrorMsg('No hay cambios para guardar');
      return;
    }

    setModalState('loading');
    try {
      const message = await onSave(payload);
      setSuccessMsg(message || 'Perfil actualizado exitosamente');
      setModalState('success');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al actualizar el perfil');
      setModalState('error');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-60 p-4">
      <div
        className="bg-background rounded-xl w-full max-w-md max-h-[85vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center">
              <Edit size={18} className="text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Editar perfil</h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-foreground-secondary hover:bg-foreground/5 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Formulario */}
        {(modalState === 'form' || modalState === 'loading') && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-foreground-secondary mb-1">Nombre</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                disabled={modalState === 'loading'}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background-secondary text-foreground focus:outline-none focus:ring-2 focus:ring-focus-ring focus:border-transparent disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground-secondary mb-1">Apellido</label>
              <input
                type="text"
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                disabled={modalState === 'loading'}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background-secondary text-foreground focus:outline-none focus:ring-2 focus:ring-focus-ring focus:border-transparent disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground-secondary mb-1">Segundo apellido</label>
              <input
                type="text"
                value={segundoApellido}
                onChange={(e) => setSegundoApellido(e.target.value)}
                disabled={modalState === 'loading'}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background-secondary text-foreground focus:outline-none focus:ring-2 focus:ring-focus-ring focus:border-transparent disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground-secondary mb-1">Correo</label>
              <input
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                disabled={modalState === 'loading'}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background-secondary text-foreground focus:outline-none focus:ring-2 focus:ring-focus-ring focus:border-transparent disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground-secondary mb-1">Teléfono</label>
              <input
                type="text"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                disabled={modalState === 'loading'}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background-secondary text-foreground focus:outline-none focus:ring-2 focus:ring-focus-ring focus:border-transparent disabled:opacity-50"
              />
            </div>

            {/* Cambiar contraseña */}
            <div className="pt-2 border-t border-border">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={cambiarPassword}
                  onChange={(e) => setCambiarPassword(e.target.checked)}
                  disabled={modalState === 'loading'}
                  className="w-4 h-4 rounded cursor-pointer accent-primary disabled:opacity-50"
                />
                <span className="text-sm text-foreground">Cambiar contraseña</span>
              </label>

              {cambiarPassword && (
                <div className="space-y-3 mt-3">
                  <div>
                    <label className="block text-xs font-medium text-foreground-secondary mb-1">Contraseña actual</label>
                    <div className="relative">
                      <input
                        type={showPassActual ? 'text' : 'password'}
                        value={passwordActual}
                        onChange={(e) => setPasswordActual(e.target.value)}
                        disabled={modalState === 'loading'}
                        className="w-full px-3 py-2 pr-10 text-sm rounded-lg border border-border bg-background-secondary text-foreground focus:outline-none focus:ring-2 focus:ring-focus-ring focus:border-transparent disabled:opacity-50"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassActual((v) => !v)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-foreground-secondary hover:text-foreground cursor-pointer"
                      >
                        {showPassActual ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground-secondary mb-1">Nueva contraseña</label>
                    <div className="relative">
                      <input
                        type={showPassNueva ? 'text' : 'password'}
                        value={passwordNueva}
                        onChange={(e) => setPasswordNueva(e.target.value)}
                        disabled={modalState === 'loading'}
                        className="w-full px-3 py-2 pr-10 text-sm rounded-lg border border-border bg-background-secondary text-foreground focus:outline-none focus:ring-2 focus:ring-focus-ring focus:border-transparent disabled:opacity-50"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassNueva((v) => !v)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-foreground-secondary hover:text-foreground cursor-pointer"
                      >
                        {showPassNueva ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground-secondary mb-1">Confirmar contraseña</label>
                    <div className="relative">
                      <input
                        type={showPassConfirmar ? 'text' : 'password'}
                        value={passwordConfirmar}
                        onChange={(e) => setPasswordConfirmar(e.target.value)}
                        disabled={modalState === 'loading'}
                        className="w-full px-3 py-2 pr-10 text-sm rounded-lg border border-border bg-background-secondary text-foreground focus:outline-none focus:ring-2 focus:ring-focus-ring focus:border-transparent disabled:opacity-50"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassConfirmar((v) => !v)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-foreground-secondary hover:text-foreground cursor-pointer"
                      >
                        {showPassConfirmar ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {errorMsg && modalState === 'form' && (
              <p className="text-danger text-sm">{errorMsg}</p>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                disabled={modalState === 'loading'}
                className="flex-1 px-4 py-2 text-foreground rounded-lg hover:bg-foreground/5 cursor-pointer flex items-center justify-center gap-2 border border-border disabled:opacity-50"
              >
                <X size={16} />
                Cancelar
              </button>
              <button
                type="submit"
                disabled={modalState === 'loading'}
                className="flex-1 px-4 py-2 bg-primary text-white dark:text-foreground rounded-lg hover:bg-primary-hover cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {modalState === 'loading' ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 dark:border-foreground/30 rounded-full border-t-transparent animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Edit size={16} />
                    Guardar
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Estado de éxito */}
        {modalState === 'success' && (
          <div className="py-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center">
                <Check size={20} className="text-success" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Completado</h3>
            </div>
            <p className="text-foreground-secondary text-sm mb-6">{successMsg}</p>
            <div className="flex justify-end">
              <button
                onClick={handleClose}
                className="px-4 py-2 bg-success text-background rounded-lg hover:bg-success/80 cursor-pointer flex items-center gap-2"
              >
                <Check size={16} />
                Aceptar
              </button>
            </div>
          </div>
        )}

        {/* Estado de error */}
        {modalState === 'error' && (
          <div className="py-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-danger/10 rounded-full flex items-center justify-center">
                <AlertTriangle size={20} className="text-danger" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Error</h3>
            </div>
            <p className="text-foreground-secondary text-sm mb-6">{errorMsg}</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setModalState('form')}
                className="px-4 py-2 text-foreground rounded-lg hover:bg-foreground/5 cursor-pointer flex items-center gap-2 border border-border"
              >
                Volver
              </button>
              <button
                onClick={handleClose}
                className="px-4 py-2 text-foreground rounded-lg hover:bg-foreground/5 cursor-pointer flex items-center gap-2 border border-border"
              >
                <X size={16} />
                Cerrar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
