import { describe, expect, jest, test, beforeEach, afterEach } from "@jest/globals";
import express from "express";
import request from "supertest";
import { isValidEsquemaTestBreveEstadoDeAnimo } from "../src/presentation/validators/schemas/test_breve_estado_de_animo/testBreveEstadoDeAnimo.schema.js";
import { isValidEsquemaRegistroEstadoDeAnimo } from "../src/presentation/validators/schemas/registro_estado_de_animo/registroEstadoAnimo.schema.js";
import { TestBreveEstadoDeAnimoController } from "../src/presentation/test_breve_estado_de_animo/controller.js";
import { RegistroEstadoDeAnimoController } from "../src/presentation/registro_estado_de_animo/controller.js";
import { TestBreveEstadoDeAnimoDatasourceImpl } from "../src/infrastructure/datasources/testBreveEstadoDeAnimo.datasource.impl.js";
import type { TestBreveEstadoDeAnimoRepository } from "../src/domain/repository/testBreveEstadoDeAnimo.repository.js";
import type { RegistroEstadoAnimoRepository } from "../src/domain/repository/registroEstadoAnimo.repository.js";

const userId = "0f2cb907-c53f-4218-b728-01c4639bf70a";

const validTestBreveBody = (fecha: unknown) => ({
  idUsuario: userId,
  fecha,
  notas: "Nota de prueba",
  depresion: {
    tristeza: 0,
    desesperanza: 0,
    bajaAutoestima: 0,
    faltaDeValor: 0,
    perdidaDeSatisfaccion: 0,
  },
  impulsoSuicida: {
    pensamientosSuicidas: 0,
    deseosDeMorir: 0,
  },
  ansiedadFisica: {
    palpitaciones: 0,
    sudoracion: 0,
    temblores: 0,
    dificultadRespirar: 0,
    ahogo: 0,
    dolorPecho: 0,
    nauseas: 0,
    mareos: 0,
    sensacionIrrealidad: 0,
    inestabilidadHormigueos: 0,
  },
  ansiedadEmocional: {
    angustiado: 0,
    nervioso: 0,
    preocupado: 0,
    asustado: 0,
    tenso: 0,
  },
});

const validRegistroBody = (fecha: unknown) => ({
  idUsuario: userId,
  fecha,
  sucesoTrastornador: "Discusión en el trabajo",
  grupoEmociones1: {
    triste: false,
    melancolico: false,
    deprimido: false,
    decaido: false,
    infeliz: false,
    porcentajeCreenciaAntes: 0,
    porcentajeCreenciaDespues: null,
  },
  grupoEmociones2: {
    angustiado: true,
    preocupado: true,
    conPanico: false,
    nervioso: true,
    asustado: false,
    porcentajeCreenciaAntes: 80,
    porcentajeCreenciaDespues: 40,
  },
  grupoEmociones3: {
    culpable: false,
    conRemordimiento: false,
    malo: false,
    avergonzado: false,
    porcentajeCreenciaAntes: 0,
    porcentajeCreenciaDespues: null,
  },
  grupoEmociones4: {
    inferior: false,
    sinValor: false,
    inadecuado: false,
    deficiente: false,
    incompetente: false,
    porcentajeCreenciaAntes: 0,
    porcentajeCreenciaDespues: null,
  },
  grupoEmociones5: {
    solitario: false,
    noQuerido: false,
    noDeseado: false,
    rechazado: false,
    solo: false,
    abandonado: false,
    porcentajeCreenciaAntes: 0,
    porcentajeCreenciaDespues: null,
  },
  grupoEmociones6: {
    turbado: false,
    tonto: false,
    humillado: false,
    apurado: false,
    porcentajeCreenciaAntes: 0,
    porcentajeCreenciaDespues: null,
  },
  grupoEmociones7: {
    desesperanzado: false,
    desanimado: false,
    pesimista: false,
    descorazonado: false,
    porcentajeCreenciaAntes: 0,
    porcentajeCreenciaDespues: null,
  },
  grupoEmociones8: {
    frustrado: true,
    atascado: false,
    chasqueado: false,
    derrotado: false,
    porcentajeCreenciaAntes: 50,
    porcentajeCreenciaDespues: null,
  },
  grupoEmociones9: {
    airado: false,
    enfadado: false,
    resentido: false,
    molesto: false,
    irritado: false,
    trastornado: false,
    furioso: false,
    porcentajeCreenciaAntes: 0,
    porcentajeCreenciaDespues: null,
  },
  grupoEmocionesPersonalizadas: {
    listaEmociones: ["ansiedad"],
    porcentajeCreenciaAntes: 10,
    porcentajeCreenciaDespues: null,
  },
  pensamientos: [
    {
      pensamientoNegativo: "Todo saldrá mal",
      porcentajeCreenciaAntes: 90,
      porcentajeCreenciaDespues: 20,
      pensamientoPositivo: "Puedo manejarlo paso a paso",
      porcentajeCreenciaPositivo: 80,
      distorsion: [true, false, false, false, false, false, false, false, false, false],
    },
  ],
});

