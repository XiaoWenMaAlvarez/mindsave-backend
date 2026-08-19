import { describe, test, expect, jest, beforeEach } from "@jest/globals";
import express from 'express';
import request from 'supertest';
import { ErrorMiddleware } from '../src/presentation/middlewares/init.js';
import { CustomError } from '../src/domain/init.js';
import { Logger } from '../src/config/logger.plugin.js';

describe("ErrorMiddleware - Centralized Error Handling", () => {
  let app: express.Express;

  beforeEach(() => {
    jest.restoreAllMocks();
    app = express();
  });

  test("Debe procesar CustomError retornando su statusCode y mensaje JSON", async () => {
    app.get('/custom-error', (req, res, next) => {
      next(CustomError.badRequest("Parámetros incorrectos"));
    });
    app.use(ErrorMiddleware.handleError);

    const res = await request(app).get('/custom-error');
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "Parámetros incorrectos" });
  });

  test("Debe procesar errores no controlados retornando 500 y 'Internal Server Error'", async () => {
    const loggerSpy = jest.spyOn(Logger, 'error').mockImplementation(() => { return; });

    app.get('/unhandled-error', (req, res, next) => {
      next(new Error("Fallo inesperado de conexión"));
    });
    app.use(ErrorMiddleware.handleError);

    const res = await request(app).get('/unhandled-error');
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Internal Server Error" });
    expect(loggerSpy).toHaveBeenCalled();
  });

  test("Debe manejar errores cuando res.headersSent es true sin arrojar excepción", async () => {
    const loggerSpy = jest.spyOn(Logger, 'error').mockImplementation(() => { return; });

    app.get('/streaming-error', (req, res, next) => {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.write("inicio del stream...");
      next(new Error("Fallo a mitad del stream"));
    });
    app.use(ErrorMiddleware.handleError);

    const res = await request(app).get('/streaming-error');
    expect(res.status).toBe(200);
    expect(res.text).toContain("inicio del stream...");
    expect(loggerSpy).toHaveBeenCalled();
  });
});
