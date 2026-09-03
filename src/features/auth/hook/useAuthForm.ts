import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type Login } from '../validators/auth';

// Hook para formulario de login
export function useLoginForm() {
  return useForm<Login>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      rut: '',
      contrasena: '',
    },
    mode: 'onSubmit',
  });
}