describe("Validación estricta de fechas e independencia de zona horaria", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("isValidEsquemaTestBreveEstadoDeAnimo - Validación de Fecha", () => {
    test("rechaza cadenas que no representan fechas válidas", () => {
      expect(typeof isValidEsquemaTestBreveEstadoDeAnimo(validTestBreveBody("not-a-date"))).toBe("string");
      expect(typeof isValidEsquemaTestBreveEstadoDeAnimo(validTestBreveBody(""))).toBe("string");
      expect(typeof isValidEsquemaTestBreveEstadoDeAnimo(validTestBreveBody("   "))).toBe("string");
      expect(typeof isValidEsquemaTestBreveEstadoDeAnimo(validTestBreveBody("invalid-2026-99-99"))).toBe("string");
      expect(typeof isValidEsquemaTestBreveEstadoDeAnimo(validTestBreveBody(123456789))).toBe("string");
      expect(typeof isValidEsquemaTestBreveEstadoDeAnimo(validTestBreveBody(null))).toBe("string");
    });

    test("acepta cadenas con fechas válidas en formato ISO", () => {
      expect(isValidEsquemaTestBreveEstadoDeAnimo(validTestBreveBody("2026-08-26T14:30:00.000Z"))).toBe(true);
      expect(isValidEsquemaTestBreveEstadoDeAnimo(validTestBreveBody("2026-08-26T23:59:59Z"))).toBe(true);
      expect(isValidEsquemaTestBreveEstadoDeAnimo(validTestBreveBody("2026-08-26"))).toBe(true);
    });
  });

  describe("isValidEsquemaRegistroEstadoDeAnimo - Validación de Fecha", () => {
    test("rechaza cadenas que no representan fechas válidas", () => {
      expect(typeof isValidEsquemaRegistroEstadoDeAnimo(validRegistroBody("not-a-date"))).toBe("string");
      expect(typeof isValidEsquemaRegistroEstadoDeAnimo(validRegistroBody(""))).toBe("string");
      expect(typeof isValidEsquemaRegistroEstadoDeAnimo(validRegistroBody("   "))).toBe("string");
      expect(typeof isValidEsquemaRegistroEstadoDeAnimo(validRegistroBody("2026-99-99"))).toBe("string");
      expect(typeof isValidEsquemaRegistroEstadoDeAnimo(validRegistroBody(123456789))).toBe("string");
    });

    test("acepta cadenas con fechas válidas en formato ISO", () => {
      expect(isValidEsquemaRegistroEstadoDeAnimo(validRegistroBody("2026-08-26T14:30:00.000Z"))).toBe(true);
      expect(isValidEsquemaRegistroEstadoDeAnimo(validRegistroBody("2026-08-26T00:00:00.000Z"))).toBe(true);
      expect(isValidEsquemaRegistroEstadoDeAnimo(validRegistroBody("2026-08-26"))).toBe(true);
    });
  });

  describe("TestBreveEstadoDeAnimoDatasourceImpl.getFechaDia (Independencia UTC)", () => {
    test("clasifica correctamente el día en UTC sin importar la hora del registro", () => {
      const datasource = new TestBreveEstadoDeAnimoDatasourceImpl();
      const getFechaDia = (datasource as unknown as { getFechaDia: (d: Date) => Date }).getFechaDia.bind(datasource);

      // 26 de agosto a las 00:01 UTC
      const earlyMorningUtc = new Date("2026-08-26T00:01:00.000Z");
      const dayEarly = getFechaDia(earlyMorningUtc);
      expect(dayEarly.toISOString()).toBe("2026-08-26T00:00:00.000Z");

      // 26 de agosto a las 23:59 UTC
      const lateNightUtc = new Date("2026-08-26T23:59:59.000Z");
      const dayLate = getFechaDia(lateNightUtc);
      expect(dayLate.toISOString()).toBe("2026-08-26T00:00:00.000Z");

      // Transición al siguiente día
      const nextDayUtc = new Date("2026-08-27T00:00:00.000Z");
      const dayNext = getFechaDia(nextDayUtc);
      expect(dayNext.toISOString()).toBe("2026-08-27T00:00:00.000Z");
    });
  });

  describe("TestBreveEstadoDeAnimoController - Validación de fecha en endpoints por parámetro", () => {
    let app: express.Express;
    let mockRepo: TestBreveEstadoDeAnimoRepository;

    beforeEach(() => {
      mockRepo = {
        saveTestBreveEstadoDeAnimo: jest.fn(),
        getTestBreveEstadoDeAnimoByYear: jest.fn(),
        editarTestBreveEstadoDeAnimoDeHoy: jest.fn(),
        eliminarTestBreveEstadoDeAnimoDeHoy: jest.fn(),
        getTodayTestBreveEstadoDeAnimo: jest.fn(),
      };

      const controller = new TestBreveEstadoDeAnimoController(mockRepo);
      app = express();
      app.use(express.json());
      app.use((req, _res, next) => {
        req.user = { id: userId, email: "user@test.com", name: "User", role: "USER_ROL" };
        next();
      });

      app.get("/api/test-breve-estado-de-animo/:year/:month/:day", controller.getTodayTestBreveEstadoDeAnimo);
      app.delete("/api/test-breve-estado-de-animo/:year/:month/:day", controller.eliminarTestBreveEstadoDeAnimoDeHoy);
      app.post("/api/test-breve-estado-de-animo", controller.saveTestBreveEstadoDeAnimo);
    });

    test("rechaza fechas inexistentes como 30 de febrero con 400 Bad Request", async () => {
      const resGet = await request(app).get("/api/test-breve-estado-de-animo/2026/2/30");
      expect(resGet.status).toBe(400);
      expect(resGet.body).toEqual({ error: "Fecha inválida" });

      const resDel = await request(app).delete("/api/test-breve-estado-de-animo/2026/2/30");
      expect(resDel.status).toBe(400);
      expect(resDel.body).toEqual({ error: "Fecha inválida" });
    });

    test("rechaza 31 de abril con 400 Bad Request", async () => {
      const res = await request(app).get("/api/test-breve-estado-de-animo/2026/4/31");
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: "Fecha inválida" });
    });

    test("rechaza 29 de febrero en año no bisiesto (2023) pero acepta en año bisiesto (2024)", async () => {
      const resNonLeap = await request(app).get("/api/test-breve-estado-de-animo/2023/2/29");
      expect(resNonLeap.status).toBe(400);
      expect(resNonLeap.body).toEqual({ error: "Fecha inválida" });

      (mockRepo.getTodayTestBreveEstadoDeAnimo as jest.MockedFunction<typeof mockRepo.getTodayTestBreveEstadoDeAnimo>).mockResolvedValue(null);
      const resLeap = await request(app).get("/api/test-breve-estado-de-animo/2024/2/29");
      expect(resLeap.status).toBe(200);
    });

    test("rechaza POST /api/test-breve-estado-de-animo con fecha string inválida", async () => {
      const res = await request(app)
        .post("/api/test-breve-estado-de-animo")
        .send(validTestBreveBody("texto-invalido"));

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toContain("La fecha debe ser una fecha válida");
    });
  });

  describe("RegistroEstadoDeAnimoController - Validación de fecha en POST", () => {
    let app: express.Express;
    let mockRepo: RegistroEstadoAnimoRepository;

    beforeEach(() => {
      mockRepo = {
        saveRegistroEstadoDeAnimo: jest.fn(),
        getRegistroEstadoDeAnimoPendientes: jest.fn(),
        getRegistroEstadoDeAnimoCompletos: jest.fn(),
        editarRegistroEstadoDeAnimo: jest.fn(),
        eliminarRegistroEstadoDeAnimo: jest.fn(),
        getRegistroEstadoDeAnimoById: jest.fn(),
      };

      const controller = new RegistroEstadoDeAnimoController(mockRepo);
      app = express();
      app.use(express.json());
      app.use((req, _res, next) => {
        req.user = { id: userId, email: "user@test.com", name: "User", role: "USER_ROL" };
        next();
      });

      app.post("/api/registro-estado-de-animo", controller.saveRegistroEstadoDeAnimo);
    });

    test("rechaza POST /api/registro-estado-de-animo con fecha inválida", async () => {
      const res = await request(app)
        .post("/api/registro-estado-de-animo")
        .send(validRegistroBody("fecha-invalida"));

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toContain("La fecha debe ser una fecha válida");
    });
  });
});
