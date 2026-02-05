import type { TestBreveEstadoDeAnimo } from "../entities/init.js";

export abstract class TestBreveEstadoDeAnimoDatasource {
  abstract saveTestBreveEstadoDeAnimo(testBreve: TestBreveEstadoDeAnimo): Promise<void>;
  abstract getTestBreveEstadoDeAnimoByYear(year: number): Promise<TestBreveEstadoDeAnimo[]>;
  abstract editarTestBreveEstadoDeAnimoDeHoy(testBreve: TestBreveEstadoDeAnimo): Promise<void>;
  abstract eliminarTestBreveEstadoDeAnimoDeHoy(): Promise<void>;

  abstract isTestBreveRealizadoHoy(): Promise<boolean>;
  abstract getTodayTestBreveEstadoDeAnimo(): Promise<TestBreveEstadoDeAnimo | undefined>;
}