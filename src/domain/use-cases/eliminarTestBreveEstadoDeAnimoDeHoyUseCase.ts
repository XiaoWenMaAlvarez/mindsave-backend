import type { TestBreveEstadoDeAnimoRepository } from "../init.js";

export interface EliminarTestBreveEstadoDeAnimoDeHoy {
  execute(year: number, month: number, day: number): Promise<void>;
}

export class EliminarTestBreveEstadoDeAnimoDeHoyUseCase implements EliminarTestBreveEstadoDeAnimoDeHoy {
  constructor(
    private readonly repository: TestBreveEstadoDeAnimoRepository
  ){}

  execute(year: number, month: number, day: number) {
    return this.repository.eliminarTestBreveEstadoDeAnimoDeHoy(year, month, day);
  }
}