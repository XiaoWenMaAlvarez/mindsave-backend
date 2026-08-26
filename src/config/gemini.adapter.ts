import { createPartFromUri, GoogleGenAI, type Content } from "@google/genai";
import type { ArchivoChatIA } from "../domain/init.js";
import { Logger } from "./logger.plugin.js";
import { systemInstruction } from "./system_instruction.js";
import { withTimeout } from "./timeout.helper.js";


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
  checkHealthTimeoutMs?: number;
  uploadTimeoutMs?: number;
  deleteTimeoutMs?: number;
}

export interface GeminiFileReference {
  fileName: string;
  fileUri: string;
}

export class GeminiService {

  private ai = new GoogleGenAI({});
  private model: string;
  private checkHealthTimeoutMs: number;
  private uploadTimeoutMs: number;
  private deleteTimeoutMs: number;

  constructor(options: GeminiServiceOptions = {}){
    this.model = options.model ?? "gemini-3-flash-preview";
    this.checkHealthTimeoutMs = options.checkHealthTimeoutMs ?? 5_000;
    this.uploadTimeoutMs = options.uploadTimeoutMs ?? 30_000;
    this.deleteTimeoutMs = options.deleteTimeoutMs ?? 10_000;
  }

  async checkHealth(): Promise<boolean> {
    try {
      await withTimeout(
        this.ai.models.get({ model: this.model }),
        this.checkHealthTimeoutMs,
        "Gemini Health Check"
      );
      return true;
    } catch(e) {
      Logger.error(`Gemini Health Error: ${e}`);
      return false;
    }
  }

  // TAMBIÉN ACEPTA PDFs, csv, texto plano, markdown, html, json
  async uploadFiles(files: Express.Multer.File[]) {
    try {
      const uploadedFiles = await withTimeout(
        Promise.all(
          files.map((file) => {
            const fileExtension = file.originalname.split('.').pop() ?? '';
            const fileMimeType: string = fileMimeTypesByExtension[fileExtension] ?? '';

            const type = file.mimetype.includes('application/octet-stream') ? fileMimeType : file.mimetype;

            return this.ai.files.upload({
              file: file.path,
              config: { mimeType: type },
            });
          }),
        ),
        this.uploadTimeoutMs,
        "Gemini Upload Files"
      );
      return uploadedFiles;
    } catch(e) {
      Logger.error(`Gemini Upload Error: ${e}`);
      return [];
    }
  }

  async deleteFile(reference: GeminiFileReference): Promise<void> {
    if(!reference.fileName && !reference.fileUri) return;

    try {
      await withTimeout(
        this.ai.files.delete({
          name: this.resolveFileName(reference),
        }),
        this.deleteTimeoutMs,
        "Gemini File Deletion"
      );
    } catch(error) {
      if(this.isNotFoundError(error)) return;
      Logger.error(`Gemini file deletion failed: ${error}`);
      throw error;
    }
  }

  private resolveFileName(reference: GeminiFileReference): string {
    const storedName = reference.fileName.trim();
    if(/^files\/[a-z0-9-]+$/.test(storedName)) return storedName;
    if(/^[a-z0-9-]+$/.test(storedName)) return `files/${storedName}`;

    const url = new URL(reference.fileUri);
    const segments = url.pathname.split('/').filter(Boolean);
    const filesIndex = segments.lastIndexOf("files");
    const fileId = segments[filesIndex + 1];
    if(filesIndex < 0 || !fileId || !/^[a-z0-9-]+$/.test(fileId)) {
      throw new Error("Invalid Gemini file URI");
    }
    return `files/${fileId}`;
  }

  private isNotFoundError(error: unknown): boolean {
    if(typeof error !== "object" || error === null) return false;
    const providerError = error as {
      status?: number;
      code?: number;
      response?: { status?: number };
    };
    return providerError.status === 404 ||
      providerError.code === 404 ||
      providerError.response?.status === 404;
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
