import { describe, test, expect, beforeAll, afterAll } from "@jest/globals";
import {
  api, createAccount, deactivateAccounts, loginAdmin, loginUser, signToken, testEmail,
  TEST_PASSWORD, UUID_RE, type TestAccount,
} from "./helpers.js";

describe("Autenticación de usuario (/api/auth)", () => {

  let adminToken: string;
  let user: TestAccount;
  let inactiveUser: TestAccount;
  const createdIds: string[] = [];
  const registeredEmail = testEmail("registro");

  beforeAll(async () => {
    adminToken = await loginAdmin();
    user = await createAccount(adminToken, "auth");
    inactiveUser = await createAccount(adminToken, "auth-inactivo");
    createdIds.push(user.id, inactiveUser.id);
    await api("DELETE", `/admin/user/${inactiveUser.id}`, { token: adminToken });
  });

  afterAll(async () => {
    const list = await api("GET", `/admin/user/?query=${encodeURIComponent(registeredEmail)}`, { token: adminToken });
    const registered = (list.body.results ?? []).map((u: { id: string }) => u.id);
    await deactivateAccounts(adminToken, [...createdIds, ...registered]);
  });

  describe("Registro y validación de email", () => {

    // Envía un correo real de validación a una dirección @mindsave.test (no entregable).
    test("CP-AUTH-01 Registrar una cuenta con datos válidos", async () => {
      const res = await api("POST", "/api/auth/register", {
        json: { email: registeredEmail, name: "QA Registro", password: TEST_PASSWORD },
      });

      expect(res.status).toBe(201);
      expect(res.body.email).toBe(registeredEmail);
      expect(res.body.emailVerified).toBe(false);
      expect(res.body.password).toBe("");
    });

    test("CP-AUTH-02 Rechazar el registro con un email existente", async () => {
      const res = await api("POST", "/api/auth/register", {
        json: { email: user.email, name: "Duplicado", password: TEST_PASSWORD },
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Email already exists");
    });

    test.each([
      ["email inválido", { email: "no-es-email", name: "QA", password: TEST_PASSWORD }],
      ["nombre de 1 carácter", { email: testEmail("x1"), name: "Q", password: TEST_PASSWORD }],
      ["contraseña de 5 caracteres", { email: testEmail("x2"), name: "QA", password: "12345" }],
      ["body vacío", {}],
    ])("CP-AUTH-03 Rechazar el registro con %s", async (_caso, body) => {
      const res = await api("POST", "/api/auth/register", { json: body });

      expect(res.status).toBe(400);
    });

    test("CP-AUTH-04 Impedir el login de una cuenta con email no verificado", async () => {
      const res = await api("POST", "/api/auth/login", { json: { email: registeredEmail, password: TEST_PASSWORD } });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe("EMAIL_NOT_VERIFIED");
    });

    test("CP-AUTH-05 Validar el email con un token vigente y luego iniciar sesión", async () => {
      const token = signToken({ email: registeredEmail }, "email-verification", "24h");

      const res = await api("GET", `/api/auth/validate-email/${token}`);
      expect(res.status).toBe(200);
      expect(res.headers.get("content-type")).toContain("text/html");

      const login = await api("POST", "/api/auth/login", { json: { email: registeredEmail, password: TEST_PASSWORD } });
      expect(login.status).toBe(200);
    });

    test.each([
      ["un token mal formado", () => "token-invalido"],
      ["un token de otro propósito", () => signToken({ email: registeredEmail }, "session")],
      ["un token vencido", () => signToken({ email: registeredEmail }, "email-verification", "-1s")],
    ])("CP-AUTH-06 Rechazar la validación de email con %s", async (_caso, makeToken) => {
      const res = await api("GET", `/api/auth/validate-email/${makeToken()}`);

      expect(res.status).toBe(400);
      expect(res.headers.get("content-type")).toContain("text/html");
    });

    test("CP-AUTH-07 Reenviar validación responde OK sin revelar si la cuenta existe", async () => {
      const res = await api("POST", "/api/auth/resend-validation-email", { json: { email: testEmail("no-existe") } });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("OK");
    });

    test("CP-AUTH-08 Rechazar el reenvío de validación con un email inválido", async () => {
      const res = await api("POST", "/api/auth/resend-validation-email", { json: { email: "invalido" } });

      expect(res.status).toBe(400);
    });

  });

  describe("Login y sesión", () => {

    test("CP-AUTH-09 Iniciar sesión con credenciales válidas", async () => {
      const res = await api("POST", "/api/auth/login", { json: { email: user.email, password: user.password } });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ id: user.id, email: user.email, name: user.name, role: "USER_ROL" });
      expect(res.body.id).toMatch(UUID_RE);
      expect(typeof res.body.token).toBe("string");
      expect(res.body.password).toBeUndefined();
    });

    test("CP-AUTH-10 Rechazar el login con contraseña incorrecta", async () => {
      const res = await api("POST", "/api/auth/login", { json: { email: user.email, password: "Incorrecta1" } });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Invalid password");
    });

    test("CP-AUTH-11 Rechazar el login con un email no registrado", async () => {
      const res = await api("POST", "/api/auth/login", { json: { email: testEmail("fantasma"), password: TEST_PASSWORD } });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Email not found");
    });

    test("CP-AUTH-12 Rechazar el login de una cuenta desactivada", async () => {
      const res = await api("POST", "/api/auth/login", { json: { email: inactiveUser.email, password: TEST_PASSWORD } });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("User is deleted or ban");
    });

    test("CP-AUTH-13 Rechazar el login de un administrador en la API de usuario", async () => {
      const res = await api("POST", "/api/auth/login", {
        json: { email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD },
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("INCORRET_ROLE");
    });

    test("CP-AUTH-14 Rechazar el login con body inválido", async () => {
      const res = await api("POST", "/api/auth/login", { json: { email: "x", password: "1" } });

      expect(res.status).toBe(400);
    });

    test("CP-AUTH-15 Revalidar la sesión y renovar el token", async () => {
      const token = await loginUser(user.email);

      const res = await api("GET", "/api/auth/check-status", { token });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ id: user.id, email: user.email, role: "USER_ROL" });
      expect(typeof res.body.token).toBe("string");
    });

    test.each([
      ["sin header Authorization", {}, "No token provided"],
      ["con esquema distinto de Bearer", { Authorization: "Basic abc" }, "Invalid Bearer token"],
      ["con un JWT inválido", { Authorization: "Bearer abc.def.ghi" }, "Invalid token"],
    ])("CP-AUTH-16 Rechazar check-status %s", async (_caso, headers, error) => {
      const res = await api("GET", "/api/auth/check-status", { headers });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe(error);
    });

    test("CP-AUTH-17 Rechazar un token de sesión vencido", async () => {
      const token = signToken({ id: user.id, email: user.email, name: user.name, role: "USER_ROL" }, "session", "-1s");

      const res = await api("GET", "/api/auth/check-status", { token });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe("Invalid token");
    });

    test("CP-AUTH-18 Rechazar un token de validación de email usado como sesión", async () => {
      const token = signToken({ id: user.id, email: user.email }, "email-verification");

      const res = await api("GET", "/api/auth/check-status", { token });

      expect(res.status).toBe(401);
    });

    test("CP-AUTH-19 Rechazar un token de sesión de una cuenta desactivada", async () => {
      const token = signToken({ id: inactiveUser.id, email: inactiveUser.email, name: inactiveUser.name, role: "USER_ROL" }, "session");

      const res = await api("GET", "/api/auth/check-status", { token });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe("Invalid Bearer token - user");
    });

    test("CP-AUTH-20 Rechazar un token de administrador en rutas de usuario", async () => {
      const res = await api("GET", "/api/auth/check-status", { token: adminToken });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe("Invalid Bearer token - role");
    });

  });

  describe("Recuperación de contraseña", () => {

    test("CP-AUTH-21 Solicitar recuperación para un email no registrado responde OK", async () => {
      const res = await api("POST", "/api/auth/reset-password", { json: { email: testEmail("sin-cuenta") } });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("OK");
    });

    test("CP-AUTH-22 Rechazar la solicitud de recuperación con un email inválido", async () => {
      const res = await api("POST", "/api/auth/reset-password", { json: { email: "invalido" } });

      expect(res.status).toBe(400);
    });

    test("CP-AUTH-23 Mostrar página de token inválido en el formulario de recuperación", async () => {
      const res = await api("GET", "/api/auth/reset-password/token-invalido");

      expect(res.status).toBe(400);
      expect(res.headers.get("content-type")).toContain("text/html");
    });

    test("CP-AUTH-24 Rechazar un token de recuperación válido que no coincide con el almacenado", async () => {
      const token = signToken({ email: user.email }, "password-reset", "15m");

      const page = await api("GET", `/api/auth/reset-password/${token}`);
      const change = await api("POST", `/api/auth/reset-password/${token}`, { urlencoded: { password: "NuevaClave1" } });

      expect(page.status).toBe(400);
      expect(change.status).toBe(400);
      expect(await loginUser(user.email)).toBeTruthy();
    });

    test("CP-AUTH-25 Rechazar una nueva contraseña de menos de 6 caracteres", async () => {
      const token = signToken({ email: user.email }, "password-reset", "15m");

      const res = await api("POST", `/api/auth/reset-password/${token}`, { json: { password: "123" } });

      expect(res.status).toBe(400);
    });

  });

});
