import { z } from 'zod';
import { isValidChileanRut } from '../../../core/utils/format';

// Esquema para login (RUT y contraseña)
export const loginSchema = z.object({
  rut: z
    .string()
    .min(1, 'El RUT es requerido')
    .refine((val) => isValidChileanRut(val), 'RUT inválido'),
  contrasena: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

// Tipo TypeScript inferido
export type Login = z.infer<typeof loginSchema>;
