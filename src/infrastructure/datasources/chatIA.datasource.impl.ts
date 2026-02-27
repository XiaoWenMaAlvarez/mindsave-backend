import { ChatIADatasource } from '../../domain/datasources/init.js';
import { ArchivoChatIA, ChatChatIA, CustomError, MensajeChatIA } from '../../domain/init.js';
import { prisma } from "../../data/index.js";
import { TipoChatRol } from '../../generated/prisma/enums.js';


//TODO: IMPLEMENTAR
export class ChatIADatasourceImpl implements ChatIADatasource {

  async createNewChat(idUsuario: string, title: string): Promise<string> {
    const user = await prisma.user.findUnique({
      where: {id: idUsuario}
    });
    if(user == null) throw CustomError.badRequest("User not found");

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
    const user = await prisma.user.findUnique({
      where: {id: idUsuario}
    });
    if(user == null) throw CustomError.badRequest("User not found");

    const chats = await prisma.chat.findMany({
      where: { 
        idUsuario: idUsuario
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

    const result: ChatChatIA[] = chats.map(chat => {
      const mensajes : MensajeChatIA[] = []
      if(chat.mensajes.length > 0) {
        const lastMessage = chat.mensajes[chat.mensajes.length - 1];
        const text = lastMessage?.text ?? "";
        const role = lastMessage?.role.description ?? "";
        const createdAt = lastMessage?.createdAt ?? new Date();
        const archivos: ArchivoChatIA[] = [];
        const newMessage = new MensajeChatIA({text, role, createdAt, archivos});
        mensajes.push(newMessage);
      }

      return new ChatChatIA({
        id: chat.id,
        idUsuario: chat.idUsuario,
        title: chat.title,
        mensajes: mensajes
      })
    });
    return result;
  }


  async getMessagesFromChat(idChat: string, idUsuario: string): Promise<ChatChatIA> {
    const user = await prisma.user.findUnique({
      where: {id: idUsuario}
    });
    if(user == null) throw CustomError.badRequest("User not found");

    const chat = await prisma.chat.findFirst({
      where: { 
        idUsuario: idUsuario,
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


    const result = new ChatChatIA({
      id: chat.id,
      idUsuario: chat.idUsuario,
      title: chat.title,
      mensajes: chat.mensajes.map(mensaje => new MensajeChatIA({
        text: mensaje.text,
        role: mensaje.role.description,
        createdAt: mensaje.createdAt,
        archivos: mensaje.archivos.map(archivo => new ArchivoChatIA({
          fileUri: archivo.fileUri,
          mimeType: archivo.mimeType,
          fileUrl: archivo.fileUrl
        }))
      }))
    });

    return result;
  }


  async sendMessageToChat(idChat: string, idUsuario: string, mensaje: MensajeChatIA): Promise<void> {
    const user = await prisma.user.findUnique({
      where: {id: idUsuario}
    });
    if(user == null) throw CustomError.badRequest("User not found");

    const chat = await prisma.chat.findFirst({
      where: { 
        idUsuario: idUsuario,
        id: idChat
      }
    });
    if(chat == null) throw CustomError.badRequest("Chat not found");

    let tipoRole: TipoChatRol = TipoChatRol.system;

    if(mensaje.role === "model") {
      tipoRole = TipoChatRol.model
    } else if (mensaje.role === "user"){
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

    await prisma.chat.update({
      where: { id: chat.id },
      data: {
        mensajes: {
          create: {
            text: mensaje.text,
            createdAt: mensaje.createdAt,
            role: {
              connect: { id: role.id }
            },
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

    return;
  }
  


  async deleteChat(idChat: string, idUsuario: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: {id: idUsuario}
    });
    if(user == null) throw CustomError.badRequest("User not found");

    await prisma.chat.deleteMany({
      where: { 
        idUsuario: idUsuario,
        id: idChat
      }
    });

    return;
  }
  
}