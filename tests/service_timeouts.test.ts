import { afterEach, describe, expect, jest, test } from "@jest/globals";
import type { Request, Response } from "express";
import { v2 as cloudinary } from "cloudinary";
import { EmailService } from "../src/config/nodemailer.adapter.js";
import { GeminiService } from "../src/config/gemini.adapter.js";
import { FilesRepositoryService } from "../src/config/cloudinary.adapter.js";
import { TimeoutError, withTimeout } from "../src/config/timeout.helper.js";
import { HealthController } from "../src/presentation/health/controller.js";
import { prisma } from "../src/data/index.js";

describe("Timeouts y manejo asíncrono de servicios externos", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("withTimeout helper", () => {
    test("resuelve el valor si la promesa termina antes del timeout", async () => {
      const fastPromise = new Promise<string>((resolve) => {
        setTimeout(() => resolve("ok"), 10);
      });
      const result = await withTimeout(fastPromise, 500, "Fast operation");
      expect(result).toBe("ok");
    });

    test("rechaza con TimeoutError si la promesa excede el tiempo límite", async () => {
      const hangingPromise = new Promise<string>(() => {});
      await expect(
        withTimeout(hangingPromise, 25, "Hanging operation")
      ).rejects.toThrow(TimeoutError);
    });
  });

  describe("EmailService", () => {
    test("sendEmail espera la resolución de sendMail y retorna true en éxito", async () => {
      const emailService = new EmailService("gmail", "test@test.com", "secret", {
        sendEmailTimeoutMs: 500,
      });
      const transporter = (emailService as unknown as {
        transporter: { sendMail: (opts: unknown) => Promise<unknown> };
      }).transporter;

      let resolved = false;
      jest.spyOn(transporter, "sendMail").mockImplementation(async () => {
        await new Promise((r) => setTimeout(r, 20));
        resolved = true;
        return { messageId: "123" };
      });

      const isSent = await emailService.sendEmail({
        to: "dest@test.com",
        subject: "Prueba",
        htmlBody: "<p>Hola</p>",
      });

      expect(resolved).toBe(true);
      expect(isSent).toBe(true);
    });

    test("sendEmail espera y retorna false cuando sendMail rechaza asíncronamente", async () => {
      const emailService = new EmailService("gmail", "test@test.com", "secret", {
        sendEmailTimeoutMs: 500,
      });
      const transporter = (emailService as unknown as {
        transporter: { sendMail: (opts: unknown) => Promise<unknown> };
      }).transporter;

      jest.spyOn(transporter, "sendMail").mockImplementation(async () => {
        await new Promise((r) => setTimeout(r, 20));
        throw new Error("SMTP connection refused");
      });

      const isSent = await emailService.sendEmail({
        to: "dest@test.com",
        subject: "Prueba",
        htmlBody: "<p>Hola</p>",
      });

      expect(isSent).toBe(false);
    });

    test("sendEmail retorna false cuando la operación de envío expira por timeout", async () => {
      const emailService = new EmailService("gmail", "test@test.com", "secret", {
        sendEmailTimeoutMs: 25,
      });
      const transporter = (emailService as unknown as {
        transporter: { sendMail: (opts: unknown) => Promise<unknown> };
      }).transporter;

      jest.spyOn(transporter, "sendMail").mockImplementation(() => new Promise(() => {}));

      const isSent = await emailService.sendEmail({
        to: "dest@test.com",
        subject: "Prueba",
        htmlBody: "<p>Hola</p>",
      });

      expect(isSent).toBe(false);
    });

    test("checkHealth retorna false cuando verify expira por timeout", async () => {
      const emailService = new EmailService("gmail", "test@test.com", "secret", {
        checkHealthTimeoutMs: 25,
      });
      const transporter = (emailService as unknown as {
        transporter: { verify: () => Promise<unknown> };
      }).transporter;

      jest.spyOn(transporter, "verify").mockImplementation(() => new Promise(() => {}));

      const isHealthy = await emailService.checkHealth();
      expect(isHealthy).toBe(false);
    });
  });

  describe("GeminiService timeouts", () => {
    test("checkHealth retorna false cuando la llamada al modelo expira", async () => {
      const geminiService = new GeminiService({ checkHealthTimeoutMs: 25 });
      const ai = (geminiService as unknown as {
        ai: { models: { get: (opts: unknown) => Promise<unknown> } };
      }).ai;

      jest.spyOn(ai.models, "get").mockImplementation(() => new Promise(() => {}));

      const isHealthy = await geminiService.checkHealth();
      expect(isHealthy).toBe(false);
    });
  });

  describe("FilesRepositoryService timeouts", () => {
    test("checkHealth retorna false cuando el ping de Cloudinary expira", async () => {
      const filesService = new FilesRepositoryService({ checkHealthTimeoutMs: 25 });
      jest.spyOn(cloudinary.api, "ping").mockImplementation(() => new Promise(() => {}));

      const isHealthy = await filesService.checkHealth();
      expect(isHealthy).toBe(false);
    });
  });

  describe("HealthController con sondas lentas o colgadas", () => {
    test("responde estado degraded (200) cuando una sonda externa se cuelga y expira el timeout", async () => {
      jest.spyOn(prisma, "$queryRaw").mockResolvedValue([{ 1: 1 }] as never);

      const geminiService = {
        checkHealth: jest.fn(async () => true),
      } as unknown as GeminiService;

      const filesService = {
        checkHealth: jest.fn(async () => true),
      } as unknown as FilesRepositoryService;

      const emailService = {
        checkHealth: jest.fn(() => new Promise<boolean>(() => {})), // Sonda colgada
      } as unknown as EmailService;

      const controller = new HealthController(geminiService, filesService, emailService, 30);

      const req = {} as Request;
      let jsonPayload: any = null;
      let statusCode = 0;
      const res = {
        status: jest.fn((code: number) => {
          statusCode = code;
          return {
            json: (payload: any) => {
              jsonPayload = payload;
            },
          };
        }),
      } as unknown as Response;

      await controller.check(req, res);

      expect(statusCode).toBe(200);
      expect(jsonPayload.status).toBe("degraded");
      expect(jsonPayload.services.database).toBe("connected");
      expect(jsonPayload.services.gemini).toBe("connected");
      expect(jsonPayload.services.cloudinary).toBe("connected");
      expect(jsonPayload.services.mailer).toBe("disconnected");
    });

    test("responde 503 cuando la sonda de base de datos se cuelga y expira", async () => {
      jest.spyOn(prisma, "$queryRaw").mockImplementation(() => new Promise(() => {})); // BD colgada

      const geminiService = {
        checkHealth: jest.fn(async () => true),
      } as unknown as GeminiService;

      const filesService = {
        checkHealth: jest.fn(async () => true),
      } as unknown as FilesRepositoryService;

      const emailService = {
        checkHealth: jest.fn(async () => true),
      } as unknown as EmailService;

      const controller = new HealthController(geminiService, filesService, emailService, 30);

      const req = {} as Request;
      let jsonPayload: any = null;
      let statusCode = 0;
      const res = {
        status: jest.fn((code: number) => {
          statusCode = code;
          return {
            json: (payload: any) => {
              jsonPayload = payload;
            },
          };
        }),
      } as unknown as Response;

      await controller.check(req, res);

      expect(statusCode).toBe(503);
      expect(jsonPayload.status).toBe("error");
      expect(jsonPayload.services.database).toBe("disconnected");
    });
  });
});
