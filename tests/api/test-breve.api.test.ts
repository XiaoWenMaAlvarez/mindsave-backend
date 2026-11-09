import { describe, test, expect, beforeAll, afterAll } from "@jest/globals";
import { api, createAccount, deactivateAccounts, loginAdmin, loginUser, type TestAccount } from "./helpers.js";

const BASE = "/api/test-breve-estado-de-animo";

function buildTest(fecha: string, valor = 1, notas: string | null = null) {
  return {
    fecha,
    notas,
    depresion: { tristeza: valor, desesperanza: 0, bajaAutoestima: valor, faltaDeValor: 0, perdidaDeSatisfaccion: valor },
    impulsoSuicida: { pensamientosSuicidas: 0, deseosDeMorir: 0 },
    ansiedadFisica: {
      palpitaciones: 0, sudoracion: 0, temblores: 0, dificultadRespirar: 0, ahogo: 0,
      dolorPecho: 0, nauseas: 0, mareos: 0, sensacionIrrealidad: 0, inestabilidadHormigueos: valor,
    },
    ansiedadEmocional: { angustiado: valor, nervioso: valor, preocupado: 2, asustado: 0, tenso: 4 },
  };
}

describe("Test breve de estado de ánimo (/api/test-breve-estado-de-animo)", () => {

  let adminToken: string;
  let userA: TestAccount;
  let userB: TestAccount;
  let tokenA: string;
  let tokenB: string;

  beforeAll(async () => {
    adminToken = await loginAdmin();
    userA = await createAccount(adminToken, "tb-a");
    userB = await createAccount(adminToken, "tb-b");
    tokenA = await loginUser(userA.email);
    tokenB = await loginUser(userB.email);
  });

  afterAll(async () => {
    await deactivateAccounts(adminToken, [userA.id, userB.id]);
  });

  test("CP-TB-01 Crear el test del día", async () => {
    const res = await api("POST", `${BASE}/`, { token: tokenA, json: buildTest("2025-03-10T15:00:00.000Z", 1, "Nota de prueba") });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe("success");
  });

  test("CP-TB-02 Consultar el test por fecha con los valores guardados", async () => {
    const res = await api("GET", `${BASE}/by-date/2025/3/10`, { token: tokenA });

    expect(res.status).toBe(200);
    expect(res.body.idUsuario).toBe(userA.id);
    expect(res.body.notas).toBe("Nota de prueba");
    expect(res.body.depresion).toMatchObject({ tristeza: 1, bajaAutoestima: 1 });
    expect(res.body.ansiedadEmocional).toMatchObject({ preocupado: 2, tenso: 4 });
  });

  test("CP-TB-03 Consultar una fecha sin test responde null", async () => {
    const res = await api("GET", `${BASE}/by-date/2025/3/11`, { token: tokenA });

    expect(res.status).toBe(200);
    expect(res.body).toBeNull();
  });

  test("CP-TB-04 Crear un segundo test para la misma fecha lo reemplaza", async () => {
    const res = await api("POST", `${BASE}/`, { token: tokenA, json: buildTest("2025-03-10T20:00:00.000Z", 3) });
    const year = await api("GET", `${BASE}/by-year/2025`, { token: tokenA });

    expect(res.status).toBe(201);
    const delDia = year.body.filter((t: { fecha: string }) => t.fecha.startsWith("2025-03-10"));
    expect(delDia).toHaveLength(1);
    expect(delDia[0].depresion.tristeza).toBe(3);
  });

  test("CP-TB-05 Listar los tests de un año", async () => {
    await api("POST", `${BASE}/`, { token: tokenA, json: buildTest("2025-07-01T12:00:00.000Z", 2) });

    const res = await api("GET", `${BASE}/by-year/2025`, { token: tokenA });
    const otherYear = await api("GET", `${BASE}/by-year/2024`, { token: tokenA });

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(otherYear.status).toBe(200);
    expect(otherYear.body).toEqual([]);
  });

  test("CP-TB-06 Editar el test de una fecha", async () => {
    const res = await api("PUT", `${BASE}/`, { token: tokenA, json: buildTest("2025-07-01T12:00:00.000Z", 4, "Editado") });
    const detail = await api("GET", `${BASE}/by-date/2025/7/1`, { token: tokenA });

    expect(res.status).toBe(200);
    expect(detail.body.depresion.tristeza).toBe(4);
    expect(detail.body.notas).toBe("Editado");
  });

  test("CP-TB-07 Rechazar la edición de una fecha sin test", async () => {
    const res = await api("PUT", `${BASE}/`, { token: tokenA, json: buildTest("2025-01-01T12:00:00.000Z") });

    expect(res.status).toBe(404);
  });

  test.each([
    ["un ítem con valor 5", { ...buildTest("2025-05-05T12:00:00.000Z"), impulsoSuicida: { pensamientosSuicidas: 5, deseosDeMorir: 0 } }],
    ["un ítem con valor -1", { ...buildTest("2025-05-05T12:00:00.000Z"), impulsoSuicida: { pensamientosSuicidas: -1, deseosDeMorir: 0 } }],
    ["un ítem decimal", { ...buildTest("2025-05-05T12:00:00.000Z"), impulsoSuicida: { pensamientosSuicidas: 1.5, deseosDeMorir: 0 } }],
    ["notas de 501 caracteres", buildTest("2025-05-05T12:00:00.000Z", 1, "a".repeat(501))],
    ["una fecha inválida", buildTest("no-es-fecha")],
    ["un componente faltante", (({ depresion, ...rest }) => rest)(buildTest("2025-05-05T12:00:00.000Z"))],
  ])("CP-TB-08 Rechazar la creación con %s", async (_caso, body) => {
    const res = await api("POST", `${BASE}/`, { token: tokenA, json: body });

    expect(res.status).toBe(400);
  });

  test("CP-TB-09 Aceptar notas de exactamente 500 caracteres", async () => {
    const res = await api("POST", `${BASE}/`, { token: tokenA, json: buildTest("2025-05-06T12:00:00.000Z", 0, "a".repeat(500)) });

    expect(res.status).toBe(201);
    await api("DELETE", `${BASE}/2025/5/6`, { token: tokenA });
  });

  test.each([
    ["by-date/2025/2/30", "un 30 de febrero"],
    ["by-date/2025/13/1", "un mes 13"],
    ["by-date/abc/1/1", "un año no numérico"],
    ["by-year/abc", "un año no numérico en el listado"],
  ])("CP-TB-10 Rechazar la ruta %s (%s)", async (path) => {
    const res = await api("GET", `${BASE}/${path}`, { token: tokenA });

    expect(res.status).toBe(400);
  });

  test("CP-TB-11 Un usuario no ve ni modifica los tests de otro", async () => {
    const byDate = await api("GET", `${BASE}/by-date/2025/3/10`, { token: tokenB });
    const byYear = await api("GET", `${BASE}/by-year/2025`, { token: tokenB });
    const edit = await api("PUT", `${BASE}/`, { token: tokenB, json: buildTest("2025-03-10T15:00:00.000Z", 0) });
    const del = await api("DELETE", `${BASE}/2025/3/10`, { token: tokenB });

    expect(byDate.body).toBeNull();
    expect(byYear.body).toEqual([]);
    expect(edit.status).toBe(404);
    expect(del.status).toBe(404);
  });

  test("CP-TB-12 El idUsuario enviado en el body se ignora", async () => {
    const res = await api("POST", `${BASE}/`, { token: tokenB, json: { ...buildTest("2025-08-08T12:00:00.000Z"), idUsuario: userA.id } });
    const ofA = await api("GET", `${BASE}/by-date/2025/8/8`, { token: tokenA });
    const ofB = await api("GET", `${BASE}/by-date/2025/8/8`, { token: tokenB });

    expect(res.status).toBe(201);
    expect(ofA.body).toBeNull();
    expect(ofB.body.idUsuario).toBe(userB.id);
  });

  test("CP-TB-13 Eliminar el test de una fecha", async () => {
    const res = await api("DELETE", `${BASE}/2025/3/10`, { token: tokenA });
    const detail = await api("GET", `${BASE}/by-date/2025/3/10`, { token: tokenA });
    const again = await api("DELETE", `${BASE}/2025/3/10`, { token: tokenA });

    expect(res.status).toBe(200);
    expect(detail.body).toBeNull();
    expect(again.status).toBe(404);
  });

  test("CP-TB-14 Rechazar el acceso sin token", async () => {
    const res = await api("GET", `${BASE}/by-year/2025`);

    expect(res.status).toBe(401);
  });

});
