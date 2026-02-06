import type { TestBreveEstadoDeAnimo } from "../entities/init.js";

export abstract class TestBreveEstadoDeAnimoRepository {
  abstract saveTestBreveEstadoDeAnimo(testBreve: TestBreveEstadoDeAnimo): Promise<void>;
  abstract getTestBreveEstadoDeAnimoByYear(year: number): Promise<TestBreveEstadoDeAnimo[]>;
  abstract editarTestBreveEstadoDeAnimoDeHoy(testBreve: TestBreveEstadoDeAnimo): Promise<void>;
  abstract eliminarTestBreveEstadoDeAnimoDeHoy(year: number, month: number, day: number): Promise<void>;
  abstract getTodayTestBreveEstadoDeAnimo(year: number, month: number, day: number): Promise<TestBreveEstadoDeAnimo | null>;
}