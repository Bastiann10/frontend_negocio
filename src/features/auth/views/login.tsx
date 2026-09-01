import { useState } from 'react';
import { useNavigate } from 'react-router';
import { login } from '../services/auth.ts';
import { useLoginForm } from '../hook/useAuthForm.ts';
import { useLogo } from '../../../core/providers/LogoProvider.tsx';
import { Eye, EyeOff } from 'lucide-react';
import SmartImage from '../../../core/components/SmartImage.tsx';

export default function LoginPage() {
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { logoUrl } = useLogo();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useLoginForm();

  const handleLogin = async (data: any) => {
    setError('');
    setIsSubmitting(true);

    try {
      const response = await login({
        correo: data.correo,
        contrasena: data.contrasena,
      });

      const sessionData = {
        nombre: response.personal.nombre,
        apellido: response.personal.apellido,
        entidad: response.personal.entidad,
      };
      localStorage.setItem('dosimetria_session', JSON.stringify(sessionData));
      navigate('/inicio');
    } catch (err: any) {
      console.error('Error en login:', err);
      setError(err.message || 'Error al conectar con el servidor');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background-secondary">
      <div className="w-full max-w-md p-6">
        <div className="bg-background rounded-xl p-8">
          <div className="text-center mb-8">
            {logoUrl && (
              <SmartImage
                src={logoUrl}
                alt="Logo"
                className="h-20 w-20 mx-auto mb-4 flex items-center justify-center rounded-lg p-2"
                imgClassName="h-full w-full object-contain"
              />
            )}
            <h1 className="text-2xl font-bold text-foreground mb-2">Portal de Dosimetría</h1>
            <p className="text-foreground-secondary">Inicia sesión para continuar</p>
          </div>

          <form onSubmit={handleSubmit(handleLogin)} className="space-y-4">
            <div>
              <label className="block font-medium text-foreground-secondary mb-2">Correo</label>
              <input
                type="email"
                {...register('correo')}
                placeholder="correo@ejemplo.cl"
                className="w-full px-4 py-3 border border-border bg-background text-foreground rounded-lg focus:ring-2 focus:ring-focus-ring focus:border-transparent outline-none"
              />
              {errors.correo && (
                <p className="text-danger text-sm mt-1">{errors.correo.message as string}</p>
              )}
            </div>
            <div>
              <label className="block font-medium text-foreground-secondary mb-2">Contraseña</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('contrasena')}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-10 border border-border bg-background text-foreground rounded-lg focus:ring-2 focus:ring-focus-ring focus:border-transparent outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-foreground-secondary hover:text-foreground cursor-pointer p-1"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.contrasena && (
                <p className="text-danger text-sm mt-1">{errors.contrasena.message as string}</p>
              )}
            </div>

            {error && (
              <div className="p-3 bg-danger/10 border border-danger rounded-lg">
                <p className="text-danger text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-primary text-white dark:text-foreground font-medium rounded-lg hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              {isSubmitting ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
