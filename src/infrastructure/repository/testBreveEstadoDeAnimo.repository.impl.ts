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
  eliminarTestBreveEstadoDeAnimoDeHoy(year: number, month: number, day: number): Promise<void> {
    return this.testBreveEstadoDeAnimoDatasource.eliminarTestBreveEstadoDeAnimoDeHoy(year, month, day);
  }

  getTodayTestBreveEstadoDeAnimo(year: number, month: number, day: number): Promise<TestBreveEstadoDeAnimo | null> {
    return this.testBreveEstadoDeAnimoDatasource.getTodayTestBreveEstadoDeAnimo(year, month, day);
  }

  
  
}