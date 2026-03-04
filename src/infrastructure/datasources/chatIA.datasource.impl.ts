import { ChatIADatasource } from '../../domain/datasources/init.js';
import { ChatChatIA, CustomError, MensajeChatIA } from '../../domain/init.js';
import { prisma } from "../../data/index.js";
import { TipoChatRol } from '../../generated/prisma/enums.js';
import { ChatIaMapper } from '../mappers/init.js';
import type { RoleIaDB, UserDB } from '../models/init.js';

export class ChatIADatasourceImpl implements ChatIADatasource {

  async createNewChat(idUsuario: string, title: string): Promise<string> {
    const user = await this.getUserById(idUsuario);

    const chat = await prisma.chat.findFirst({
      where: { 
        title: title,
        idUsuario: idUsuario
      }
    });
    if(chat) throw CustomError.badRequest("Chat already exists");

    const newChat = await prisma.chat.create({
      data: {
        title: title,
        user: {
          connect: { id: user.id }
        },
        mensajes: {
          create: []
        }
      }
    });
    return newChat.id;
  }


  async getChatsByUser(idUsuario: string): Promise<ChatChatIA[]> {
    const user = await this.getUserById(idUsuario);

    const chats = await prisma.chat.findMany({
      where: { 
        idUsuario: user.id
      },
      include: {
        mensajes: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1,
          include: {
            archivos: true,
            role: true
          }
        }
      }
    });

    const result: ChatChatIA[] = chats.map(chat => ChatIaMapper.ChatFromDBtoEntity(chat));
    return result;
  }


  async getMessagesFromChat(idChat: string, idUsuario: string): Promise<ChatChatIA> {
    const user = await this.getUserById(idUsuario);

    const chat = await prisma.chat.findFirst({
      where: { 
        idUsuario: user.id,
        id: idChat
      },
      include: {
        mensajes: {
          orderBy: {
            createdAt: 'desc'
          },
          include: {
            archivos: true,
            role: true
          }
        }
      }
    });

    if(chat == null) throw CustomError.badRequest("Chat not found");

    const result = ChatIaMapper.ChatFromDBtoEntity(chat);
    return result;
  }


  async sendMessageToChat(idChat: string, idUsuario: string, mensaje: MensajeChatIA): Promise<void> {
    const user = await this.getUserById(idUsuario);

    const chat = await prisma.chat.findFirst({
      where: { 
        idUsuario: user.id,
        id: idChat
      }
    });
    if(chat == null) throw CustomError.badRequest("Chat not found");

    const role = await this.getMessageRole(mensaje.role);

    await prisma.chat.update({
      where: { id: chat.id },
      data: {
        mensajes: {
          create: {
            text: mensaje.text,
            createdAt: mensaje.createdAt,
            role: { connect: { id: role.id } },
            archivos: mensaje.archivos.length > 0 ? {
              create: mensaje.archivos.map(archivo => ({
                fileUri: archivo.fileUri,
                mimeType: archivo.mimeType,
                fileUrl: archivo.fileUrl
              }))
            } : {}
          }
        }
      }
    });
  }

  async deleteChat(idChat: string, idUsuario: string): Promise<void> {
    const user = await this.getUserById(idUsuario);
    await prisma.chat.deleteMany({
      where: { 
        idUsuario: user.id,
        id: idChat
      }
    });
  }

  private async getMessageRole(roleDescription: string): Promise<RoleIaDB> {
    let tipoRole: TipoChatRol;
    if(roleDescription === "model") {
      tipoRole = TipoChatRol.model
    } else if (roleDescription === "user"){
      tipoRole = TipoChatRol.user
    } else {
      throw CustomError.badRequest("Role not found");
    }

    const role = await prisma.chatRole.findUnique({
      where: {
        description: tipoRole
      }
    });
    if(role == null) throw CustomError.badRequest("Role not found");
    return role;
  }
  
  private async getUserById(idUsuario: string): Promise<UserDB>  {
    const user = await prisma.user.findUnique({
      where: {id: idUsuario}
    });
    if(user == null) throw CustomError.badRequest("User not found");
    return user;
  }
  
}