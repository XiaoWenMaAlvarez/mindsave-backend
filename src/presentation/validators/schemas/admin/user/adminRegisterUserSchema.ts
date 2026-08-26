import * as z from "zod";
import { fromZodError } from 'zod-validation-error';

const adminRegisterUserSchema = z.object({
  email: z.email({ message: "El correo no es válido" }).trim(),
  name: z.string().min(2, { message: "El nombre no puede tener menos de 2 caracteres" }).trim(),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
  emailVerified: z.boolean({ message: "El valor de emailVerified debe ser un booleano" }),
  role: z.enum(['USER_ROL', 'PROFESIONAL_ROL'], {
    message: "El valor debe ser obligatoriamente 'USER_ROL' o 'PROFESIONAL_ROL'",
  }),
}, "El usuario debe ser un objeto" );

export const isValidEsquemaAdminRegisterUser = (body: {[key: string]: any}): boolean | string => {
  const result = adminRegisterUserSchema.safeParse(body);

  if (!result.success) {
    const validationError = fromZodError(result.error);
    return validationError.toString();
  }

  return true;
}