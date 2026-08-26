import { TestBreveEstadoDeAnimoDatasource } from '../../domain/datasources/init.js';
import { CustomError, TestBreveEstadoDeAnimo } from '../../domain/init.js';
import { prisma } from "../../data/index.js";
import { Prisma } from "../../generated/prisma/client.js";

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
        fechaDia: this.getFechaDia(testBreve.fecha),
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

    const fechaDia = this.getFechaDia(testBreve.fecha);

    const isTestRealizado = await prisma.testBreveEstadoDeAnimo.findUnique({
      where: {
        idUsuario_fechaDia: {
          idUsuario: testBreve.idUsuario,
          fechaDia,
        },
      },
    });

    if(isTestRealizado) {
      await this.editarTestBreveEstadoDeAnimoDeHoy(testBreve);
      return;
    }

    try {
      await this.createTestBreveEstadoDeAnimo(prisma, testBreve, user.id);
    } catch(error) {
      if(!this.isUniqueConstraintViolation(error)) throw error;

      const updated = await this.editarTestBreveEstadoDeAnimoDeHoy(testBreve);
      if(!updated) throw CustomError.badRequest("Test already exists");
    }
  }

  async getTestBreveEstadoDeAnimoByYear(year: number, userId: string): Promise<TestBreveEstadoDeAnimo[]> {
    const startDate = new Date(Date.UTC(year, 0, 1));
    const endDate = new Date(Date.UTC(year + 1, 0, 1));

    const tests = await prisma.testBreveEstadoDeAnimo.findMany({
      where: {
        fechaDia: {
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
    const fechaDia = this.getFechaDia(testBreve.fecha);

    return prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: testBreve.idUsuario }
      });
      if(user == null) return false;

      const deleted = await tx.testBreveEstadoDeAnimo.deleteMany({
        where: {
          fechaDia,
          idUsuario: testBreve.idUsuario,
        },
      });
      if(deleted.count === 0) return false;

      await this.createTestBreveEstadoDeAnimo(tx, testBreve, user.id);
      return true;
    });
  }
  
  async eliminarTestBreveEstadoDeAnimoDeHoy(year: number, month: number, day: number, userId: string): Promise<void> {
    const fechaDia = new Date(Date.UTC(year, month - 1, day));

    const testParaEliminar = await prisma.testBreveEstadoDeAnimo.findUnique({
      where: {
        idUsuario_fechaDia: {
          idUsuario: userId,
          fechaDia,
        },
      },
    });

    if(testParaEliminar == null) {
      throw CustomError.notFound("Test breve no encontrado");
    }

    await prisma.testBreveEstadoDeAnimo.deleteMany({
      where: {
        fechaDia,
        idUsuario: userId
      }
    });
  }
  
  async getTodayTestBreveEstadoDeAnimo(year: number, month: number, day: number, userId: string): Promise<TestBreveEstadoDeAnimo | null> {
    const fechaDia = new Date(Date.UTC(year, month - 1, day));

    const test = await prisma.testBreveEstadoDeAnimo.findUnique({
      where: {
        idUsuario_fechaDia: {
          idUsuario: userId,
          fechaDia,
        },
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

  private getFechaDia(fecha: Date): Date {
    return new Date(Date.UTC(fecha.getUTCFullYear(), fecha.getUTCMonth(), fecha.getUTCDate()));
  }

  private isUniqueConstraintViolation(error: unknown): boolean {
    return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
  }
  
}
