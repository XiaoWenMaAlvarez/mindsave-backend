import type { MensajeChatIA } from "./mensajeChatIA.entity.js";


export interface chatChatIAOptions {
  id?: string;
  idUsuario: string;
  mensajes: MensajeChatIA[];
  title: string;
}

export class ChatChatIA {

  public id?: string;
  public idUsuario: string;
  public mensajes: MensajeChatIA[];
  public title: string;
  
  constructor(options: chatChatIAOptions) {
    const {id, idUsuario, title, mensajes = []} = options;
    this.idUsuario = idUsuario;
    this.mensajes = mensajes;
    this.title = title;
    if(id) this.id = id;
  }
  

  static fromJson(object: {[key: string]: any}): ChatChatIA {
    const {id, idUsuario, title, mensajes = []} = object;
    const options: chatChatIAOptions = {
      idUsuario: idUsuario,
      mensajes: mensajes,
      title: title
    };
    if(id) options.id = id;
    
    return new ChatChatIA(options);
  }

  toJson() {
    return {
      id: this.id,
      idUsuario: this.idUsuario,
      title: this.title,
      mensajes: this.mensajes.map(mensaje => mensaje.toJson())
    }
  }
}