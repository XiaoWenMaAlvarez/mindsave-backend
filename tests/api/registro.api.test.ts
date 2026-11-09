import { describe, test, expect, beforeAll, afterAll } from "@jest/globals";
import {
  api, createAccount, deactivateAccounts, loginAdmin, loginUser, NON_EXISTENT_UUID, UUID_RE, type TestAccount,
} from "./helpers.js";

const BASE = "/api/registro-estado-de-animo";

const EMOCIONES: Record<string, string[]> = {
  grupoEmociones1: ["triste", "melancolico", "deprimido", "decaido", "infeliz"],
  grupoEmociones2: ["angustiado", "preocupado", "conPanico", "nervioso", "asustado"],
  grupoEmociones3: ["culpable", "conRemordimiento", "malo", "avergonzado"],
  grupoEmociones4: ["inferior", "sinValor", "inadecuado", "deficiente", "incompetente"],
  grupoEmociones5: ["solitario", "noQuerido", "noDeseado", "rechazado", "solo", "abandonado"],
  grupoEmociones6: ["turbado", "tonto", "humillado", "apurado"],
  grupoEmociones7: ["desesperanzado", "desanimado", "pesimista", "descorazonado"],
  grupoEmociones8: ["frustrado", "atascado", "chasqueado", "derrotado"],
  grupoEmociones9: ["airado", "enfadado", "resentido", "molesto", "irritado", "trastornado", "furioso"],
};

const DISTORSION = [true, false, true, false, false, true, false, false, true, false];

// porcentajeDespues = null deja el registro pendiente; un número lo deja completo.
function buildRegistro(porcentajeDespues: number | null, suceso = "Discusión en el trabajo") {
  const grupos = Object.fromEntries(Object.entries(EMOCIONES).map(([grupo, emociones]) => [
    grupo,
    {
      ...Object.fromEntries(emociones.map((e, i) => [e, i === 0])),
      porcentajeCreenciaAntes: 80,
      porcentajeCreenciaDespues: porcentajeDespues,
    },
  ]));
  return {
    fecha: "2025-04-15T10:00:00.000Z",
    sucesoTrastornador: suceso,
    ...grupos,
    grupoEmocionesPersonalizadas: { listaEmociones: ["inquieto"], porcentajeCreenciaAntes: 50, porcentajeCreenciaDespues: porcentajeDespues },
    pensamientos: [{
      pensamientoNegativo: "Siempre me equivoco",
      porcentajeCreenciaAntes: 90,
      porcentajeCreenciaDespues: porcentajeDespues,
      pensamientoPositivo: porcentajeDespues === null ? null : "A veces me equivoco y aprendo",
      porcentajeCreenciaPositivo: porcentajeDespues === null ? null : 70,
      distorsion: DISTORSION,
    }],
  };
}

