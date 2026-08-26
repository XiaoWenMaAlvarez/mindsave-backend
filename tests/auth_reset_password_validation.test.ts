import { describe, expect, jest, test, beforeEach, afterEach } from "@jest/globals";
import express from "express";
import request from "supertest";
import { isValidEsquemaResetPasswordSubmit } from "../src/presentation/validators/schemas/auth/resetPasswordSubmit.schema.js";
import { UserDTO } from "../src/presentation/validators/dtos/auth/user.dto.js";
import { ResetPasswordUseCase } from "../src/domain/use-cases/auth/reset-password.use-case.js";
import { AuthController } from "../src/presentation/auth/controller.js";
import { JwtAdapter } from "../src/config/jwt.adapter.js";
import type { UserRepository } from "../src/domain/repository/auth.repository.js";
import type { EmailService } from "../src/config/nodemailer.adapter.js";

describe("Validación de nueva contraseña en el restablecimiento de contraseñas", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("isValidEsquemaResetPasswordSubmit (Zod Schema)", () => {
    test("rechaza body cuando no es un objeto", () => {
      const resultNull = isValidEsquemaResetPasswordSubmit(null as unknown as object);
      expect(typeof resultNull).toBe("string");

      const resultString = isValidEsquemaResetPasswordSubmit("not an object" as unknown as object);
      expect(typeof resultString).toBe("string");
    });

    test("rechaza body cuando falta la contraseña", () => {
      const result = isValidEsquemaResetPasswordSubmit({});
      expect(typeof result).toBe("string");
    });

    test("rechaza contraseñas que no son de tipo string", () => {
      const resultNumber = isValidEsquemaResetPasswordSubmit({ password: 123456 });
      expect(typeof resultNumber).toBe("string");

      const resultBool = isValidEsquemaResetPasswordSubmit({ password: true });
      expect(typeof resultBool).toBe("string");

      const resultObj = isValidEsquemaResetPasswordSubmit({ password: { value: "123456" } });
      expect(typeof resultObj).toBe("string");
    });

    test("rechaza contraseñas con menos de 6 caracteres", () => {
      const resultEmpty = isValidEsquemaResetPasswordSubmit({ password: "" });
      expect(typeof resultEmpty).toBe("string");
      expect(resultEmpty).toContain("La contraseña debe tener al menos 6 caracteres");

      const resultShort = isValidEsquemaResetPasswordSubmit({ password: "12345" });
      expect(typeof resultShort).toBe("string");
      expect(resultShort).toContain("La contraseña debe tener al menos 6 caracteres");
    });

    test("acepta contraseñas válidas con 6 o más caracteres", () => {
      const resultMin = isValidEsquemaResetPasswordSubmit({ password: "123456" });
      expect(resultMin).toBe(true);

      const resultStrong = isValidEsquemaResetPasswordSubmit({ password: "MiSuperPassword123!" });
      expect(resultStrong).toBe(true);
    });
  });

  describe("UserDTO.resetPassword", () => {
    test("retorna error cuando los datos son inválidos", () => {
      const [errorShort, dataShort] = UserDTO.resetPassword({ password: "123" });
      expect(errorShort).not.toBeNull();
      expect(dataShort).toBeNull();

      const [errorMissing, dataMissing] = UserDTO.resetPassword({});
      expect(errorMissing).not.toBeNull();
      expect(dataMissing).toBeNull();
    });

    test("retorna el DTO con password cuando los datos son válidos", () => {
      const [error, data] = UserDTO.resetPassword({ password: "PasswordSegura123" });
      expect(error).toBeNull();
      expect(data).toEqual({ password: "PasswordSegura123" });
    });
  });

  describe("ResetPasswordUseCase.setNewPassword (Defensivo)", () => {
    const mockRepo: UserRepository = {
      login: jest.fn(),
      register: jest.fn(),
      verifyUserByEmail: jest.fn(),
      verifyUserByEmailAndToken: jest.fn(),
      createResetPasswordToken: jest.fn(),
      resetPassword: jest.fn(),
    };
    const mockEmailService = {} as EmailService;
    const resetUrl = "http://localhost:3000/api/auth/reset-password";

    test("retorna false si el token está vacío o no es string", async () => {
      const useCase = new ResetPasswordUseCase(mockRepo, mockEmailService, resetUrl);
      const resEmptyToken = await useCase.setNewPassword("", "PasswordValida123");
      expect(resEmptyToken).toBe(false);

      const resBlankToken = await useCase.setNewPassword("   ", "PasswordValida123");
      expect(resBlankToken).toBe(false);
    });

    test("retorna false si la contraseña no es string o tiene menos de 6 caracteres", async () => {
      const useCase = new ResetPasswordUseCase(mockRepo, mockEmailService, resetUrl);
      const resShort = await useCase.setNewPassword("some-token", "123");
      expect(resShort).toBe(false);

      const resNotString = await useCase.setNewPassword("some-token", null as unknown as string);
      expect(resNotString).toBe(false);
    });

    test("retorna false si el token no es válido o expiró en JwtAdapter", async () => {
      const useCase = new ResetPasswordUseCase(mockRepo, mockEmailService, resetUrl);
      jest.spyOn(JwtAdapter, "validateToken").mockReturnValue(null);

      const result = await useCase.setNewPassword("invalid-jwt-token", "PasswordValida123");
      expect(result).toBe(false);
    });

    test("hashea la contraseña y llama a userRepository.resetPassword cuando los datos son válidos", async () => {
      const useCase = new ResetPasswordUseCase(mockRepo, mockEmailService, resetUrl);
      jest.spyOn(JwtAdapter, "validateToken").mockReturnValue({ email: "test@example.com" } as any);
      (mockRepo.resetPassword as jest.MockedFunction<typeof mockRepo.resetPassword>).mockResolvedValue(true);

      const result = await useCase.setNewPassword("valid-token", "PasswordValida123");
      expect(result).toBe(true);
      expect(mockRepo.resetPassword).toHaveBeenCalledWith(
        "test@example.com",
        "valid-token",
        expect.any(String),
      );
    });
  });

  describe("HTTP POST /api/auth/reset-password/:token (Express Controller)", () => {
    let app: express.Express;
    let mockRepo: UserRepository;
    let mockEmailService: EmailService;

    beforeEach(() => {
      mockRepo = {
        login: jest.fn(),
        register: jest.fn(),
        verifyUserByEmail: jest.fn(),
        verifyUserByEmailAndToken: jest.fn(),
        createResetPasswordToken: jest.fn(),
        resetPassword: jest.fn(),
      };
      mockEmailService = {} as EmailService;

      const authController = new AuthController(
        mockRepo,
        mockEmailService,
        "http://localhost:3000/api/auth/validate-email",
        "http://localhost:3000/api/auth/reset-password",
      );

      app = express();
      app.use(express.json());
      app.use(express.urlencoded({ extended: true }));
      app.post("/api/auth/reset-password/:token", authController.resetPasswordWithToken);
    });

    test("retorna 400 Bad Request cuando el body está vacío o falta la contraseña (JSON)", async () => {
      const res = await request(app)
        .post("/api/auth/reset-password/valid-token")
        .send({});

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");
    });

    test("retorna 400 Bad Request cuando la contraseña no es de tipo string (JSON)", async () => {
      const res = await request(app)
        .post("/api/auth/reset-password/valid-token")
        .send({ password: 123456 });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");
    });

    test("retorna 400 Bad Request cuando la contraseña tiene menos de 6 caracteres (JSON)", async () => {
      const res = await request(app)
        .post("/api/auth/reset-password/valid-token")
        .send({ password: "123" });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toContain("La contraseña debe tener al menos 6 caracteres");
    });

    test("retorna 400 Bad Request cuando la contraseña tiene menos de 6 caracteres (urlencoded del formulario)", async () => {
      const res = await request(app)
        .post("/api/auth/reset-password/valid-token")
        .type("form")
        .send({ password: "abc" });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toContain("La contraseña debe tener al menos 6 caracteres");
    });

    test("retorna 200 con página de éxito cuando la contraseña es válida y el cambio es exitoso (JSON)", async () => {
      jest.spyOn(JwtAdapter, "validateToken").mockReturnValue({ email: "user@example.com" } as any);
      (mockRepo.resetPassword as jest.MockedFunction<typeof mockRepo.resetPassword>).mockResolvedValue(true);

      const res = await request(app)
        .post("/api/auth/reset-password/valid-token")
        .send({ password: "NuevaPasswordSegura123" });

      expect(res.status).toBe(200);
      expect(res.text).toContain("La contraseña se cambió con éxito");
    });

    test("retorna 200 con página de éxito cuando la contraseña es válida y enviada vía formulario urlencoded", async () => {
      jest.spyOn(JwtAdapter, "validateToken").mockReturnValue({ email: "user@example.com" } as any);
      (mockRepo.resetPassword as jest.MockedFunction<typeof mockRepo.resetPassword>).mockResolvedValue(true);

      const res = await request(app)
        .post("/api/auth/reset-password/valid-token")
        .type("form")
        .send({ password: "PasswordValidaFormulario123" });

      expect(res.status).toBe(200);
      expect(res.text).toContain("La contraseña se cambió con éxito");
    });

    test("retorna 200 con página de fallo cuando el token es inválido en el repositorio", async () => {
      jest.spyOn(JwtAdapter, "validateToken").mockReturnValue({ email: "user@example.com" } as any);
      (mockRepo.resetPassword as jest.MockedFunction<typeof mockRepo.resetPassword>).mockResolvedValue(false);

      const res = await request(app)
        .post("/api/auth/reset-password/expired-or-invalid-token")
        .send({ password: "NuevaPasswordSegura123" });

      expect(res.status).toBe(200);
      expect(res.text).toContain("Ocurrió un error al intentar cambiar la contraseña");
    });
  });
});
