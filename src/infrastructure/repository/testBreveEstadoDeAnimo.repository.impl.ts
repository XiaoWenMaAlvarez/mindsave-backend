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

  getTestBreveEstadoDeAnimoByYear(year: number, userId: string): Promise<TestBreveEstadoDeAnimo[]> {
    return this.testBreveEstadoDeAnimoDatasource.getTestBreveEstadoDeAnimoByYear(year, userId);
  }
  editarTestBreveEstadoDeAnimoDeHoy(testBreve: TestBreveEstadoDeAnimo): Promise<void> {
    return this.testBreveEstadoDeAnimoDatasource.editarTestBreveEstadoDeAnimoDeHoy(testBreve);
  }
  eliminarTestBreveEstadoDeAnimoDeHoy(year: number, month: number, day: number, userId: string): Promise<void> {
    return this.testBreveEstadoDeAnimoDatasource.eliminarTestBreveEstadoDeAnimoDeHoy(year, month, day, userId);
  }

  getTodayTestBreveEstadoDeAnimo(year: number, month: number, day: number, userId: string): Promise<TestBreveEstadoDeAnimo | null> {
    return this.testBreveEstadoDeAnimoDatasource.getTodayTestBreveEstadoDeAnimo(year, month, day, userId);
  }
  
}