describe("Registro cognitivo de estado de ánimo (/api/registro-estado-de-animo)", () => {

  let adminToken: string;
  let userA: TestAccount;
  let userB: TestAccount;
  let tokenA: string;
  let tokenB: string;
  let registroId: string;

  beforeAll(async () => {
    adminToken = await loginAdmin();
    userA = await createAccount(adminToken, "rea-a");
    userB = await createAccount(adminToken, "rea-b");
    tokenA = await loginUser(userA.email);
    tokenB = await loginUser(userB.email);
  });

  afterAll(async () => {
    await deactivateAccounts(adminToken, [userA.id, userB.id]);
  });

  test("CP-REA-01 Crear un registro pendiente", async () => {
    const res = await api("POST", `${BASE}/`, { token: tokenA, json: buildRegistro(null) });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe("success");
    expect(res.body.id).toMatch(UUID_RE);
    registroId = res.body.id;
  });

  test("CP-REA-02 Consultar el registro por ID con su estructura completa", async () => {
    const res = await api("GET", `${BASE}/${registroId}`, { token: tokenA });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: registroId, idUsuario: userA.id, sucesoTrastornador: "Discusión en el trabajo" });
    expect(res.body.grupoEmociones1).toMatchObject({ triste: true, melancolico: false, porcentajeCreenciaAntes: 80, porcentajeCreenciaDespues: null });
    expect(res.body.grupoEmocionesPersonalizadas.listaEmociones).toEqual(["inquieto"]);
    expect(res.body.pensamientos).toHaveLength(1);
    expect(res.body.pensamientos[0].distorsion).toEqual(DISTORSION);
  });

  test("CP-REA-03 El registro pendiente aparece solo en la lista de pendientes", async () => {
    const pendientes = await api("GET", `${BASE}/pendientes`, { token: tokenA });
    const completos = await api("GET", `${BASE}/completos`, { token: tokenA });

    expect(pendientes.status).toBe(200);
    expect(pendientes.body.results.map((r: { id: string }) => r.id)).toContain(registroId);
    expect(completos.body.results.map((r: { id: string }) => r.id)).not.toContain(registroId);
  });

  test("CP-REA-04 Completar el registro lo mueve a la lista de completos", async () => {
    const res = await api("PUT", `${BASE}/`, { token: tokenA, json: { ...buildRegistro(30), id: registroId } });
    const pendientes = await api("GET", `${BASE}/pendientes`, { token: tokenA });
    const completos = await api("GET", `${BASE}/completos`, { token: tokenA });
    const detail = await api("GET", `${BASE}/${registroId}`, { token: tokenA });

    expect(res.status).toBe(200);
    expect(pendientes.body.results.map((r: { id: string }) => r.id)).not.toContain(registroId);
    expect(completos.body.results.map((r: { id: string }) => r.id)).toContain(registroId);
    expect(detail.body.pensamientos[0].pensamientoPositivo).toBe("A veces me equivoco y aprendo");
  });

  test("CP-REA-05 Paginar la lista de registros", async () => {
    await api("POST", `${BASE}/`, { token: tokenA, json: buildRegistro(null, "Registro 2") });
    await api("POST", `${BASE}/`, { token: tokenA, json: buildRegistro(null, "Registro 3") });

    const page1 = await api("GET", `${BASE}/pendientes?page=1&limit=1`, { token: tokenA });
    const page2 = await api("GET", `${BASE}/pendientes?page=2&limit=1`, { token: tokenA });

    expect(page1.status).toBe(200);
    expect(page1.body.results).toHaveLength(1);
    expect(page2.body.results).toHaveLength(1);
    expect(page1.body.results[0].id).not.toBe(page2.body.results[0].id);
  });

  test.each([
    ["page=0", "page=0"],
    ["limit=-1", "limit=-1"],
    ["page no numérico", "page=abc"],
  ])("CP-REA-06 Rechazar la paginación con %s", async (_caso, params) => {
    const res = await api("GET", `${BASE}/pendientes?${params}`, { token: tokenA });

    expect(res.status).toBe(400);
  });

  test.each([
    ["distorsión de 9 posiciones", (r: any) => ({ ...r, pensamientos: [{ ...r.pensamientos[0], distorsion: DISTORSION.slice(1) }] })],
    ["porcentaje de 101", (r: any) => ({ ...r, grupoEmociones1: { ...r.grupoEmociones1, porcentajeCreenciaAntes: 101 } })],
    ["suceso vacío", (r: any) => ({ ...r, sucesoTrastornador: "" })],
    ["un grupo de emociones faltante", ({ grupoEmociones9, ...r }: any) => r],
    ["pensamiento negativo vacío", (r: any) => ({ ...r, pensamientos: [{ ...r.pensamientos[0], pensamientoNegativo: "" }] })],
  ])("CP-REA-07 Rechazar la creación con %s", async (_caso, mutate) => {
    const res = await api("POST", `${BASE}/`, { token: tokenA, json: mutate(buildRegistro(null)) });

    expect(res.status).toBe(400);
  });

  test("CP-REA-08 Rechazar la consulta con un ID inválido o inexistente", async () => {
    const invalid = await api("GET", `${BASE}/123`, { token: tokenA });
    const missing = await api("GET", `${BASE}/${NON_EXISTENT_UUID}`, { token: tokenA });

    expect(invalid.status).toBe(400);
    expect(missing.status).toBe(404);
  });

  test("CP-REA-09 Un usuario no ve, edita ni elimina registros de otro", async () => {
    const get = await api("GET", `${BASE}/${registroId}`, { token: tokenB });
    const list = await api("GET", `${BASE}/completos`, { token: tokenB });
    const edit = await api("PUT", `${BASE}/`, { token: tokenB, json: { ...buildRegistro(10), id: registroId } });
    const del = await api("DELETE", `${BASE}/${registroId}`, { token: tokenB });
    const stillThere = await api("GET", `${BASE}/${registroId}`, { token: tokenA });

    expect(get.status).toBe(404);
    expect(list.body.results).toEqual([]);
    expect(edit.status).toBe(404);
    expect(del.status).toBe(404);
    expect(stillThere.status).toBe(200);
    expect(stillThere.body.grupoEmociones1.porcentajeCreenciaDespues).toBe(30);
  });

  test("CP-REA-10 Eliminar un registro", async () => {
    const res = await api("DELETE", `${BASE}/${registroId}`, { token: tokenA });
    const detail = await api("GET", `${BASE}/${registroId}`, { token: tokenA });

    expect(res.status).toBe(200);
    expect(detail.status).toBe(404);
  });

  test("CP-REA-11 Rechazar el acceso sin token", async () => {
    const res = await api("GET", `${BASE}/pendientes`);

    expect(res.status).toBe(401);
  });

});
