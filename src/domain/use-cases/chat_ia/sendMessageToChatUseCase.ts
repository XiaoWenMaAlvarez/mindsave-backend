import type { FilesRepositoryService, GeminiService } from "../../../config/init.js";
import type { PromptChatDTO } from "../../../presentation/validators/ini.js";
import { ArchivoChatIA, ChatChatIA, ChatIARepository, CustomError, MensajeChatIA } from "../../init.js";
import type { Content, GenerateContentResponse } from "@google/genai";

interface AuthorizedUserMessage {
  userMessage: MensajeChatIA;
  history: Content[];
}

interface CloudinaryUploadReference {
  public_id: string;
  resource_type: string;
  secure_url: string;
}

export class SendMessageToChatUseCase {
  public static readonly DEFAULT_MAX_HISTORY_MESSAGES = 20;

  constructor(
    private readonly chatIArepository: ChatIARepository,
    private readonly filesRepositoryService: FilesRepositoryService,
    private readonly geminiService: GeminiService,
    private readonly maxHistoryMessages: number = SendMessageToChatUseCase.DEFAULT_MAX_HISTORY_MESSAGES
  ){}

  async prepareAuthorizedUserMessage(promptChatDTO: PromptChatDTO): Promise<AuthorizedUserMessage> {
    const history = await this.getChatHistory(promptChatDTO.chatId, promptChatDTO.idUsuario);
    const userMessage = await this.createUserMessage(promptChatDTO);

    return { userMessage, history };
  }

  private async createUserMessage(promptChatDTO: PromptChatDTO): Promise<MensajeChatIA> {
    const prompt = promptChatDTO.prompt;
    const files = promptChatDTO.files;
    let imagesPublic: CloudinaryUploadReference[] = [];

    try {
      imagesPublic = await this.filesRepositoryService.uploadImages(files);
      const imagesFileData = await this.uploadImagesToGemini(files, imagesPublic);

      return new MensajeChatIA({
        text: prompt,
        role: "user",
        archivos: imagesFileData,
        createdAt: new Date()
      });
    } catch {
      await Promise.allSettled(
        imagesPublic.map(file => this.filesRepositoryService.deleteFile({
          fileUrl: file.secure_url,
          publicId: file.public_id,
          resourceType: file.resource_type,
        }))
      );
      throw CustomError.badGateway("No fue posible subir todos los archivos adjuntos");
    }
    
  }

  async createGeminiMessage(text: string): Promise<MensajeChatIA> {
    return new MensajeChatIA({
      text: text,
      role: "model",
      archivos: [],
      createdAt: new Date()
    });
  }

  async saveMessages(idChat: string, idUsuario: string, mensajes: readonly MensajeChatIA[]): Promise<void> {
    return await this.chatIArepository.sendMessagesToChat(idChat, idUsuario, mensajes);
  }


  async streamResponse(mensajeChatIA: MensajeChatIA, history: Content[]): Promise<AsyncGenerator<GenerateContentResponse, any, any>> {
    return this.geminiService.chatPromptUseCase(mensajeChatIA.text, mensajeChatIA.archivos, history)
  }

  private async getChatHistory(idChat: string, idUsuario: string): Promise<Content[]> {
    const messagesEntity: ChatChatIA = await this.chatIArepository.getMessagesFromChat(
      idChat,
      idUsuario,
      this.maxHistoryMessages
    );
    const recentMessages = messagesEntity.mensajes.slice(0, this.maxHistoryMessages);
    const results: Content[] = []
    recentMessages.forEach((message) => {
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

  private async uploadImagesToGemini(files: Express.Multer.File[], cloudinaryFiles: readonly CloudinaryUploadReference[]) {
    if(files.length === 0) return [];
    const uploadedFiles = await this.geminiService.uploadFiles(files);
    const result: ArchivoChatIA[] = [];

    uploadedFiles.forEach((file, index) => {
      const cloudinaryFile = cloudinaryFiles[index];
      const newFile = new ArchivoChatIA({
        fileUri: file.uri ?? "",
        mimeType: file.mimeType ?? "",
        fileUrl: cloudinaryFile?.secure_url,
        cloudinaryPublicId: cloudinaryFile?.public_id,
        cloudinaryResourceType: cloudinaryFile?.resource_type,
        geminiFileName: file.name,
      })
      result.push(newFile);
    });

    return result
  }
}
