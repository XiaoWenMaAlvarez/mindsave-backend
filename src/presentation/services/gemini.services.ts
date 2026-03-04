import { createPartFromUri, GoogleGenAI, type Content } from "@google/genai";
import type { ArchivoChatIA } from "../../domain/init.js";
import { Logger } from "../../plugins/logger.plugin.js";
import { systemInstruction } from "./system_instruction.js";


const fileMimeTypesByExtension: Record<string, string> = {
  jpg: 'image/jpg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  svg: 'image/svg+xml',
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  webp: 'image/webp',
};

export interface GeminiServiceOptions {
  model?: string;
}

export class GeminiService {

  private ai = new GoogleGenAI({});
  private model: string;

  constructor(options: GeminiServiceOptions = {}){
    this.model = options.model ?? "gemini-3-flash-preview";
  }

  // TAMBIÉN ACEPTA PDFs, csv, texto plano, markdown, html, json
  async uploadFiles(files: Express.Multer.File[]) {
    try {
      const uploadedFiles = await Promise.all(
        files.map((file) => {
          const fileExtension = file.originalname.split('.').pop() ?? '';
          const fileMimeType: string = fileMimeTypesByExtension[fileExtension] ?? '';

          const type = file.mimetype.includes('application/octet-stream') ? fileMimeType : file.mimetype;

          return this.ai.files.upload({
            file: file.path,
            config: { mimeType: type },
          });
        }),
      );
      return uploadedFiles;
    } catch(e) {
      Logger.error(`Gemini Upload Error: ${e}`);
      return [];
    }
  }


  async chatPromptUseCase(prompt: string, files: ArchivoChatIA[], history: Content[]) {
    try {
      const chat = this.ai.chats.create({
        model: this.model,
        config: {
          systemInstruction: systemInstruction,
        },
        history: history,
      });

      return chat.sendMessageStream({
        message: [
          prompt,
          ...files.map((file) =>
            createPartFromUri(file.fileUri ?? "", file.mimeType ?? "")
          ),
        ]
      });
    } catch(e) {
      Logger.error(`Gemini Chat Error: ${e}`);
      throw e;
    }
  }

}
