import * as z from "zod";
import { fromZodError } from 'zod-validation-error';

const resetPasswordSubmitSchema = z.object({
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
}, "La contraseña debe venir dentro de un objeto" );

export const isValidEsquemaResetPasswordSubmit = (body: {[key: string]: any}): boolean | string => {
  const result = resetPasswordSubmitSchema.safeParse(body);

  if (!result.success) {
    const validationError = fromZodError(result.error);
    return validationError.toString();
  }

  return true;
}
