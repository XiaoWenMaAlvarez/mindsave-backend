import type { ChatChatIA, MensajeChatIA } from "../entities/init.js";

export abstract class ChatIADatasource {
  abstract createNewChat(idUsuario: string, title: string): Promise<string>;
  abstract getChatsByUser(idUsuario: string): Promise<ChatChatIA[]>;  //Retorna los títulos de los chats
  abstract getMessagesFromChat(idChat: string, idUsuario: string, limit?: number): Promise<ChatChatIA>;
  abstract sendMessagesToChat(idChat: string, idUsuario: string, mensajes: readonly MensajeChatIA[]): Promise<void>;
  abstract deleteChat(idChat: string, idUsuario: string): Promise<void>;
}
