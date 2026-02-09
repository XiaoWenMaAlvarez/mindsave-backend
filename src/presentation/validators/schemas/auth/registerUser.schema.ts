import * as z from "zod";
import { fromZodError } from 'zod-validation-error';

const registerUserSchema = z.object({
  email: z.email({ message: "El correo no es válido" }).trim(),
  name: z.string().min(2, { message: "El nombre no puede tener menos de 2 caracteres" }).trim(),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
}, "El usuario debe ser un objeto" );

export const isValidEsquemaRegisterUser = (body: {[key: string]: any}): boolean | string => {
  const result = registerUserSchema.safeParse(body);

  if (!result.success) {
    const validationError = fromZodError(result.error);
    return validationError.toString();
  }

  return true;
  
}