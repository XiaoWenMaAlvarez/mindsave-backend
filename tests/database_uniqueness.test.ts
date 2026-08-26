import { readFileSync } from "node:fs";
import { afterEach, describe, expect, jest, test } from "@jest/globals";
import { prisma } from "../src/data/index.js";
import { swaggerDocument } from "../src/config/swagger.config.js";
import { TestBreveEstadoDeAnimo } from "../src/domain/init.js";
import { Prisma } from "../src/generated/prisma/client.js";
import { ChatIADatasourceImpl } from "../src/infrastructure/datasources/chatIA.datasource.impl.js";
import { TestBreveEstadoDeAnimoDatasourceImpl } from "../src/infrastructure/datasources/testBreveEstadoDeAnimo.datasource.impl.js";

const userId = "0f2cb907-c53f-4218-b728-01c4639bf70a";

const createTestBreve = (): TestBreveEstadoDeAnimo => TestBreveEstadoDeAnimo.fromJson({
  idUsuario: userId,
  fecha: new Date(2026, 7, 26, 23, 30),
  notas: "nota",
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

const uniqueConstraintError = () => new Prisma.PrismaClientKnownRequestError(
  "Unique constraint failed",
  {
    code: "P2002",
    clientVersion: "7.9.1",
  },
);

describe("Constraints de unicidad", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("el schema y la migración imponen ambas claves únicas compuestas", () => {
    const schema = readFileSync("prisma/schema.prisma", "utf8");
    const migration = readFileSync(
      "prisma/migrations/20260826000000_agrega_unicidad_test_diario_y_titulo_chat/migration.sql",
      "utf8",
    );

    expect(schema).toContain("fechaDia            DateTime                      @db.Date");
    expect(schema).toContain("@@unique([idUsuario, fechaDia]");
    expect(schema).toContain("@@unique([idUsuario, title]");
    expect(migration).toContain('CREATE UNIQUE INDEX "test_breve_estado_de_animo_idUsuario_fechaDia_key"');
    expect(migration).toContain('CREATE UNIQUE INDEX "chat_idUsuario_title_key"');
    expect(migration).toContain('LOCK TABLE "test_breve_estado_de_animo"');
    expect(migration).toContain("existen tests duplicados");
    expect(migration).toContain("existen títulos duplicados");
    expect(
      swaggerDocument.paths?.["/api/chat-ia/new-chat"]?.post?.responses?.["400"],
    ).toBeDefined();
  });

  test("el test breve persiste y consulta la clave de día normalizada", async () => {
    jest.spyOn(prisma.user, "findUnique").mockResolvedValue({ id: userId } as never);
    const findUnique = jest
      .spyOn(prisma.testBreveEstadoDeAnimo, "findUnique")
      .mockResolvedValue(null);
    const create = jest
      .spyOn(prisma.testBreveEstadoDeAnimo, "create")
      .mockResolvedValue({ id: "test-123" } as never);

    await new TestBreveEstadoDeAnimoDatasourceImpl().saveTestBreveEstadoDeAnimo(createTestBreve());

    const fechaDia = new Date("2026-08-26T00:00:00.000Z");
    expect(findUnique).toHaveBeenCalledWith({
      where: {
        idUsuario_fechaDia: {
          idUsuario: userId,
          fechaDia,
        },
      },
    });
    expect(create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        fechaDia,
      }),
    });
  });

  test("una colisión concurrente del test se resuelve reemplazando el registro ganador", async () => {
    jest.spyOn(prisma.user, "findUnique").mockResolvedValue({ id: userId } as never);
    jest.spyOn(prisma.testBreveEstadoDeAnimo, "findUnique").mockResolvedValue(null);
    jest.spyOn(prisma.testBreveEstadoDeAnimo, "create").mockRejectedValue(uniqueConstraintError());
    const datasource = new TestBreveEstadoDeAnimoDatasourceImpl();
    const edit = jest
      .spyOn(datasource, "editarTestBreveEstadoDeAnimoDeHoy")
      .mockResolvedValue(true);

    await expect(datasource.saveTestBreveEstadoDeAnimo(createTestBreve())).resolves.toBeUndefined();

    expect(edit).toHaveBeenCalledTimes(1);
  });

  test("una colisión concurrente de título conserva el error de negocio", async () => {
    jest.spyOn(prisma.user, "findUnique").mockResolvedValue({ id: userId } as never);
    jest.spyOn(prisma.chat, "findFirst").mockResolvedValue(null);
    jest.spyOn(prisma.chat, "create").mockRejectedValue(uniqueConstraintError());

    await expect(
      new ChatIADatasourceImpl().createNewChat(userId, "Título repetido"),
    ).rejects.toMatchObject({
      statusCode: 400,
      message: "Chat already exists",
    });
  });
});
