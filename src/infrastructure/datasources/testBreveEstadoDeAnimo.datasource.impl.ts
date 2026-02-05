import { TestBreveEstadoDeAnimoDatasource } from '../../domain/datasources/init.js';
import { TestBreveEstadoDeAnimo } from '../../domain/init.js';
import { prisma } from "../../data/index.js";


export class TestBreveEstadoDeAnimoDatasourceImpl implements TestBreveEstadoDeAnimoDatasource {

  //TODO: IMPLEMENTAR
  async saveTestBreveEstadoDeAnimo(testBreve: TestBreveEstadoDeAnimo): Promise<void> {
    await prisma.testBreveEstadoDeAnimo.create({
      data: {
        idUsuario: testBreve.idUsuario,
        notas: testBreve.notas ?? null,
        fecha: testBreve.fecha,
        depresion: {
          create: testBreve.depresion.toJson()
        },
        impulsoSuicida: {
          create: testBreve.impulsoSuicida.toJson()
        },
        ansiedadFisica: {
          create: testBreve.ansiedadFisica.toJson()
        },
        ansiedadEmocional: {
          create: testBreve.ansiedadEmocional.toJson()
        }
      }
    });
  }

  async getTestBreveEstadoDeAnimoByYear(year: number): Promise<TestBreveEstadoDeAnimo[]> {
    throw new Error('Method not implemented.');
  }

  async editarTestBreveEstadoDeAnimoDeHoy(testBreve: TestBreveEstadoDeAnimo): Promise<void> {
    throw new Error('Method not implemented.');
  }
  
  async eliminarTestBreveEstadoDeAnimoDeHoy(): Promise<void> {
    throw new Error('Method not implemented.');
  }
  
  async isTestBreveRealizadoHoy(): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  
  async getTodayTestBreveEstadoDeAnimo(): Promise<TestBreveEstadoDeAnimo | undefined> {
    throw new Error('Method not implemented.');
  }
  
}