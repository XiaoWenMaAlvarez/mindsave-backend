import type { RegistroEstadoAnimo, RegistroEstadoAnimoRepository } from "../../init.js";

export interface EditarRegistroEstadoDeAnimoUseCaseInterface {
  execute(registroEstadoAnimo: RegistroEstadoAnimo): Promise<void>;
}

export class EditarRegistroEstadoDeAnimoUseCase implements EditarRegistroEstadoDeAnimoUseCaseInterface {
  constructor(
    private readonly repository: RegistroEstadoAnimoRepository
  ){}

  execute(registroEstadoAnimo: RegistroEstadoAnimo) {
    return this.repository.editarRegistroEstadoDeAnimo(registroEstadoAnimo);
  }
}