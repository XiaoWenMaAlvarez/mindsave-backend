import type { FilesRepositoryService, GeminiService } from "../../../config/init.js";
import { CustomError, type ChatIARepository } from "../../init.js";

export interface DeleteChatUseCaseInterface {
  execute(idChat: string, idUsuario: string): Promise<void>;  //RETORNA LOS títulos de los chats
}

export class DeleteChatUseCase implements DeleteChatUseCaseInterface {
  constructor(
    private readonly repository: ChatIARepository,
    private readonly filesRepositoryService: FilesRepositoryService,
    private readonly geminiService: GeminiService,
  ){}

  async execute(idChat: string, idUsuario: string): Promise<void> {
    const files = await this.repository.getFilesForChatDeletion(idChat, idUsuario);
    if(files === null) {
      throw CustomError.notFound("Chat no encontrado");
    }

    const deletionResults = await Promise.allSettled(
      files.flatMap((file) => [
        this.filesRepositoryService.deleteFile({
          fileUrl: file.fileUrl,
          publicId: file.cloudinaryPublicId,
          resourceType: file.cloudinaryResourceType,
        }),
        this.geminiService.deleteFile({
          fileName: file.geminiFileName,
          fileUri: file.fileUri,
        }),
      ]),
    );

    if(deletionResults.some(result => result.status === "rejected")) {
      throw CustomError.internalServerError("No fue posible eliminar todos los archivos remotos del chat");
    }

    await this.repository.deleteChat(idChat, idUsuario);
  }
}
