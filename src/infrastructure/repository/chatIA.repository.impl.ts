import type { ChatChatIA, MensajeChatIA } from '../../domain/init.js';
import type { ChatIARepository } from '../../domain/repository/init.js';
import { ChatIADatasource } from '../../domain/datasources/init.js';

export class ChatIARepositoryImpl implements ChatIARepository {

  constructor(
    private readonly chatIADatasource: ChatIADatasource
  ){}

  createNewChat(idUsuario: string, title: string): Promise<string> {
    return this.chatIADatasource.createNewChat(idUsuario, title);
  }
  getChatsByUser(idUsuario: string): Promise<ChatChatIA[]> {
    return this.chatIADatasource.getChatsByUser(idUsuario);
  }
  getMessagesFromChat(idChat: string, idUsuario: string, limit?: number): Promise<ChatChatIA> {
    return this.chatIADatasource.getMessagesFromChat(idChat, idUsuario, limit);
  }
  sendMessageToChat(idChat: string, idUsuario: string, mensaje: MensajeChatIA): Promise<void> {
    return this.chatIADatasource.sendMessageToChat(idChat, idUsuario, mensaje);
  }
  deleteChat(idChat: string, idUsuario: string): Promise<void> {
    return this.chatIADatasource.deleteChat(idChat, idUsuario);
  }


}