import type { TestBreveEstadoDeAnimo } from "../entities/init.js";

export abstract class TestBreveEstadoDeAnimoDatasource {
  abstract saveTestBreveEstadoDeAnimo(testBreve: TestBreveEstadoDeAnimo): Promise<void>;
  abstract getTestBreveEstadoDeAnimoByYear(year: number, userId: string): Promise<TestBreveEstadoDeAnimo[]>;
  abstract editarTestBreveEstadoDeAnimoDeHoy(testBreve: TestBreveEstadoDeAnimo): Promise<void>;
  abstract eliminarTestBreveEstadoDeAnimoDeHoy(year: number, month: number, day: number, userId: string): Promise<void>;
  abstract getTodayTestBreveEstadoDeAnimo(year: number, month: number, day: number, userId: string): Promise<TestBreveEstadoDeAnimo | null>;
}