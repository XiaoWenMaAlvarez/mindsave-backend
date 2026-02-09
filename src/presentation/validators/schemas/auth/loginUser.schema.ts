import * as z from "zod";
import { fromZodError } from 'zod-validation-error';

const loginUserSchema = z.object({
  email: z.email({ message: "El correo no es válido" }).trim(),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
}, "El usuario debe ser un objeto" );

export const isValidEsquemaLoginUser = (body: {[key: string]: any}): boolean | string => {
  const result = loginUserSchema.safeParse(body);

  if (!result.success) {
    const validationError = fromZodError(result.error);
    return validationError.toString();
  }

  return true;
  
}