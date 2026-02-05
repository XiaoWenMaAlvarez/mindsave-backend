import type { TestBreveEstadoDeAnimo, TestBreveEstadoDeAnimoRepository } from "../init.js";

export interface CreateTestBreveEstadoDeAnimoUseCaseInterface {
  execute(reg: TestBreveEstadoDeAnimo): Promise<void>;
}

export class CreateTestBreveEstadoDeAnimoUseCase {
  constructor(
    private readonly repository: TestBreveEstadoDeAnimoRepository
  ){}

  execute(reg: TestBreveEstadoDeAnimo) {
    //TODO: Verificar que el id de usuario sea válido
    return this.repository.saveTestBreveEstadoDeAnimo(reg);
  }
}