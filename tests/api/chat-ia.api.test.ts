import { describe, test, expect, beforeAll, afterAll } from "@jest/globals";
import {
  api, createAccount, deactivateAccounts, loginAdmin, loginUser, RUN_ID, NON_EXISTENT_UUID, UUID_RE, type TestAccount,
} from "./helpers.js";

const BASE = "/api/chat-ia";

// PNG de 1x1 píxel.
const PNG_1X1 = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==", "base64");

function messageForm(prompt: string | null, files: { name: string; type: string; data: BlobPart }[] = []): FormData {
  const form = new FormData();
  if (prompt !== null) form.append("prompt", prompt);
  for (const file of files) form.append("files", new Blob([file.data], { type: file.type }), file.name);
  return form;
}

// Los casos CP-CHAT-05 y CP-CHAT-06 usan los servicios reales de Gemini y Cloudinary.
describe("Chat con IA (/api/chat-ia)", () => {

  let adminToken: string;
  let userA: TestAccount;
  let userB: TestAccount;
  let tokenA: string;
  let tokenB: string;
  let chatId: string;
  const title = `Chat QA ${RUN_ID}`;

  beforeAll(async () => {
    adminToken = await loginAdmin();
    userA = await createAccount(adminToken, "chat-a");
    userB = await createAccount(adminToken, "chat-b");
    tokenA = await loginUser(userA.email);
    tokenB = await loginUser(userB.email);
  });

  afterAll(async () => {
    if (chatId) await api("DELETE", `${BASE}/delete-chat/${chatId}`, { token: tokenA });
    await deactivateAccounts(adminToken, [userA.id, userB.id]);
  });

  test("CP-CHAT-01 Crear una conversación", async () => {
    const res = await api("POST", `${BASE}/new-chat`, { token: tokenA, json: { title } });

    expect(res.status).toBe(201);
    expect(res.body.result).toMatch(UUID_RE);
    chatId = res.body.result;
  });

  test.each([
    ["un título repetido", () => ({ title }), "Chat already exists"],
    ["un título vacío", () => ({ title: "" }), "Title is required"],
    ["sin título", () => ({}), "Title is required"],
  ])("CP-CHAT-02 Rechazar la creación con %s", async (_caso, body, error) => {
    const res = await api("POST", `${BASE}/new-chat`, { token: tokenA, json: body() });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe(error);
  });

  test("CP-CHAT-03 Listar las conversaciones del usuario", async () => {
    const res = await api("GET", `${BASE}/get-chats-by-user`, { token: tokenA });

    expect(res.status).toBe(200);
    const chat = res.body.results.find((c: { id: string }) => c.id === chatId);
    expect(chat).toMatchObject({ idUsuario: userA.id, title, mensajes: [] });
  });

  test("CP-CHAT-04 Obtener el historial de una conversación sin mensajes", async () => {
    const res = await api("GET", `${BASE}/get-messages-from-chat/${chatId}`, { token: tokenA });

    expect(res.status).toBe(200);
    expect(res.body.result).toMatchObject({ id: chatId, mensajes: [] });
  });

  test("CP-CHAT-05 Enviar un mensaje de texto y recibir la respuesta por streaming", async () => {
    const res = await api("POST", `${BASE}/send-message-to-chat/${chatId}`, { token: tokenA, form: messageForm("Hola, quiero empezar el ejercicio.") });
    const history = await api("GET", `${BASE}/get-messages-from-chat/${chatId}`, { token: tokenA });

    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/plain");
    expect(res.text.trim().length).toBeGreaterThan(0);
    expect(history.body.result.mensajes).toHaveLength(2);
    const roles = history.body.result.mensajes.map((m: { role: string }) => m.role).sort();
    expect(roles).toEqual(["model", "user"]);
    const modelMessage = history.body.result.mensajes.find((m: { role: string }) => m.role === "model");
    expect(modelMessage.text).toBe(res.text);
  });

  test("CP-CHAT-06 Enviar un mensaje con una imagen adjunta", async () => {
    const res = await api("POST", `${BASE}/send-message-to-chat/${chatId}`, {
      token: tokenA,
      form: messageForm("Te comparto esta imagen.", [{ name: "pixel.png", type: "image/png", data: PNG_1X1 }]),
    });
    const history = await api("GET", `${BASE}/get-messages-from-chat/${chatId}`, { token: tokenA });

    expect(res.status).toBe(200);
    expect(res.text.trim().length).toBeGreaterThan(0);
    const userMessages = history.body.result.mensajes.filter((m: { role: string }) => m.role === "user");
    const withFile = userMessages.find((m: { archivos: unknown[] }) => m.archivos.length === 1);
    expect(withFile.archivos[0].mimeType).toBe("image/png");
    expect(withFile.archivos[0].fileUrl).toMatch(/^https:\/\//);
  });

  test("CP-CHAT-07 El listado muestra solo el último mensaje de cada conversación", async () => {
    const res = await api("GET", `${BASE}/get-chats-by-user`, { token: tokenA });

    const chat = res.body.results.find((c: { id: string }) => c.id === chatId);
    expect(chat.mensajes).toHaveLength(1);
  });

  test.each([
    ["un tipo de archivo no permitido", () => messageForm("Hola", [{ name: "app.exe", type: "application/x-msdownload", data: "MZ" }])],
    ["más de 5 archivos", () => messageForm("Hola", Array.from({ length: 6 }, (_, i) => ({ name: `f${i}.txt`, type: "text/plain", data: "x" })))],
    ["un archivo de más de 5 MiB", () => messageForm("Hola", [{ name: "grande.txt", type: "text/plain", data: new Uint8Array(5 * 1024 * 1024 + 1) }])],
    ["un prompt vacío", () => messageForm("")],
    ["sin prompt", () => messageForm(null)],
  ])("CP-CHAT-08 Rechazar el envío con %s", async (_caso, form) => {
    const res = await api("POST", `${BASE}/send-message-to-chat/${chatId}`, { token: tokenA, form: form() });

    expect(res.status).toBe(400);
  });

  test("CP-CHAT-09 Rechazar operaciones con un ID de chat inválido o inexistente", async () => {
    const invalid = await api("GET", `${BASE}/get-messages-from-chat/123`, { token: tokenA });
    const missing = await api("GET", `${BASE}/get-messages-from-chat/${NON_EXISTENT_UUID}`, { token: tokenA });
    const send = await api("POST", `${BASE}/send-message-to-chat/${NON_EXISTENT_UUID}`, { token: tokenA, form: messageForm("Hola") });
    const del = await api("DELETE", `${BASE}/delete-chat/${NON_EXISTENT_UUID}`, { token: tokenA });

    expect(invalid.status).toBe(400);
    expect(missing.status).toBe(400);
    expect(send.status).toBe(400);
    expect(del.status).toBe(404);
  });

  test("CP-CHAT-10 Un usuario no accede a conversaciones de otro", async () => {
    const list = await api("GET", `${BASE}/get-chats-by-user`, { token: tokenB });
    const history = await api("GET", `${BASE}/get-messages-from-chat/${chatId}`, { token: tokenB });
    const send = await api("POST", `${BASE}/send-message-to-chat/${chatId}`, { token: tokenB, form: messageForm("Hola") });
    const del = await api("DELETE", `${BASE}/delete-chat/${chatId}`, { token: tokenB });

    expect(list.body.results).toEqual([]);
    expect(history.status).toBe(400);
    expect(send.status).toBe(400);
    expect(del.status).toBe(404);
  });

  test("CP-CHAT-11 Eliminar una conversación con sus archivos", async () => {
    const res = await api("DELETE", `${BASE}/delete-chat/${chatId}`, { token: tokenA });
    const history = await api("GET", `${BASE}/get-messages-from-chat/${chatId}`, { token: tokenA });

    expect(res.status).toBe(200);
    expect(res.body.result).toBe("success");
    expect(history.status).toBe(400);
    chatId = "";
  });

  test("CP-CHAT-12 Rechazar el acceso sin token", async () => {
    const res = await api("GET", `${BASE}/get-chats-by-user`);

    expect(res.status).toBe(401);
  });

});
