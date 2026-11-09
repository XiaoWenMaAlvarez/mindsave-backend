import "dotenv/config";
import jwt from "jsonwebtoken";
import { expect } from "@jest/globals";

export const BASE_URL = process.env.API_BASE_URL ?? "http://localhost:3000";

// Identificador único por ejecución para aislar los datos creados por la suite.
export const RUN_ID = `${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`;

export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const NON_EXISTENT_UUID = "00000000-0000-4000-8000-000000000000";
export const TEST_PASSWORD = "Prueba123";

export interface ApiResponse<T = any> {
  status: number;
  body: T;
  text: string;
  headers: Headers;
}

interface RequestOptions {
  token?: string | undefined;
  json?: unknown;
  form?: FormData;
  urlencoded?: Record<string, string>;
  headers?: Record<string, string>;
}

export async function api<T = any>(method: string, path: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
  const headers: Record<string, string> = { ...(options.headers ?? {}) };
  let body: BodyInit | undefined;

  if (options.token) headers["Authorization"] = `Bearer ${options.token}`;
  if (options.json !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(options.json);
  } else if (options.form) {
    body = options.form;
  } else if (options.urlencoded) {
    headers["Content-Type"] = "application/x-www-form-urlencoded";
    body = new URLSearchParams(options.urlencoded).toString();
  }

  const response = await fetch(`${BASE_URL}${path}`, { method, headers, body: body ?? null });
  const text = await response.text();
  let parsed: any = text;
  if ((response.headers.get("content-type") ?? "").includes("application/json")) {
    parsed = text.length ? JSON.parse(text) : null;
  }
  return { status: response.status, body: parsed, text, headers: response.headers };
}

export function testEmail(label: string): string {
  return `qa.${RUN_ID}.${label}@mindsave.test`.toLowerCase();
}

export async function loginAdmin(): Promise<string> {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) throw new Error("ADMIN_EMAIL y ADMIN_PASSWORD deben estar definidos en .env");

  const res = await api("POST", "/admin/auth/login", { json: { email, password } });
  expect(res.status).toBe(200);
  return res.body.token;
}

export interface TestAccount {
  id: string;
  email: string;
  password: string;
  name: string;
}

export async function createAccount(
  adminToken: string,
  label: string,
  overrides: Partial<{ role: string; emailVerified: boolean; name: string }> = {},
): Promise<TestAccount> {
  const account = {
    email: testEmail(label),
    name: overrides.name ?? `QA ${label}`,
    password: TEST_PASSWORD,
    emailVerified: overrides.emailVerified ?? true,
    role: overrides.role ?? "USER_ROL",
  };
  const res = await api("POST", "/admin/user/", { token: adminToken, json: account });
  expect(res.status).toBe(201);
  return { id: res.body.id, email: account.email, password: account.password, name: account.name };
}

export async function loginUser(email: string, password: string = TEST_PASSWORD): Promise<string> {
  const res = await api("POST", "/api/auth/login", { json: { email, password } });
  expect(res.status).toBe(200);
  return res.body.token;
}

// Desactiva (baja lógica) las cuentas creadas por la suite; no existe borrado físico en la API.
export async function deactivateAccounts(adminToken: string, ids: string[]): Promise<void> {
  for (const id of ids) {
    await api("DELETE", `/admin/user/${id}`, { token: adminToken });
  }
}

type Purpose = "session" | "email-verification" | "password-reset";
const SECRETS: Record<Purpose, string | undefined> = {
  session: process.env.JWT_SEED,
  "email-verification": process.env.JWT_EMAIL_VERIFICATION_SEED,
  "password-reset": process.env.JWT_PASSWORD_RESET_SEED,
};

// Firma un JWT con los mismos parámetros del backend (pruebas de caja blanca).
export function signToken(payload: object, purpose: Purpose, expiresIn: jwt.SignOptions["expiresIn"] = "1h", tokenPurpose: string = purpose): string {
  const secret = SECRETS[purpose];
  if (!secret) throw new Error(`Falta el secreto JWT para ${purpose} en .env`);
  return jwt.sign({ ...payload, purpose: tokenPurpose }, secret, {
    algorithm: "HS256",
    audience: `mindsave:${purpose}`,
    issuer: "mindsave-backend",
    expiresIn,
  });
}
