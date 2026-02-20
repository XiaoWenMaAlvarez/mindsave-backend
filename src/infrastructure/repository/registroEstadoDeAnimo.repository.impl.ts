import type { RegistroEstadoAnimo } from '../../domain/init.js';
import type { RegistroEstadoAnimoRepository } from '../../domain/repository/init.js';
import { RegistroEstadoAnimoDatasource } from '../../domain/datasources/init.js';

export class RegistroEstadoAnimoRepositoryImpl implements RegistroEstadoAnimoRepository {

  constructor(
    private readonly registroEstadoAnimoDatasource: RegistroEstadoAnimoDatasource
  ){}
  saveRegistroEstadoDeAnimo(registro: RegistroEstadoAnimo): Promise<string> {
    return this.registroEstadoAnimoDatasource.saveRegistroEstadoDeAnimo(registro);
  }
  getRegistroEstadoDeAnimoCompletos(userId: string, page?: number, limit?: number): Promise<RegistroEstadoAnimo[]> {
    return this.registroEstadoAnimoDatasource.getRegistroEstadoDeAnimoCompletos(userId, page, limit);
  }
  getRegistroEstadoDeAnimoPendientes(userId: string, page?: number, limit?: number): Promise<RegistroEstadoAnimo[]> {
    return this.registroEstadoAnimoDatasource.getRegistroEstadoDeAnimoPendientes(userId, page, limit);
  }
  editarRegistroEstadoDeAnimo(registro: RegistroEstadoAnimo): Promise<void> {
    return this.registroEstadoAnimoDatasource.editarRegistroEstadoDeAnimo(registro);
  }
  eliminarRegistroEstadoDeAnimo(idRegistro: string, userId: string): Promise<void> {
    return this.registroEstadoAnimoDatasource.eliminarRegistroEstadoDeAnimo(idRegistro, userId);
  }
  getRegistroEstadoDeAnimoById(userId: string, idRegistro: string): Promise<RegistroEstadoAnimo | null> {
    return this.registroEstadoAnimoDatasource.getRegistroEstadoDeAnimoById(userId, idRegistro);
  }

  
}