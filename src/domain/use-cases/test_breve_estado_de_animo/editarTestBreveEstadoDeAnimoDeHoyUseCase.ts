import { CustomError, type TestBreveEstadoDeAnimo, type TestBreveEstadoDeAnimoRepository } from "../../init.js";

export interface EditarTestBreveEstadoDeAnimoDeHoyInterface {
  execute(reg: TestBreveEstadoDeAnimo): Promise<void>;
}

export class EditarTestBreveEstadoDeAnimoDeHoyUseCase implements EditarTestBreveEstadoDeAnimoDeHoyInterface {
  constructor(
    private readonly repository: TestBreveEstadoDeAnimoRepository
  ){}

  async execute(reg: TestBreveEstadoDeAnimo): Promise<void> {
    const updated = await this.repository.editarTestBreveEstadoDeAnimoDeHoy(reg);
    if(!updated) throw CustomError.notFound("Test breve no encontrado");
  }
}
