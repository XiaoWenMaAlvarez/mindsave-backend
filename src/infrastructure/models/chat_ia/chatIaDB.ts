import type { TipoChatRol } from "../../../generated/prisma/enums.js";

export interface ArchivoIaDB {
  id: string;
  fileUri: string;
  mimeType: string;
  fileUrl: string;
  cloudinaryPublicId: string | null;
  cloudinaryResourceType: string | null;
  geminiFileName: string | null;
  mensajeId: string;
}

export interface RoleIaDB {
  id: number;
  description: TipoChatRol;
}

export interface MensajeIaDB {
  id: string;
  roleId: number;
  createdAt: Date;
  text: string;
  chatId: string;
  archivos: ArchivoIaDB[];
  role: RoleIaDB;
}

export interface ChatIaDB {
  id: string;
  idUsuario: string;
  title: string;
  mensajes: MensajeIaDB[];
}

export interface UserDB {
  id: string;
  createdAt: Date;
  roleId: number;
  name: string;
  email: string;
  emailVerified: boolean;
  password: string;
  isActive: boolean;
  updatedAt: Date;
  resetToken: string | null;
  resetTokenExpiration: Date | null;
}
