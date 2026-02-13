import type { TestBreveEstadoDeAnimo, TestBreveEstadoDeAnimoRepository } from "../../init.js";

export interface EditarTestBreveEstadoDeAnimoDeHoyInterface {
  execute(reg: TestBreveEstadoDeAnimo): Promise<void>;
}

export class EditarTestBreveEstadoDeAnimoDeHoyUseCase implements EditarTestBreveEstadoDeAnimoDeHoyInterface {
  constructor(
    private readonly repository: TestBreveEstadoDeAnimoRepository
  ){}

  execute(reg: TestBreveEstadoDeAnimo) {
    //TODO: Verificar que el id de usuario sea válido
    return this.repository.editarTestBreveEstadoDeAnimoDeHoy(reg);
  }
}