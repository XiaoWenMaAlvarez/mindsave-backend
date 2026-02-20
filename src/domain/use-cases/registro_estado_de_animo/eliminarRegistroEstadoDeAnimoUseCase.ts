import type { RegistroEstadoAnimo, RegistroEstadoAnimoRepository } from "../../init.js";

export interface EliminarRegistroEstadoDeAnimoUseCaseInterface {
  execute(regId: string, userId: string): Promise<void>;
}

export class EliminarRegistroEstadoDeAnimoUseCase implements EliminarRegistroEstadoDeAnimoUseCaseInterface {
  constructor(
    private readonly repository: RegistroEstadoAnimoRepository
  ){}

  execute(regId: string, userId: string) {
    return this.repository.eliminarRegistroEstadoDeAnimo(regId, userId);
  }
}