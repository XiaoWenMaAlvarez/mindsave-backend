import type { TestBreveEstadoDeAnimo, TestBreveEstadoDeAnimoRepository } from "../../init.js";

export interface GetTodayTestBreveEstadoDeAnimoInterface {
  execute(year: number, month: number, day: number, userId: string): Promise<TestBreveEstadoDeAnimo | null>;
}

export class GetTodayTestBreveEstadoDeAnimoUseCase implements GetTodayTestBreveEstadoDeAnimoInterface{
  constructor(
    private readonly repository: TestBreveEstadoDeAnimoRepository
  ){}

  execute(year: number, month: number, day: number, userId: string): Promise<TestBreveEstadoDeAnimo | null> {
    return this.repository.getTodayTestBreveEstadoDeAnimo(year, month, day, userId);
  }
}