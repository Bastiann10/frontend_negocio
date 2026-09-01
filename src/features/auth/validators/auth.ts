import { z } from 'zod';

// Esquema para login (solo correo y contraseña)
export const loginSchema = z.object({
  correo: z
    .string()
    .min(1, 'El correo es requerido')
    .email('Correo electrónico inválido'),
  contrasena: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

// Tipo TypeScript inferido
export type Login = z.infer<typeof loginSchema>;
