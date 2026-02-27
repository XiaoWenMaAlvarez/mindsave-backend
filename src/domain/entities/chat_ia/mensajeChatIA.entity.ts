import type { ArchivoChatIA } from "./archivoChatIA.entity.js";


export interface mensajeChatIAOptions {
  text: string;
  createdAt: Date;
  role: string;
  archivos: ArchivoChatIA[];
}

export class MensajeChatIA {

  public text: string;
  public createdAt: Date;
  public role: string;
  public archivos: ArchivoChatIA[];

  
  constructor(options: mensajeChatIAOptions) {
    const {text, role, createdAt = new Date(), archivos = []} = options;
    this.text = text;
    this.createdAt = createdAt;
    this.archivos = archivos;
    this.role = role;
  }
  

  static fromJson(object: {[key: string]: any}): MensajeChatIA {
    const {text, role, createdAt = new Date(), archivos = []} = object;
    const options: mensajeChatIAOptions = {
      text: text,
      role: role,
      createdAt: createdAt,
      archivos: archivos
    };
    
    return new MensajeChatIA(options);
  }

  toJson() {
    return {
      text: this.text,
      role: this.role,
      createdAt: this.createdAt,
      archivos: this.archivos.map(archivo => archivo.toJson())
    }
  }
}