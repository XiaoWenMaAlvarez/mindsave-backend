import { CustomError, type RegistroEstadoAnimo, type RegistroEstadoAnimoRepository } from "../../init.js";

export interface EditarRegistroEstadoDeAnimoUseCaseInterface {
  execute(registroEstadoAnimo: RegistroEstadoAnimo): Promise<void>;
}

export class EditarRegistroEstadoDeAnimoUseCase implements EditarRegistroEstadoDeAnimoUseCaseInterface {
  constructor(
    private readonly repository: RegistroEstadoAnimoRepository
  ){}

  async execute(registroEstadoAnimo: RegistroEstadoAnimo): Promise<void> {
    const updated = await this.repository.editarRegistroEstadoDeAnimo(registroEstadoAnimo);
    if(!updated) throw CustomError.notFound("Registro de estado de ánimo no encontrado");
  }
}
