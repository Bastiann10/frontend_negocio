import { useState, useEffect } from 'react';
import { X, Check, AlertTriangle, Mail, KeyRound, Eye, EyeOff } from 'lucide-react';
import { recuperarClave, restablecerClave } from '../services/auth.ts';

type Step = 'correo' | 'codigo' | 'success' | 'error';

interface RecuperarClaveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RecuperarClaveModal({ isOpen, onClose }: RecuperarClaveModalProps) {
  const [step, setStep] = useState<Step>('correo');
  const [prevStep, setPrevStep] = useState<Step>('correo');
  const [loading, setLoading] = useState(false);
  const [correo, setCorreo] = useState('');
  const [codigo, setCodigo] = useState('');
  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setStep('correo');
      setPrevStep('correo');
      setLoading(false);
      setCorreo('');
      setCodigo('');
      setNuevaContrasena('');
      setConfirmarContrasena('');
      setShowPass(false);
      setErrorMsg('');
      setSuccessMsg('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    if (loading) return;
    onClose();
  };

  const handleEnviarCorreo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!correo) {
      setErrorMsg('Ingresa tu correo');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await recuperarClave(correo);
      setSuccessMsg(res.message);
      setStep('codigo');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al solicitar recuperación');
      setPrevStep('correo');
      setStep('error');
    } finally {
      setLoading(false);
    }
  };

  const handleRestablecer = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!codigo || !nuevaContrasena || !confirmarContrasena) {
      setErrorMsg('Completa todos los campos');
      return;
    }
    if (nuevaContrasena !== confirmarContrasena) {
      setErrorMsg('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    try {
      const res = await restablecerClave(correo, codigo, nuevaContrasena);
      setSuccessMsg(res.message || 'Contraseña restablecida exitosamente');
      setStep('success');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al restablecer clave');
      setPrevStep('codigo');
      setStep('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-60 p-4">
      <div
        className="bg-background rounded-xl w-full max-w-md max-h-[85vh] overflow-y-auto p-6 border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center">
              <KeyRound size={18} className="text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Recuperar contraseña</h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-foreground-secondary hover:bg-foreground/5 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Paso 1: Correo */}
        {step === 'correo' && (
          <form onSubmit={handleEnviarCorreo} className="space-y-4">
            <p className="text-foreground-secondary">
              Ingresa tu correo y te enviaremos un código de recuperación.
            </p>
            <div>
              <label className="block font-medium text-foreground-secondary mb-2">Correo</label>
              <input
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                disabled={loading}
                placeholder="usuario@ejemplo.cl"
                className="w-full px-4 py-3 border border-border bg-background text-foreground rounded-lg focus:ring-2 focus:ring-focus-ring focus:border-transparent outline-none disabled:opacity-50"
              />
            </div>

            {errorMsg && (
              <p className="text-danger text-sm">{errorMsg}</p>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="flex-1 px-4 py-2 text-foreground rounded-lg hover:bg-foreground/5 cursor-pointer flex items-center justify-center gap-2 border border-border disabled:opacity-50"
              >
                <X size={16} />
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-primary text-white dark:text-foreground rounded-lg hover:bg-primary-hover cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 dark:border-foreground/30 rounded-full border-t-transparent animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Mail size={16} />
                    Enviar código
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Paso 2: Código + Nueva contraseña */}
        {step === 'codigo' && (
          <form onSubmit={handleRestablecer} className="space-y-4">
            <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
              <p className="text-success">{successMsg}</p>
            </div>

            <div>
              <label className="block font-medium text-foreground-secondary mb-2">Código de recuperación</label>
              <input
                type="text"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                disabled={loading}
                placeholder="123456"
                maxLength={6}
                className="w-full px-4 py-3 border border-border bg-background text-foreground rounded-lg focus:ring-2 focus:ring-focus-ring focus:border-transparent outline-none disabled:opacity-50 tracking-widest text-center"
              />
            </div>

            <div>
              <label className="block font-medium text-foreground-secondary mb-2">Nueva contraseña</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={nuevaContrasena}
                  onChange={(e) => setNuevaContrasena(e.target.value)}
                  disabled={loading}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-10 border border-border bg-background text-foreground rounded-lg focus:ring-2 focus:ring-focus-ring focus:border-transparent outline-none disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-foreground-secondary hover:text-foreground cursor-pointer p-1"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block font-medium text-foreground-secondary mb-2">Confirmar contraseña</label>
              <input
                type={showPass ? 'text' : 'password'}
                value={confirmarContrasena}
                onChange={(e) => setConfirmarContrasena(e.target.value)}
                disabled={loading}
                placeholder="••••••••"
                className="w-full px-4 py-3 pr-10 border border-border bg-background text-foreground rounded-lg focus:ring-2 focus:ring-focus-ring focus:border-transparent outline-none disabled:opacity-50"
              />
            </div>

            {errorMsg && (
              <p className="text-danger text-sm">{errorMsg}</p>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep('correo')}
                disabled={loading}
                className="flex-1 px-4 py-2 text-foreground rounded-lg hover:bg-foreground/5 cursor-pointer flex items-center justify-center gap-2 border border-border disabled:opacity-50"
              >
                Volver
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-primary text-white dark:text-foreground rounded-lg hover:bg-primary-hover cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 dark:border-foreground/30 rounded-full border-t-transparent animate-spin" />
                    Restableciendo...
                  </>
                ) : (
                  <>
                    <KeyRound size={16} />
                    Restablecer
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Estado de éxito */}
        {step === 'success' && (
          <div className="py-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center">
                <Check size={20} className="text-success" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Completado</h3>
            </div>
            <p className="text-foreground-secondary mb-6">{successMsg}</p>
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
        {step === 'error' && (
          <div className="py-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-danger/10 rounded-full flex items-center justify-center">
                <AlertTriangle size={20} className="text-danger" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Error</h3>
            </div>
            <p className="text-foreground-secondary mb-6">{errorMsg}</p>
            <div className="flex justify-end">
              <button
                onClick={() => setStep(prevStep)}
                className="px-4 py-2 text-foreground rounded-lg hover:bg-foreground/5 cursor-pointer flex items-center gap-2 border border-border"
              >
                Volver
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
