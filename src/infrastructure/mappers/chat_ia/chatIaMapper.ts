import { 
  ArchivoChatIA,
  MensajeChatIA,
  ChatChatIA,
  type archivoChatIaOptions,
  type mensajeChatIAOptions,
  type chatChatIAOptions,
} from "../../../domain/init.js";
import type { 
  ArchivoIaDB, 
  ChatIaDB, 
  MensajeIaDB, 
} from "../../models/init.js";

export class ChatIaMapper {

  static ArchivoFromDBtoEntity(registro: ArchivoIaDB): ArchivoChatIA {
    const options: archivoChatIaOptions = {
      fileUri: registro.fileUri,
      mimeType: registro.mimeType,
      fileUrl: registro.fileUrl,
    };
    return new ArchivoChatIA(options);
  }

  static MensajeFromDBtoEntity(registro: MensajeIaDB): MensajeChatIA {
    const options: mensajeChatIAOptions = {
      id: registro.id,
      text: registro.text,
      role: registro.role.description,
      createdAt: registro.createdAt,
      archivos: registro.archivos.map(archivo => ChatIaMapper.ArchivoFromDBtoEntity(archivo))
    };
    return new MensajeChatIA(options);
  }

  static ChatFromDBtoEntity(registro: ChatIaDB): ChatChatIA {
    const options: chatChatIAOptions = {
      id: registro.id,
      idUsuario: registro.idUsuario,
      title: registro.title,
      mensajes: registro.mensajes.map(mensaje => ChatIaMapper.MensajeFromDBtoEntity(mensaje))
    };
    return new ChatChatIA(options);
  }




}