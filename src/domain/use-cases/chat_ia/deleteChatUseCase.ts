import type { ChatIARepository } from "../../init.js";

export interface DeleteChatUseCaseInterface {
  execute(idChat: string, idUsuario: string): Promise<void>;  //RETORNA LOS títulos de los chats
}

export class DeleteChatUseCase implements DeleteChatUseCaseInterface {
  constructor(
    private readonly repository: ChatIARepository
  ){}

  execute(idChat: string, idUsuario: string): Promise<void> {
    return this.repository.deleteChat(idChat, idUsuario);
  }
}
