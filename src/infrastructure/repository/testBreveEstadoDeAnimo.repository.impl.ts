import type { TestBreveEstadoDeAnimo } from '../../domain/init.js';
import type { TestBreveEstadoDeAnimoRepository } from '../../domain/repository/init.js';
import { TestBreveEstadoDeAnimoDatasource } from '../../domain/datasources/init.js';

export class TestBreveEstadoDeAnimoRepositoryImpl implements TestBreveEstadoDeAnimoRepository {

  constructor(
    private readonly testBreveEstadoDeAnimoDatasource: TestBreveEstadoDeAnimoDatasource
  ){}

  saveTestBreveEstadoDeAnimo(testBreve: TestBreveEstadoDeAnimo): Promise<void> {
    return this.testBreveEstadoDeAnimoDatasource.saveTestBreveEstadoDeAnimo(testBreve);
  }

  getTestBreveEstadoDeAnimoByYear(year: number): Promise<TestBreveEstadoDeAnimo[]> {
    return this.testBreveEstadoDeAnimoDatasource.getTestBreveEstadoDeAnimoByYear(year);
  }
  editarTestBreveEstadoDeAnimoDeHoy(testBreve: TestBreveEstadoDeAnimo): Promise<void> {
    return this.testBreveEstadoDeAnimoDatasource.editarTestBreveEstadoDeAnimoDeHoy(testBreve);
  }
  eliminarTestBreveEstadoDeAnimoDeHoy(): Promise<void> {
    return this.testBreveEstadoDeAnimoDatasource.eliminarTestBreveEstadoDeAnimoDeHoy();
  }
  isTestBreveRealizadoHoy(): Promise<boolean> {
    return this.testBreveEstadoDeAnimoDatasource.isTestBreveRealizadoHoy();
  }
  getTodayTestBreveEstadoDeAnimo(): Promise<TestBreveEstadoDeAnimo | undefined> {
    return this.testBreveEstadoDeAnimoDatasource.getTodayTestBreveEstadoDeAnimo();
  }

  
  
}