import { afterEach, describe, expect, jest, test } from "@jest/globals";
import { prisma } from "../src/data/index.js";
import { swaggerDocument } from "../src/config/swagger.config.js";
import {
  EditarRegistroEstadoDeAnimoUseCase,
  EditarTestBreveEstadoDeAnimoDeHoyUseCase,
  RegistroEstadoAnimo,
  TestBreveEstadoDeAnimo,
  type RegistroEstadoAnimoRepository,
  type TestBreveEstadoDeAnimoRepository,
} from "../src/domain/init.js";
import { RegistroEstadoAnimoDatasourceImpl } from "../src/infrastructure/datasources/registroEstadoDeAnimo.datasource.impl.js";
import { TestBreveEstadoDeAnimoDatasourceImpl } from "../src/infrastructure/datasources/testBreveEstadoDeAnimo.datasource.impl.js";

const createTestBreve = (): TestBreveEstadoDeAnimo => TestBreveEstadoDeAnimo.fromJson({
  idUsuario: "user-123",
  fecha: new Date(2026, 7, 26, 10, 30),
  notas: "nota actualizada",
  depresion: {
    tristeza: 1,
    desesperanza: 1,
    bajaAutoestima: 1,
    faltaDeValor: 1,
    perdidaDeSatisfaccion: 1,
  },
  impulsoSuicida: {
    pensamientosSuicidas: 0,
    deseosDeMorir: 0,
  },
  ansiedadFisica: {
    palpitaciones: 1,
    sudoracion: 1,
    temblores: 1,
    dificultadRespirar: 1,
    ahogo: 1,
    dolorPecho: 1,
    nauseas: 1,
    mareos: 1,
    sensacionIrrealidad: 1,
    inestabilidadHormigueos: 1,
  },
  ansiedadEmocional: {
    angustiado: 1,
    nervioso: 1,
    preocupado: 1,
    asustado: 1,
    tenso: 1,
  },
});

const createRegistro = (): RegistroEstadoAnimo => {
  const group = {
    toJson: () => ({ porcentajeCreenciaAntes: 50, porcentajeCreenciaDespues: 25 }),
  };

  return {
    id: "registro-123",
    idUsuario: "user-123",
    fecha: new Date(2026, 7, 26, 11, 0),
    sucesoTrastornador: "Situación actualizada",
    grupoEmociones1: group,
    grupoEmociones2: group,
    grupoEmociones3: group,
    grupoEmociones4: group,
    grupoEmociones5: group,
    grupoEmociones6: group,
    grupoEmociones7: group,
    grupoEmociones8: group,
    grupoEmociones9: group,
    pensamientos: [],
  } as unknown as RegistroEstadoAnimo;
};

