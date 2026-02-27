import type { FilesRepositoryService, GeminiService } from "../../../presentation/services/init.js";
import type { PromptChatDTO } from "../../../presentation/validators/ini.js";
import { ArchivoChatIA, ChatChatIA, ChatIARepository, MensajeChatIA } from "../../init.js";
import type { Content, GenerateContentResponse } from "@google/genai";


export class SendMessageToChatUseCase {
  constructor(
    private readonly chatIArepository: ChatIARepository,
    private readonly filesRepositoryService: FilesRepositoryService,
    private readonly geminiService: GeminiService
  ){}

  async createUserMessage(promptChatDTO: PromptChatDTO): Promise<MensajeChatIA> {
    const prompt = promptChatDTO.prompt;
    const files = promptChatDTO.files;

    const imagesPublic = await this.filesRepositoryService.uploadImages(files);
    
    const imagesPublicUrl: string[] = imagesPublic.map((image) => image.secure_url);
    const imagesFileData = await this.uploadImagesToGemini(files, imagesPublicUrl);

    
    
    return new MensajeChatIA({
      text: prompt,
      role: "user",
      archivos: imagesFileData,
      createdAt: new Date()
    });
    
  }

  async createGeminiMessage(text: string): Promise<MensajeChatIA> {
    return new MensajeChatIA({
      text: text,
      role: "model",
      archivos: [],
      createdAt: new Date()
    });
  }

  async saveMessage(idChat: string, idUsuario: string, mensaje: MensajeChatIA): Promise<void> {
    return await this.chatIArepository.sendMessageToChat(idChat, idUsuario, mensaje);
  }


  async streamResponse(idChat: string, idUsuario: string, mensajeChatIA: MensajeChatIA,): Promise<AsyncGenerator<GenerateContentResponse, any, any>> {
    const history = await this.getChatHistory(idChat, idUsuario);
    return this.geminiService.chatPromptUseCase(mensajeChatIA.text, mensajeChatIA.archivos, history)
  }

  private async getChatHistory(idChat: string, idUsuario: string): Promise<Content[]> {
    const messagesEntity: ChatChatIA = await this.chatIArepository.getMessagesFromChat(idChat, idUsuario);
    const results: Content[] = []
    messagesEntity.mensajes.forEach((message) => {
      const newMessage: Content = {
        role: message.role,
        parts: [
          {text: message.text},
          ...message.archivos.map((archivo) => {
            return {
              fileData: {
                fileUri: archivo.fileUri,
                mimeType: archivo.mimeType,
                fileUrl: archivo.fileUrl
              }
            };
          })
        ]
      }
      results.push(newMessage);
    });
    return results.reverse();
  }

  private async uploadImagesToGemini(files: Express.Multer.File[], publicUrls: string[]) {
    if(files.length === 0) return [];
    const uploadedFiles = await this.geminiService.uploadFiles(files);
    const result: ArchivoChatIA[] = [];

    uploadedFiles.forEach((file, index) => {
      const newFile = new ArchivoChatIA({
        fileUri: file.uri ?? "",
        mimeType: file.mimeType ?? "",
        fileUrl: publicUrls[index]  
      })
      result.push(newFile);
    });

    return result
  }
}
