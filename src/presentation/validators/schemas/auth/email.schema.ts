import * as z from "zod";
import { fromZodError } from 'zod-validation-error';

const emailSchema = z.email({ message: "El correo no es válido" }).trim();

export const isValidEmail = (text: string): boolean | string => {
  const result = emailSchema.safeParse(text);
  if (!result.success) {
    const validationError = fromZodError(result.error);
    return validationError.toString();
  }
  return true;
}