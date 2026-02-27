import type { ChatChatIA, MensajeChatIA } from "../entities/init.js";

export abstract class ChatIARepository {
  abstract createNewChat(idUsuario: string, title: string): Promise<string>;
  abstract getChatsByUser(idUsuario: string): Promise<ChatChatIA[]>; 
  abstract getMessagesFromChat(idChat: string, idUsuario: string): Promise<ChatChatIA>;
  abstract sendMessageToChat(idChat: string, idUsuario: string, mensaje: MensajeChatIA): Promise<void>;
  abstract deleteChat(idChat: string, idUsuario: string): Promise<void>;
}