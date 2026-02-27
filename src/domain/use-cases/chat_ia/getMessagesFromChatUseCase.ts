import type { ChatIARepository } from "../../init.js";

export interface GetMessagesFromChatUseCaseInterface {
  execute(idChat: string, idUsuario: string): Promise<object>;  //RETORNA LOS títulos de los chats
}

export class GetMessagesFromChatUseCase implements GetMessagesFromChatUseCaseInterface {
  constructor(
    private readonly repository: ChatIARepository
  ){}

  async execute(idChat: string, idUsuario: string): Promise<object> {
    const chat = await this.repository.getMessagesFromChat(idChat, idUsuario);
    return chat.toJson();
  }
}
