import * as z from "zod";
import { fromZodError } from 'zod-validation-error';

const multerFileSchema = z.object({
  fieldname: z.string(),
  originalname: z.string(),
  encoding: z.string(),
  mimetype: z.string(),
  size: z.number(),
  destination: z.string().optional(),
  filename: z.string().optional(),
  path: z.string().optional(),
  stream: z.any().optional(),
  buffer: z.any().optional(),
});

const promptChatSchema = z.object({
  prompt: z.string().min(1, "El mensaje no puede estar vacío"),
  idUsuario: z.uuid("El id de usuario debe ser un uuid"),
  chatId: z.uuid("El id del chat debe ser un uuid"),
  files: z.array(multerFileSchema).optional(),
}, "El mensaje debe ser un objeto");

interface promptChatBody {
  prompt: string;
  idUsuario: string;
  chatId: string;
  files: Express.Multer.File[]
}

export const isValidEsquemaPromptChat = (body: {[key: string]: any}): promptChatBody | string => {
  const result = promptChatSchema.safeParse(body);

  if (!result.success) {
    const validationError = fromZodError(result.error);
    return validationError.toString();
  }

  return {
    prompt: body.prompt,
    idUsuario: body.idUsuario,
    chatId: body.chatId,
    files: body.files,
  };
  
}