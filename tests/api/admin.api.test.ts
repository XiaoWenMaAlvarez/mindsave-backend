import { describe, test, expect, beforeAll, afterAll } from "@jest/globals";
import {
  api, createAccount, deactivateAccounts, loginAdmin, loginUser, testEmail, RUN_ID,
  NON_EXISTENT_UUID, TEST_PASSWORD, UUID_RE, type TestAccount,
} from "./helpers.js";

describe("Administración (/admin)", () => {

  let adminToken: string;
  let user: TestAccount;
  const createdIds: string[] = [];

  beforeAll(async () => {
    adminToken = await loginAdmin();
    user = await createAccount(adminToken, "adm-base");
    createdIds.push(user.id);
  });

  afterAll(async () => {
    await deactivateAccounts(adminToken, createdIds);
  });

  describe("Autenticación profesional", () => {

    test("CP-ADM-01 Iniciar sesión como administrador", async () => {
      const res = await api("POST", "/admin/auth/login", {
        json: { email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD },
      });

      expect(res.status).toBe(200);
      expect(res.body.role).toBe("PROFESIONAL_ROL");
      expect(typeof res.body.token).toBe("string");
    });

    test("CP-ADM-02 Rechazar el login de administrador con contraseña incorrecta", async () => {
      const res = await api("POST", "/admin/auth/login", { json: { email: process.env.ADMIN_EMAIL, password: "Incorrecta1" } });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Invalid password");
    });

    test("CP-ADM-03 Rechazar el login de administrador con una cuenta USER_ROL", async () => {
      const res = await api("POST", "/admin/auth/login", { json: { email: user.email, password: TEST_PASSWORD } });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("User not found");
    });

    test("CP-ADM-04 Revalidar la sesión de administrador", async () => {
      const res = await api("GET", "/admin/auth/check-status", { token: adminToken });

      expect(res.status).toBe(200);
      expect(res.body.role).toBe("PROFESIONAL_ROL");
      expect(typeof res.body.token).toBe("string");
    });

    test("CP-ADM-05 Rechazar un token de usuario en rutas de administración", async () => {
      const userToken = await loginUser(user.email);

      const res = await api("GET", "/admin/user/", { token: userToken });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe("Invalid Bearer token - role");
    });

    test("CP-ADM-06 Rechazar las rutas de administración sin token", async () => {
      const responses = await Promise.all([
        api("GET", "/admin/user/"),
        api("POST", "/admin/user/", { json: {} }),
        api("GET", `/admin/user/${user.id}`),
        api("PUT", `/admin/user/${user.id}`, { json: {} }),
        api("DELETE", `/admin/user/${user.id}`),
        api("PUT", `/admin/user/restore-user/${user.id}`),
      ]);

      responses.forEach(res => expect(res.status).toBe(401));
    });

  });

  describe("Gestión de cuentas", () => {

    test("CP-ADM-07 Crear una cuenta USER_ROL verificada", async () => {
      const email = testEmail("adm-crear");
      const res = await api("POST", "/admin/user/", {
        token: adminToken,
        json: { email, name: "QA Crear", password: TEST_PASSWORD, emailVerified: true, role: "USER_ROL" },
      });
      if (res.body?.id) createdIds.push(res.body.id);

      expect(res.status).toBe(201);
      expect(res.body.id).toMatch(UUID_RE);
      expect(res.body).toMatchObject({ email, role: "USER_ROL", emailVerified: true, isActive: true, password: "" });
      expect(await loginUser(email)).toBeTruthy();
    });

    test("CP-ADM-08 Crear una cuenta PROFESIONAL_ROL", async () => {
      const res = await api("POST", "/admin/user/", {
        token: adminToken,
        json: { email: testEmail("adm-prof"), name: "QA Profesional", password: TEST_PASSWORD, emailVerified: true, role: "PROFESIONAL_ROL" },
      });
      if (res.body?.id) createdIds.push(res.body.id);

      expect(res.status).toBe(201);
      expect(res.body.role).toBe("PROFESIONAL_ROL");
    });

    test("CP-ADM-09 Rechazar la creación con un email existente", async () => {
      const res = await api("POST", "/admin/user/", {
        token: adminToken,
        json: { email: user.email, name: "Duplicado", password: TEST_PASSWORD, emailVerified: true, role: "USER_ROL" },
      });

      expect(res.status).toBe(400);
    });

    test.each([
      ["rol inexistente", { role: "SUPER_ROL" }],
      ["email inválido", { email: "invalido" }],
      ["contraseña corta", { password: "123" }],
      ["sin emailVerified", { emailVerified: undefined }],
    ])("CP-ADM-10 Rechazar la creación con %s", async (_caso, override) => {
      const body = { email: testEmail("adm-invalido"), name: "QA", password: TEST_PASSWORD, emailVerified: true, role: "USER_ROL", ...override };

      const res = await api("POST", "/admin/user/", { token: adminToken, json: body });
      if (res.body?.id) createdIds.push(res.body.id);

      expect(res.status).toBe(400);
    });

    test("CP-ADM-11 Listar cuentas con la paginación por defecto", async () => {
      const res = await api("GET", "/admin/user/", { token: adminToken });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ page: 1, limit: 10 });
      expect(Array.isArray(res.body.results)).toBe(true);
      expect(res.body.results.length).toBeLessThanOrEqual(10);
      expect(res.body.totalPages).toBeGreaterThanOrEqual(1);
      res.body.results.forEach((u: { password: string }) => expect(u.password).toBe(""));
    });

    test("CP-ADM-12 Buscar cuentas por texto sin distinguir mayúsculas", async () => {
      const res = await api("GET", `/admin/user/?query=${encodeURIComponent(`QA.${RUN_ID}`.toUpperCase())}&limit=100`, { token: adminToken });

      expect(res.status).toBe(200);
      expect(res.body.results.length).toBeGreaterThan(0);
      res.body.results.forEach((u: { email: string }) => expect(u.email).toContain(RUN_ID));
    });

    test.each([
      ["rol USER_ROL", "rol=USER_ROL", (u: any) => u.role === "USER_ROL"],
      ["rol PROFESIONAL_ROL", "rol=PROFESIONAL_ROL", (u: any) => u.role === "PROFESIONAL_ROL"],
      ["estado activo", "state=active", (u: any) => u.isActive === true],
      ["estado inactivo", "state=inactive", (u: any) => u.isActive === false],
      ["email verificado", "emailVerify=verify", (u: any) => u.emailVerified === true],
      ["email no verificado", "emailVerify=unverify", (u: any) => u.emailVerified === false],
    ])("CP-ADM-13 Filtrar cuentas por %s", async (_caso, filter, predicate) => {
      const res = await api("GET", `/admin/user/?${filter}&limit=100`, { token: adminToken });

      expect(res.status).toBe(200);
      res.body.results.forEach((u: any) => expect(predicate(u)).toBe(true));
    });

    test("CP-ADM-14 Paginar el listado de cuentas", async () => {
      const page1 = await api("GET", `/admin/user/?query=${RUN_ID}&limit=1&page=1`, { token: adminToken });
      const page2 = await api("GET", `/admin/user/?query=${RUN_ID}&limit=1&page=2`, { token: adminToken });

      expect(page1.status).toBe(200);
      expect(page2.status).toBe(200);
      expect(page1.body.results).toHaveLength(1);
      expect(page2.body.results).toHaveLength(1);
      expect(page1.body.results[0].id).not.toBe(page2.body.results[0].id);
      expect(page1.body.totalPages).toBeGreaterThanOrEqual(2);
    });

    test.each([
      ["page=0", "page=0"],
      ["limit=0", "limit=0"],
      ["limit=1000", "limit=1000"],
      ["query de 101 caracteres", `query=${"a".repeat(101)}`],
      ["rol desconocido", "rol=OTRO"],
      ["state desconocido", "state=borrado"],
    ])("CP-ADM-15 Rechazar el listado con %s", async (_caso, params) => {
      const res = await api("GET", `/admin/user/?${params}`, { token: adminToken });

      expect(res.status).toBe(400);
    });

    test("CP-ADM-16 Obtener una cuenta por ID", async () => {
      const res = await api("GET", `/admin/user/${user.id}`, { token: adminToken });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ id: user.id, email: user.email, password: "" });
    });

    test.each([
      ["un ID que no es UUID", "123", 400],
      ["un UUID inexistente", NON_EXISTENT_UUID, 400],
    ])("CP-ADM-17 Rechazar la consulta de cuenta con %s", async (_caso, id, status) => {
      const res = await api("GET", `/admin/user/${id}`, { token: adminToken });

      expect(res.status).toBe(status);
    });

    test("CP-ADM-18 Editar nombre y email de una cuenta", async () => {
      const target = await createAccount(adminToken, "adm-editar");
      createdIds.push(target.id);
      const newEmail = testEmail("adm-editado");

      const res = await api("PUT", `/admin/user/${target.id}`, { token: adminToken, json: { name: "QA Editado", email: newEmail } });
      const detail = await api("GET", `/admin/user/${target.id}`, { token: adminToken });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("success");
      expect(detail.body).toMatchObject({ name: "QA Editado", email: newEmail });
    });

    test("CP-ADM-19 Cambiar la contraseña de una cuenta", async () => {
      const target = await createAccount(adminToken, "adm-clave");
      createdIds.push(target.id);

      const res = await api("PUT", `/admin/user/${target.id}`, { token: adminToken, json: { password: "OtraClave99" } });

      expect(res.status).toBe(200);
      expect(await loginUser(target.email, "OtraClave99")).toBeTruthy();
      const oldLogin = await api("POST", "/api/auth/login", { json: { email: target.email, password: TEST_PASSWORD } });
      expect(oldLogin.status).toBe(400);
    });

    test("CP-ADM-20 Rechazar la edición con un email de otra cuenta", async () => {
      const target = await createAccount(adminToken, "adm-dup");
      createdIds.push(target.id);

      const res = await api("PUT", `/admin/user/${target.id}`, { token: adminToken, json: { email: user.email } });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Email already exists");
    });

    test("CP-ADM-21 Rechazar la edición de un ID inexistente", async () => {
      const res = await api("PUT", `/admin/user/${NON_EXISTENT_UUID}`, { token: adminToken, json: { name: "Nadie" } });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("ID not found");
    });

    test("CP-ADM-22 Desactivar una cuenta bloquea su acceso", async () => {
      const target = await createAccount(adminToken, "adm-baja");
      createdIds.push(target.id);
      const sessionToken = await loginUser(target.email);

      const res = await api("DELETE", `/admin/user/${target.id}`, { token: adminToken });
      const detail = await api("GET", `/admin/user/${target.id}`, { token: adminToken });
      const login = await api("POST", "/api/auth/login", { json: { email: target.email, password: TEST_PASSWORD } });
      const session = await api("GET", "/api/auth/check-status", { token: sessionToken });

      expect(res.status).toBe(200);
      expect(detail.body.isActive).toBe(false);
      expect(login.status).toBe(400);
      expect(session.status).toBe(401);
    });

    test("CP-ADM-23 Restaurar una cuenta desactivada recupera su acceso", async () => {
      const target = await createAccount(adminToken, "adm-restaurar");
      createdIds.push(target.id);
      await api("DELETE", `/admin/user/${target.id}`, { token: adminToken });

      const res = await api("PUT", `/admin/user/restore-user/${target.id}`, { token: adminToken });
      const detail = await api("GET", `/admin/user/${target.id}`, { token: adminToken });

      expect(res.status).toBe(200);
      expect(detail.body.isActive).toBe(true);
      expect(await loginUser(target.email)).toBeTruthy();
    });

    test("CP-ADM-24 Rechazar desactivar o restaurar un ID inexistente", async () => {
      const del = await api("DELETE", `/admin/user/${NON_EXISTENT_UUID}`, { token: adminToken });
      const restore = await api("PUT", `/admin/user/restore-user/${NON_EXISTENT_UUID}`, { token: adminToken });

      expect(del.status).toBe(404);
      expect(restore.status).toBe(404);
    });

  });

});
