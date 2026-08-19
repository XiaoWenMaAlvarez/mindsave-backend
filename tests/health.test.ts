import { describe, test, expect, jest, beforeEach } from "@jest/globals";
import express from 'express';
import request from 'supertest';
import { HealthController } from '../src/presentation/health/controller.js';
import { prisma } from '../src/data/index.js';
import { Logger } from '../src/config/logger.plugin.js';

describe("HealthController - /health Endpoint with Live Pings", () => {
  let app: express.Express;
  let mockGeminiService: any;
  let mockFilesService: any;
  let mockEmailService: any;

  beforeEach(() => {
    jest.restoreAllMocks();

    mockGeminiService = {
      checkHealth: jest.fn(async () => true),
    };
    mockFilesService = {
      checkHealth: jest.fn(async () => true),
    };
    mockEmailService = {
      checkHealth: jest.fn(async () => true),
    };

    const healthController = new HealthController(
      mockGeminiService,
      mockFilesService,
      mockEmailService
    );

    app = express();
    app.get('/health', healthController.check);
  });

  test("Debe retornar 200 con status 'ok' cuando BD, Gemini, Cloudinary y Mailer responden correctamente", async () => {
    jest.spyOn(prisma, '$queryRaw').mockResolvedValue([{ '?column?': 1 }] as any);

    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.timestamp).toBeDefined();
    expect(typeof res.body.uptime).toBe("number");
    expect(res.body.services).toEqual({
      database: "connected",
      gemini: "connected",
      cloudinary: "connected",
      mailer: "connected"
    });
  });

  test("Debe retornar 200 con status 'degraded' si la BD está conectada pero un servicio externo falla", async () => {
    jest.spyOn(prisma, '$queryRaw').mockResolvedValue([{ '?column?': 1 }] as any);
    mockGeminiService.checkHealth.mockResolvedValue(false);

    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("degraded");
    expect(res.body.services.database).toBe("connected");
    expect(res.body.services.gemini).toBe("disconnected");
    expect(res.body.services.cloudinary).toBe("connected");
    expect(res.body.services.mailer).toBe("connected");
  });

  test("Debe retornar 503 con status 'error' cuando la base de datos no responde", async () => {
    jest.spyOn(prisma, '$queryRaw').mockRejectedValue(new Error("Connection refused"));
    jest.spyOn(Logger, 'error').mockImplementation(() => { return; });

    const res = await request(app).get('/health');

    expect(res.status).toBe(503);
    expect(res.body.status).toBe("error");
    expect(res.body.services.database).toBe("disconnected");
  });
});
