import * as z from "zod";
import { fromZodError } from 'zod-validation-error';

export const adminGetUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(999).default(10),
  query: z.string().trim().max(100).optional(),
  emailVerify: z.enum(["verify", "unverify", ""]).optional(),
  rol: z.enum(["USER_ROL", "PROFESIONAL_ROL", ""]).optional(),
  state: z.enum(["active", "inactive", ""]).optional(),
});

export const isValidEsquemaAdminGetUsersQuerySchema = (body: {[key: string]: any}): boolean | string => {
  const result = adminGetUsersQuerySchema.safeParse(body);

  if (!result.success) {
    const validationError = fromZodError(result.error);
    return validationError.toString();
  }

  return true;
  
}