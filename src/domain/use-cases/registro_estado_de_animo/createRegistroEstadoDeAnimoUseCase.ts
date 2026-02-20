import type { RegistroEstadoAnimo, RegistroEstadoAnimoRepository } from "../../init.js";

export interface CreateRegistroEstadoDeAnimoUseCaseInterface {
  execute(reg: RegistroEstadoAnimo): Promise<string>;
}

export class CreateRegistroEstadoDeAnimoUseCase implements CreateRegistroEstadoDeAnimoUseCaseInterface {
  constructor(
    private readonly repository: RegistroEstadoAnimoRepository
  ){}

  execute(reg: RegistroEstadoAnimo) {
    return this.repository.saveRegistroEstadoDeAnimo(reg);
  }
}