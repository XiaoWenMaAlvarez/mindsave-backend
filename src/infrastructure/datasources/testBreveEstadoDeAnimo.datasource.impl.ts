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
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year + 1, 0, 1);

    const tests = await prisma.testBreveEstadoDeAnimo.findMany({
      where: {
        fecha: {
          gte: startDate,
          lt: endDate,
        }
      },
      include: {
        depresion: true,
        impulsoSuicida: true,
        ansiedadFisica: true,
        ansiedadEmocional: true,
      }
    });

    return tests.map(test => TestBreveEstadoDeAnimo.fromJson(test));
  }

  async editarTestBreveEstadoDeAnimoDeHoy(testBreve: TestBreveEstadoDeAnimo): Promise<void> {
    await this.eliminarTestBreveEstadoDeAnimoDeHoy(testBreve.fecha.getFullYear(), testBreve.fecha.getMonth() + 1, testBreve.fecha.getDate());
    await this.saveTestBreveEstadoDeAnimo(testBreve);
  }
  
  async eliminarTestBreveEstadoDeAnimoDeHoy(year: number, month: number, day: number): Promise<void> {
    const startDate = new Date(year, month-1, day);
    const endDate = new Date(year, month-1, day + 1);

    await prisma.testBreveEstadoDeAnimo.deleteMany({
      where: {
        fecha: {
          gte: startDate,
          lt: endDate,
        }
      }
    });
  }
  
  async getTodayTestBreveEstadoDeAnimo(year: number, month: number, day: number): Promise<TestBreveEstadoDeAnimo | null> {
    const startDate = new Date(year, month-1, day);
    const endDate = new Date(year, month-1, day + 1);

    const test = await prisma.testBreveEstadoDeAnimo.findFirst({
      where: {
        fecha: {
          gte: startDate,
          lt: endDate,
        }
      },
      include: {
        depresion: true,
        impulsoSuicida: true,
        ansiedadFisica: true,
        ansiedadEmocional: true,
      }
    });

    if (!test) return null;
    return TestBreveEstadoDeAnimo.fromJson(test);
  }
  
}