import { TestBreveEstadoDeAnimoDatasource } from '../../domain/datasources/init.js';
import { TestBreveEstadoDeAnimo } from '../../domain/init.js';
import { prisma } from "../../data/index.js";
import type { Prisma } from "../../generated/prisma/client.js";

type TestBreveWriteClient = Pick<Prisma.TransactionClient, "testBreveEstadoDeAnimo">;

export class TestBreveEstadoDeAnimoDatasourceImpl implements TestBreveEstadoDeAnimoDatasource {

  private async createTestBreveEstadoDeAnimo(
    client: TestBreveWriteClient,
    testBreve: TestBreveEstadoDeAnimo,
    userId: string,
  ): Promise<void> {
    await client.testBreveEstadoDeAnimo.create({
      data: {
        notas: testBreve.notas ?? null,
        fecha: testBreve.fecha,
        user: {
          connect: { id: userId }
        },
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

  async saveTestBreveEstadoDeAnimo(testBreve: TestBreveEstadoDeAnimo): Promise<void> {
    const user = await prisma.user.findUnique({
      where: {id: testBreve.idUsuario}
    });
    if(user == null) return;

    const startDate = new Date(testBreve.fecha.getFullYear(), testBreve.fecha.getMonth(), testBreve.fecha.getDate());
    const endDate = new Date(testBreve.fecha.getFullYear(), testBreve.fecha.getMonth(), testBreve.fecha.getDate() + 1);

    const isTestRealizado = await prisma.testBreveEstadoDeAnimo.findFirst({
      where: {
        fecha: {
          gte: startDate,
          lt: endDate,
        },
        idUsuario: testBreve.idUsuario
      },
    });

    if(isTestRealizado) {
      await this.editarTestBreveEstadoDeAnimoDeHoy(testBreve);
      return;
    }

    await this.createTestBreveEstadoDeAnimo(prisma, testBreve, user.id);
  }

  async getTestBreveEstadoDeAnimoByYear(year: number, userId: string): Promise<TestBreveEstadoDeAnimo[]> {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year + 1, 0, 1);

    const tests = await prisma.testBreveEstadoDeAnimo.findMany({
      where: {
        fecha: {
          gte: startDate,
          lt: endDate,
        },
        idUsuario: userId
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

  async editarTestBreveEstadoDeAnimoDeHoy(testBreve: TestBreveEstadoDeAnimo): Promise<boolean> {
    const startDate = new Date(testBreve.fecha.getFullYear(), testBreve.fecha.getMonth(), testBreve.fecha.getDate());
    const endDate = new Date(testBreve.fecha.getFullYear(), testBreve.fecha.getMonth(), testBreve.fecha.getDate() + 1);

    return prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: testBreve.idUsuario }
      });
      if(user == null) return false;

      const deleted = await tx.testBreveEstadoDeAnimo.deleteMany({
        where: {
          fecha: {
            gte: startDate,
            lt: endDate,
          },
          idUsuario: testBreve.idUsuario,
        },
      });
      if(deleted.count === 0) return false;

      await this.createTestBreveEstadoDeAnimo(tx, testBreve, user.id);
      return true;
    });
  }
  
  async eliminarTestBreveEstadoDeAnimoDeHoy(year: number, month: number, day: number, userId: string): Promise<void> {
    const startDate = new Date(year, month-1, day);
    const endDate = new Date(year, month-1, day + 1);

    const testParaEliminar = await prisma.testBreveEstadoDeAnimo.findFirst({
      where: {
        fecha: {
          gte: startDate,
          lt: endDate,
        },
        idUsuario: userId
      },
    });

    if(testParaEliminar == null) return;

    await prisma.testBreveEstadoDeAnimo.deleteMany({
      where: {
        fecha: {
          gte: startDate,
          lt: endDate,
        },
        idUsuario: userId
      }
    });
  }
  
  async getTodayTestBreveEstadoDeAnimo(year: number, month: number, day: number, userId: string): Promise<TestBreveEstadoDeAnimo | null> {
    const startDate = new Date(year, month-1, day);
    const endDate = new Date(year, month-1, day + 1);

    const test = await prisma.testBreveEstadoDeAnimo.findFirst({
      where: {
        fecha: {
          gte: startDate,
          lt: endDate,
        },
        idUsuario: userId
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
