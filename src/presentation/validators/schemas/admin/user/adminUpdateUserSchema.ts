import * as z from "zod";
import { fromZodError } from 'zod-validation-error';

const adminUpdateUserSchema = z.object({
  email: z.email({ message: "El correo no es válido" }).trim().optional(),
  name: z.string().min(2, { message: "El nombre no puede tener menos de 2 caracteres" }).trim().optional(),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres" }).optional(),
  emailVerified: z.boolean({ message: "El valor de emailVerified debe ser un booleano" }).optional(),
  role: z.enum(['USER_ROL', 'PROFESIONAL_ROL'], {
    message: "El valor debe ser obligatoriamente 'USER_ROL' o 'PROFESIONAL_ROL'",
  }).optional(),
  isActive: z.boolean({ message: "El valor de isActive debe ser un booleano" }).optional(),
}, "El usuario debe ser un objeto" );

export const isValidEsquemaAdminUpdateUser = (body: {[key: string]: any}): boolean | string => {
  const result = adminUpdateUserSchema.safeParse(body);

  if (!result.success) {
    const validationError = fromZodError(result.error);
    return validationError.toString();
  }

  return true;
}
