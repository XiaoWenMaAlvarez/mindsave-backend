import type { TestBreveEstadoDeAnimo, TestBreveEstadoDeAnimoRepository } from "../../init.js";

export interface GetTestBreveEstadoDeAnimoByYear {
  execute(year: number): Promise<TestBreveEstadoDeAnimo[]>;
}

export class GetTestBreveEstadoDeAnimoByYearUseCase implements GetTestBreveEstadoDeAnimoByYear{
  constructor(
    private readonly repository: TestBreveEstadoDeAnimoRepository
  ){}

  execute(year: number) {
    return this.repository.getTestBreveEstadoDeAnimoByYear(year);
  }
}