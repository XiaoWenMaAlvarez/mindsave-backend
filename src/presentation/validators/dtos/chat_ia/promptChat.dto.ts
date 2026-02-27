import { isValidEsquemaPromptChat } from "../../schemas/init.js";
import multer from "multer";

export class PromptChatDTO {
  constructor(
    public readonly prompt: string,
    public readonly files: Express.Multer.File[],
    public readonly chatId: string,
    public readonly idUsuario: string,
  ){}

  static create(body: {[key: string]: any}): [string | null, PromptChatDTO | null] {
    const result = isValidEsquemaPromptChat(body);
    if(typeof result === "string") return [result, null];
    return [null, new PromptChatDTO(result.prompt, result.files, result.chatId, result.idUsuario)];
  }

}

