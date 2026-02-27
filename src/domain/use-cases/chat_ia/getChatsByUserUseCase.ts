import type { ChatChatIA, ChatIARepository } from "../../init.js";

export interface GetChatsByUserUseCaseInterface {
  execute(idUsuario: string): Promise<ChatChatIA[]>;  //RETORNA LOS títulos de los chats
}

export class GetChatsByUserUseCase implements GetChatsByUserUseCaseInterface {
  constructor(
    private readonly repository: ChatIARepository
  ){}

  execute(idUsuario: string): Promise<ChatChatIA[]> {
    return this.repository.getChatsByUser(idUsuario);
  }
}
