import * as z from "zod";
import { fromZodError } from 'zod-validation-error';

const uuidSchema = z.uuid({ message: "El id no es válido" }).trim();

export const isValidUuid = (text: unknown): boolean | string => {
  const result = uuidSchema.safeParse(text);
  if (!result.success) {
    const validationError = fromZodError(result.error);
    return validationError.toString();
  }
  return true;
}