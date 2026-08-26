import { describe, expect, jest, test, beforeEach, afterEach } from "@jest/globals";
import express from "express";
import request from "supertest";
import { isValidEsquemaAdminRegisterUser } from "../src/presentation/validators/schemas/admin/user/adminRegisterUserSchema.js";
import { isValidEsquemaAdminUpdateUser } from "../src/presentation/validators/schemas/admin/user/adminUpdateUserSchema.js";
import { UserAdminDTO } from "../src/presentation/validators/dtos/admin/user/adminUser.dto.js";
import { CreateUserAdmin } from "../src/domain/use-cases/admin/users/register-user.use-case.js";
import { AdminUserController } from "../src/presentation/admin/user/controller.js";
import { UserEntity } from "../src/domain/entities/auth/user.entity.js";
import type { AdminUserRepository } from "../src/domain/repository/admin/adminUser.repository.js";

describe("Validación de creación y actualización administrativa de usuarios", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("isValidEsquemaAdminRegisterUser (Zod Schema - Creación)", () => {
    test("rechaza body cuando no es un objeto", () => {
      const resultNull = isValidEsquemaAdminRegisterUser(null as unknown as object);
      expect(typeof resultNull).toBe("string");
    });

    test("rechaza body vacío cuando faltan los campos requeridos", () => {
      const result = isValidEsquemaAdminRegisterUser({});
      expect(typeof result).toBe("string");
    });

    test("rechaza cuando falta email o el formato es incorrecto", () => {
      const missingEmail = isValidEsquemaAdminRegisterUser({
        name: "Admin User",
        password: "Password123!",
        role: "USER_ROL",
        emailVerified: true,
      });
      expect(typeof missingEmail).toBe("string");

      const invalidEmail = isValidEsquemaAdminRegisterUser({
        email: "correo-invalido",
        name: "Admin User",
        password: "Password123!",
        role: "USER_ROL",
        emailVerified: true,
      });
      expect(typeof invalidEmail).toBe("string");
    });

    test("rechaza cuando falta nombre o tiene menos de 2 caracteres", () => {
      const missingName = isValidEsquemaAdminRegisterUser({
        email: "test@example.com",
        password: "Password123!",
        role: "USER_ROL",
        emailVerified: true,
      });
      expect(typeof missingName).toBe("string");

      const shortName = isValidEsquemaAdminRegisterUser({
        email: "test@example.com",
        name: "A",
        password: "Password123!",
        role: "USER_ROL",
        emailVerified: true,
      });
      expect(typeof shortName).toBe("string");
    });

    test("rechaza cuando falta contraseña o tiene menos de 6 caracteres", () => {
      const missingPassword = isValidEsquemaAdminRegisterUser({
        email: "test@example.com",
        name: "Admin User",
        role: "USER_ROL",
        emailVerified: true,
      });
      expect(typeof missingPassword).toBe("string");

      const shortPassword = isValidEsquemaAdminRegisterUser({
        email: "test@example.com",
        name: "Admin User",
        password: "123",
        role: "USER_ROL",
        emailVerified: true,
      });
      expect(typeof shortPassword).toBe("string");
    });

    test("rechaza cuando falta rol o el rol no es válido", () => {
      const missingRole = isValidEsquemaAdminRegisterUser({
        email: "test@example.com",
        name: "Admin User",
        password: "Password123!",
        emailVerified: true,
      });
      expect(typeof missingRole).toBe("string");

      const invalidRole = isValidEsquemaAdminRegisterUser({
        email: "test@example.com",
        name: "Admin User",
        password: "Password123!",
        role: "SUPERADMIN_ROL",
        emailVerified: true,
      });
      expect(typeof invalidRole).toBe("string");
    });

    test("rechaza cuando falta emailVerified o no es booleano", () => {
      const missingEmailVerified = isValidEsquemaAdminRegisterUser({
        email: "test@example.com",
        name: "Admin User",
        password: "Password123!",
        role: "USER_ROL",
      });
      expect(typeof missingEmailVerified).toBe("string");

      const invalidEmailVerified = isValidEsquemaAdminRegisterUser({
        email: "test@example.com",
        name: "Admin User",
        password: "Password123!",
        role: "USER_ROL",
        emailVerified: "true",
      });
      expect(typeof invalidEmailVerified).toBe("string");
    });

    test("acepta payload con todos los campos requeridos y válidos", () => {
      const resultUserRol = isValidEsquemaAdminRegisterUser({
        email: "usuario@example.com",
        name: "Usuario Valido",
        password: "PasswordSegura123!",
        role: "USER_ROL",
        emailVerified: false,
      });
      expect(resultUserRol).toBe(true);

      const resultProfRol = isValidEsquemaAdminRegisterUser({
        email: "profesional@example.com",
        name: "Profesional Valido",
        password: "PasswordSegura123!",
        role: "PROFESIONAL_ROL",
        emailVerified: true,
      });
      expect(resultProfRol).toBe(true);
    });
  });

  describe("isValidEsquemaAdminUpdateUser (Zod Schema - Actualización)", () => {
    test("acepta body vacío (actualización parcial vacía)", () => {
      const result = isValidEsquemaAdminUpdateUser({});
      expect(result).toBe(true);
    });

    test("acepta actualizaciones parciales válidas", () => {
      expect(isValidEsquemaAdminUpdateUser({ name: "Nuevo Nombre" })).toBe(true);
      expect(isValidEsquemaAdminUpdateUser({ email: "nuevo@example.com" })).toBe(true);
      expect(isValidEsquemaAdminUpdateUser({ password: "NuevaPassword123!" })).toBe(true);
      expect(isValidEsquemaAdminUpdateUser({ role: "PROFESIONAL_ROL" })).toBe(true);
      expect(isValidEsquemaAdminUpdateUser({ emailVerified: true })).toBe(true);
      expect(isValidEsquemaAdminUpdateUser({ isActive: false })).toBe(true);
    });

    test("rechaza campos con formatos o tipos inválidos en actualización", () => {
      expect(typeof isValidEsquemaAdminUpdateUser({ email: "email-invalido" })).toBe("string");
      expect(typeof isValidEsquemaAdminUpdateUser({ name: "A" })).toBe("string");
      expect(typeof isValidEsquemaAdminUpdateUser({ password: "123" })).toBe("string");
      expect(typeof isValidEsquemaAdminUpdateUser({ role: "INVALID_ROLE" })).toBe("string");
      expect(typeof isValidEsquemaAdminUpdateUser({ emailVerified: "si" })).toBe("string");
      expect(typeof isValidEsquemaAdminUpdateUser({ isActive: "no" })).toBe("string");
    });
  });

  describe("UserAdminDTO", () => {
    test("createUser retorna error cuando faltan campos requeridos", () => {
      const [error, userEntity] = UserAdminDTO.createUser({});
      expect(error).not.toBeNull();
      expect(userEntity).toBeNull();
    });

    test("createUser retorna UserEntity cuando todos los campos son válidos", () => {
      const [error, userEntity] = UserAdminDTO.createUser({
        email: "admin.create@example.com",
        name: "Admin Create",
        password: "Password123!",
        role: "USER_ROL",
        emailVerified: true,
      });
      expect(error).toBeNull();
      expect(userEntity).toBeInstanceOf(UserEntity);
      expect(userEntity?.email).toBe("admin.create@example.com");
      expect(userEntity?.role).toBe("USER_ROL");
      expect(userEntity?.emailVerified).toBe(true);
    });

    test("editeUser retorna error cuando el UUID es inválido", () => {
      const [error, editEntity] = UserAdminDTO.editeUser({ name: "Nuevo" }, "invalid-uuid");
      expect(error).toBe("Invalid id");
      expect(editEntity).toBeNull();
    });

    test("editeUser mapea correctamente los campos parciales incluyendo booleanos falsos", () => {
      const validUuid = "0f2cb907-c53f-4218-b728-01c4639bf70a";
      const [error, editEntity] = UserAdminDTO.editeUser(
        {
          name: "Nuevo Nombre",
          emailVerified: false,
          isActive: false,
        },
        validUuid,
      );
      expect(error).toBeNull();
      expect(editEntity).toEqual({
        id: validUuid,
        name: "Nuevo Nombre",
        emailVerified: false,
        isActive: false,
      });
    });
  });

  describe("CreateUserAdmin Use Case (Defensivo)", () => {
    const mockRepo: AdminUserRepository = {
      createUser: jest.fn(),
      getUsers: jest.fn(),
      getUserById: jest.fn(),
      updateUser: jest.fn(),
      deleteUser: jest.fn(),
      restoreUser: jest.fn(),
    };

    test("lanza CustomError.badRequest si la contraseña es menor a 6 caracteres o no es string", async () => {
      const useCase = new CreateUserAdmin(mockRepo);
      const invalidUser = new UserEntity({
        id: "1",
        email: "test@example.com",
        name: "Test",
        password: "123",
        emailVerified: false,
        role: "USER_ROL",
      });

      await expect(useCase.execute(invalidUser)).rejects.toThrow("La contraseña debe tener al menos 6 caracteres");
    });

    test("hashea la contraseña y crea el usuario correctamente cuando es válido", async () => {
      const useCase = new CreateUserAdmin(mockRepo);
      const validUser = new UserEntity({
        id: "",
        email: "test@example.com",
        name: "Test",
        password: "PasswordSegura123!",
        emailVerified: false,
        role: "USER_ROL",
      });

      (mockRepo.createUser as jest.MockedFunction<typeof mockRepo.createUser>).mockResolvedValue(
        new UserEntity({
          id: "created-id-123",
          email: "test@example.com",
          name: "Test",
          password: "",
          emailVerified: false,
          role: "USER_ROL",
        }),
      );

      const result = await useCase.execute(validUser);
      expect(result.id).toBe("created-id-123");
      expect(result.password).toBe("");
      expect(mockRepo.createUser).toHaveBeenCalledWith(
        expect.objectContaining({
          email: "test@example.com",
          name: "Test",
        }),
      );
    });
  });

  describe("HTTP POST /admin/user & PUT /admin/user/:idUsuario (Express Controller)", () => {
    let app: express.Express;
    let mockRepo: AdminUserRepository;

    beforeEach(() => {
      mockRepo = {
        createUser: jest.fn(),
        getUsers: jest.fn(),
        getUserById: jest.fn(),
        updateUser: jest.fn(),
        deleteUser: jest.fn(),
        restoreUser: jest.fn(),
      };

      const controller = new AdminUserController(mockRepo);
      app = express();
      app.use(express.json());
      app.post("/admin/user", controller.createUser);
      app.put("/admin/user/:idUsuario", controller.updateUser);
    });

    test("POST /admin/user retorna 400 cuando el body está vacío", async () => {
      const res = await request(app).post("/admin/user").send({});
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");
    });

    test("POST /admin/user retorna 400 cuando falta password", async () => {
      const res = await request(app).post("/admin/user").send({
        email: "test@example.com",
        name: "Test User",
        role: "USER_ROL",
        emailVerified: false,
      });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");
    });

    test("POST /admin/user retorna 201 cuando todos los campos requeridos son válidos", async () => {
      (mockRepo.createUser as jest.MockedFunction<typeof mockRepo.createUser>).mockResolvedValue(
        new UserEntity({
          id: "uuid-12345",
          email: "test@example.com",
          name: "Test User",
          password: "",
          emailVerified: false,
          role: "USER_ROL",
        }),
      );

      const res = await request(app).post("/admin/user").send({
        email: "test@example.com",
        name: "Test User",
        password: "Password123!",
        role: "USER_ROL",
        emailVerified: false,
      });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("id", "uuid-12345");
      expect(res.body).toHaveProperty("email", "test@example.com");
    });

    test("PUT /admin/user/:idUsuario retorna 400 cuando el ID no es UUID válido", async () => {
      const res = await request(app).put("/admin/user/not-a-uuid").send({
        name: "Nuevo Nombre",
      });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");
    });

    test("PUT /admin/user/:idUsuario retorna 200 cuando se actualizan campos parciales válidos", async () => {
      const validUuid = "0f2cb907-c53f-4218-b728-01c4639bf70a";
      (mockRepo.updateUser as jest.MockedFunction<typeof mockRepo.updateUser>).mockResolvedValue(null);

      const res = await request(app).put(`/admin/user/${validUuid}`).send({
        name: "Nombre Actualizado",
      });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ status: "success" });
    });
  });
});
