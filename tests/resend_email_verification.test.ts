import { afterEach, describe, expect, jest, test } from "@jest/globals";
import express from "express";
import request from "supertest";
import type { EmailService, SendMailOptions } from "../src/config/nodemailer.adapter.js";
import { JwtAdapter } from "../src/config/jwt.adapter.js";
import type { UserRepository } from "../src/domain/repository/auth.repository.js";
import { ResendEmailVerification } from "../src/domain/use-cases/auth/resend-email-verification.use-case.js";
import { UserDatasourceImpl } from "../src/infrastructure/datasources/auth.datasource.impl.js";
import { prisma } from "../src/data/postgres/index.js";
import { AuthController } from "../src/presentation/auth/controller.js";
import { ErrorMiddleware } from "../src/presentation/middlewares/error.middleware.js";

const verifyEmailUrl = "https://api.mindsave.test/api/auth/validate-email";

const createEmailService = (result = true) => {
  const sendEmail = jest.fn(async (_options: SendMailOptions) => result);
  return {
    emailService: { sendEmail } as unknown as EmailService,
    sendEmail,
  };
};

const createRepository = (user: { email: string; name: string } | null) => {
  const findUnverifiedUserByEmail = jest.fn(async (_email: string) => user);
  return {
    repository: { findUnverifiedUserByEmail } as unknown as UserRepository,
    findUnverifiedUserByEmail,
  };
};

afterEach(() => {
  jest.restoreAllMocks();
});

describe("Reenvío de validación de email", () => {
  test("genera un enlace nuevo y escapa los datos del usuario en el correo", async () => {
    const { repository, findUnverifiedUserByEmail } = createRepository({
      email: "pendiente@example.com",
      name: "<script>alert('xss')</script>",
    });
    const { emailService, sendEmail } = createEmailService();
    jest.spyOn(JwtAdapter, "generateToken").mockReturnValue("nuevo-token");

    await new ResendEmailVerification(repository, emailService, verifyEmailUrl)
      .execute("pendiente@example.com");

    expect(findUnverifiedUserByEmail).toHaveBeenCalledWith("pendiente@example.com");
    expect(JwtAdapter.generateToken).toHaveBeenCalledWith(
      { email: "pendiente@example.com" },
      "email-verification",
      "24h",
    );
    expect(sendEmail).toHaveBeenCalledTimes(1);

    const options = sendEmail.mock.calls[0]?.[0];
    expect(options).toMatchObject({
      to: "pendiente@example.com",
      subject: "Valida tu cuenta - Mind Save",
    });
    expect(options?.htmlBody).toContain(`${verifyEmailUrl}/nuevo-token`);
    expect(options?.htmlBody).toContain("&lt;script&gt;alert(&#039;xss&#039;)&lt;/script&gt;");
    expect(options?.htmlBody).not.toContain("<script>alert('xss')</script>");
  });

  test("no envía correos cuando no hay una cuenta pendiente elegible", async () => {
    const { repository } = createRepository(null);
    const { emailService, sendEmail } = createEmailService();

    await new ResendEmailVerification(repository, emailService, verifyEmailUrl)
      .execute("desconocido@example.com");

    expect(sendEmail).not.toHaveBeenCalled();
  });

  test("propaga un error 500 si el proveedor no puede enviar el correo", async () => {
    const { repository } = createRepository({
      email: "pendiente@example.com",
      name: "Ana",
    });
    const { emailService } = createEmailService(false);
    jest.spyOn(JwtAdapter, "generateToken").mockReturnValue("nuevo-token");

    await expect(
      new ResendEmailVerification(repository, emailService, verifyEmailUrl)
        .execute("pendiente@example.com"),
    ).rejects.toMatchObject({
      statusCode: 500,
      message: "Error al enviar correo de verificación",
    });
  });

  test("la consulta de persistencia limita el reenvío a usuarios activos no verificados", async () => {
    const findFirst = jest.spyOn(prisma.user, "findFirst").mockResolvedValue({
      email: "pendiente@example.com",
      name: "Ana",
    } as never);

    const result = await new UserDatasourceImpl()
      .findUnverifiedUserByEmail("pendiente@example.com");

    expect(result).toEqual({email: "pendiente@example.com", name: "Ana"});
    expect(findFirst).toHaveBeenCalledWith({
      where: {
        email: "pendiente@example.com",
        emailVerified: false,
        isActive: true,
        role: {description: "USER_ROL"},
      },
      select: {email: true, name: true},
    });
  });

  test("el endpoint devuelve la misma respuesta genérica si el correo no es elegible", async () => {
    const { repository } = createRepository(null);
    const { emailService, sendEmail } = createEmailService();
    const controller = new AuthController(
      repository,
      emailService,
      verifyEmailUrl,
      "https://api.mindsave.test/api/auth/reset-password",
    );
    const app = express();
    app.use(express.json());
    app.post("/api/auth/resend-validation-email", controller.resendEmailVerification);
    app.use(ErrorMiddleware.handleError);

    const response = await request(app)
      .post("/api/auth/resend-validation-email")
      .send({email: "desconocido@example.com"});

    expect(response.status).toBe(200);
    expect(response.body).toEqual({message: "OK"});
    expect(sendEmail).not.toHaveBeenCalled();
  });

  test("el endpoint rechaza un email inválido antes de consultar la cuenta", async () => {
    const { repository, findUnverifiedUserByEmail } = createRepository(null);
    const { emailService } = createEmailService();
    const controller = new AuthController(
      repository,
      emailService,
      verifyEmailUrl,
      "https://api.mindsave.test/api/auth/reset-password",
    );
    const app = express();
    app.use(express.json());
    app.post("/api/auth/resend-validation-email", controller.resendEmailVerification);

    const response = await request(app)
      .post("/api/auth/resend-validation-email")
      .send({email: "correo-invalido"});

    expect(response.status).toBe(400);
    expect(response.body).toEqual({error: "Invalid email"});
    expect(findUnverifiedUserByEmail).not.toHaveBeenCalled();
  });
});