describe("Ediciones transaccionales", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("test breve ejecuta delete y create con el mismo cliente transaccional", async () => {
    const operations: string[] = [];
    const creationError = new Error("nested create failed");
    const tx = {
      user: {
        findUnique: jest.fn(async () => ({ id: "user-123" })),
      },
      testBreveEstadoDeAnimo: {
        deleteMany: jest.fn(async () => {
          operations.push("delete");
          return { count: 1 };
        }),
        create: jest.fn(async () => {
          operations.push("create");
          throw creationError;
        }),
      },
    };
    const transaction = jest
      .spyOn(prisma, "$transaction")
      .mockImplementation(async (callback: any) => callback(tx));
    const datasource = new TestBreveEstadoDeAnimoDatasourceImpl();

    await expect(datasource.editarTestBreveEstadoDeAnimoDeHoy(createTestBreve()))
      .rejects.toBe(creationError);

    expect(transaction).toHaveBeenCalledWith(expect.any(Function));
    expect(operations).toEqual(["delete", "create"]);
    expect(tx.testBreveEstadoDeAnimo.deleteMany).toHaveBeenCalledWith({
      where: {
        fechaDia: new Date("2026-08-26T00:00:00.000Z"),
        idUsuario: "user-123",
      },
    });
  });

  test("registro cognitivo ejecuta delete y recreación con el mismo cliente transaccional", async () => {
    const operations: string[] = [];
    const creationError = new Error("nested create failed");
    const tx = {
      user: {
        findUnique: jest.fn(async () => ({ id: "user-123" })),
      },
      registroEstadoAnimo: {
        deleteMany: jest.fn(async () => {
          operations.push("delete");
          return { count: 1 };
        }),
        create: jest.fn(async () => {
          operations.push("create");
          throw creationError;
        }),
      },
    };
    const transaction = jest
      .spyOn(prisma, "$transaction")
      .mockImplementation(async (callback: any) => callback(tx));
    const datasource = new RegistroEstadoAnimoDatasourceImpl();

    await expect(datasource.editarRegistroEstadoDeAnimo(createRegistro()))
      .rejects.toBe(creationError);

    expect(transaction).toHaveBeenCalledWith(expect.any(Function));
    expect(operations).toEqual(["delete", "create"]);
    expect(tx.registroEstadoAnimo.deleteMany).toHaveBeenCalledWith({
      where: {
        id: "registro-123",
        idUsuario: "user-123",
      },
    });
  });

  test("test breve inexistente no ejecuta create", async () => {
    const tx = {
      user: {
        findUnique: jest.fn(async () => ({ id: "user-123" })),
      },
      testBreveEstadoDeAnimo: {
        deleteMany: jest.fn(async () => ({ count: 0 })),
        create: jest.fn(),
      },
    };
    jest
      .spyOn(prisma, "$transaction")
      .mockImplementation(async (callback: any) => callback(tx));
    const datasource = new TestBreveEstadoDeAnimoDatasourceImpl();

    await expect(datasource.editarTestBreveEstadoDeAnimoDeHoy(createTestBreve()))
      .resolves.toBe(false);

    expect(tx.testBreveEstadoDeAnimo.create).not.toHaveBeenCalled();
  });

  test("registro cognitivo inexistente o ajeno no ejecuta create", async () => {
    const tx = {
      user: {
        findUnique: jest.fn(async () => ({ id: "user-123" })),
      },
      registroEstadoAnimo: {
        deleteMany: jest.fn(async () => ({ count: 0 })),
        create: jest.fn(),
      },
    };
    jest
      .spyOn(prisma, "$transaction")
      .mockImplementation(async (callback: any) => callback(tx));
    const datasource = new RegistroEstadoAnimoDatasourceImpl();

    await expect(datasource.editarRegistroEstadoDeAnimo(createRegistro()))
      .resolves.toBe(false);

    expect(tx.registroEstadoAnimo.create).not.toHaveBeenCalled();
  });

  test("los casos de uso convierten ausencia o pertenencia ajena en 404", async () => {
    const testRepository = {
      editarTestBreveEstadoDeAnimoDeHoy: jest.fn(async () => false),
    } as unknown as TestBreveEstadoDeAnimoRepository;
    const registroRepository = {
      editarRegistroEstadoDeAnimo: jest.fn(async () => false),
    } as unknown as RegistroEstadoAnimoRepository;

    await expect(
      new EditarTestBreveEstadoDeAnimoDeHoyUseCase(testRepository).execute(createTestBreve()),
    ).rejects.toMatchObject({
      statusCode: 404,
      message: "Test breve no encontrado",
    });
    await expect(
      new EditarRegistroEstadoDeAnimoUseCase(registroRepository).execute(createRegistro()),
    ).rejects.toMatchObject({
      statusCode: 404,
      message: "Registro de estado de ánimo no encontrado",
    });
  });

  test("OpenAPI documenta 404 para ambos PUT", () => {
    expect(swaggerDocument.paths["/api/test-breve-estado-de-animo"].put.responses["404"])
      .toBeDefined();
    expect(swaggerDocument.paths["/api/registro-estado-de-animo"].put.responses["404"])
      .toBeDefined();
  });
});
