import { describe, test, expect, jest, beforeEach } from "@jest/globals";
import express from 'express';
import request from 'supertest';
import { AuthRouter } from '../src/presentation/auth/routes.js';
import { ResetPasswordUseCase } from '../src/domain/use-cases/auth/reset-password.use-case.js';
import { ErrorMiddleware } from '../src/presentation/middlewares/init.js';

describe("Auth - Reset Password", () => {
  let app: express.Express;

  beforeEach(() => {
    jest.restoreAllMocks();

    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use('/api/auth', AuthRouter.routes);
    app.use(ErrorMiddleware.handleError);
  });

  test("Debe rechazar un email inválido (400)", async () => {
    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({ email: 'correo-invalido' });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "Invalid email" });
  });

  test("Debe procesar la solicitud de restablecimiento exitosamente (200)", async () => {
    jest.spyOn(ResetPasswordUseCase.prototype, 'sendResetPasswordEmail').mockResolvedValue(undefined);

    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({ email: 'usuario@example.com' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: "OK" });
  });

  test("Debe capturar errores de sendResetPasswordEmail sin dejar promesas rechazadas no controladas (500)", async () => {
    jest.spyOn(ResetPasswordUseCase.prototype, 'sendResetPasswordEmail').mockRejectedValue(new Error("DB connection error"));

    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({ email: 'usuario@example.com' });

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Internal Server Error" });
  });
});
