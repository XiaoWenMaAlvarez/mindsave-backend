import { ChatIADatasource } from '../../domain/datasources/init.js';
import { ArchivoChatIA, ChatChatIA, CustomError, MensajeChatIA } from '../../domain/init.js';
import { prisma } from "../../data/index.js";
import { TipoChatRol } from '../../generated/prisma/enums.js';
import { ChatIaMapper } from '../mappers/init.js';
import type { RoleIaDB, UserDB } from '../models/init.js';
import { Prisma } from '../../generated/prisma/client.js';

type ChatWriteClient = Pick<Prisma.TransactionClient, "chat" | "chatRole" | "user">;

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

    try {
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
    } catch(error) {
      if(error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw CustomError.badRequest("Chat already exists");
      }
      throw error;
    }
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


  async getMessagesFromChat(idChat: string, idUsuario: string, limit?: number): Promise<ChatChatIA> {
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
          ...(limit && limit > 0 ? { take: limit } : {}),
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


  async sendMessagesToChat(idChat: string, idUsuario: string, mensajes: readonly MensajeChatIA[]): Promise<void> {
    await prisma.$transaction(async (tx) => {
      const user = await this.getUserById(idUsuario, tx);

      const chat = await tx.chat.findFirst({
        where: {
          idUsuario: user.id,
          id: idChat
        }
      });
      if(chat == null) throw CustomError.badRequest("Chat not found");

      const messagesWithRoles: Array<{ mensaje: MensajeChatIA; role: RoleIaDB }> = [];
      for(const mensaje of mensajes) {
        messagesWithRoles.push({
          mensaje,
          role: await this.getMessageRole(mensaje.role, tx),
        });
      }

      await tx.chat.update({
        where: { id: chat.id },
        data: {
          mensajes: {
            create: messagesWithRoles.map(({ mensaje, role }) => ({
              text: mensaje.text,
              createdAt: mensaje.createdAt,
              role: { connect: { id: role.id } },
              archivos: mensaje.archivos.length > 0 ? {
                create: mensaje.archivos.map(archivo => ({
                  fileUri: archivo.fileUri,
                  mimeType: archivo.mimeType,
                  fileUrl: archivo.fileUrl,
                  cloudinaryPublicId: archivo.cloudinaryPublicId || null,
                  cloudinaryResourceType: archivo.cloudinaryResourceType || null,
                  geminiFileName: archivo.geminiFileName || null,
                }))
              } : {}
            }))
          }
        }
      });
    });
  }

  async getFilesForChatDeletion(idChat: string, idUsuario: string): Promise<ArchivoChatIA[] | null> {
    const user = await this.getUserById(idUsuario);
    const chat = await prisma.chat.findFirst({
      where: {
        id: idChat,
        idUsuario: user.id,
      },
      select: {
        mensajes: {
          select: {
            archivos: true,
          },
        },
      },
    });

    if(chat == null) return null;
    return chat.mensajes.flatMap((mensaje) =>
      mensaje.archivos.map((archivo) => ArchivoChatIA.fromJson(archivo))
    );
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

  private async getMessageRole(roleDescription: string, client: ChatWriteClient = prisma): Promise<RoleIaDB> {
    let tipoRole: TipoChatRol;
    if(roleDescription === "model") {
      tipoRole = TipoChatRol.model
    } else if (roleDescription === "user"){
      tipoRole = TipoChatRol.user
    } else {
      throw CustomError.badRequest("Role not found");
    }

    const role = await client.chatRole.findUnique({
      where: {
        description: tipoRole
      }
    });
    if(role == null) throw CustomError.badRequest("Role not found");
    return role;
  }
  
  private async getUserById(idUsuario: string, client: Pick<ChatWriteClient, "user"> = prisma): Promise<UserDB>  {
    const user = await client.user.findUnique({
      where: {id: idUsuario}
    });
    if(user == null) throw CustomError.badRequest("User not found");
    return user;
  }
  
}
