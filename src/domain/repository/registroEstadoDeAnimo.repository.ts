import type { RegistroEstadoAnimo } from "../entities/init.js";

export abstract class RegistroEstadoAnimoRepository {
  abstract saveRegistroEstadoDeAnimo(registro: RegistroEstadoAnimo): Promise<string>;
  abstract getRegistroEstadoDeAnimoPendientes(userId: string, page?: number, limit?: number): Promise<RegistroEstadoAnimo[]>;
  abstract getRegistroEstadoDeAnimoCompletos(userId: string, page?: number, limit?: number): Promise<RegistroEstadoAnimo[]>;
  abstract editarRegistroEstadoDeAnimo(registro: RegistroEstadoAnimo): Promise<void>;
  abstract eliminarRegistroEstadoDeAnimo(idRegistro: string, userId: string): Promise<void>;
  abstract getRegistroEstadoDeAnimoById(userId: string, idRegistro: string): Promise<RegistroEstadoAnimo | null>;
}