import { describe, test, expect } from "@jest/globals";
import { api } from "./helpers.js";

describe("Health check y documentación", () => {

  test("CP-SYS-01 GET /health informa el estado de la BD y los servicios externos", async () => {
    const res = await api("GET", "/health");

    expect(res.status).toBe(200);
    expect(["ok", "degraded"]).toContain(res.body.status);
    expect(res.body.services.database).toBe("connected");
    for (const service of ["gemini", "cloudinary", "mailer"]) {
      expect(["connected", "disconnected"]).toContain(res.body.services[service]);
    }
    expect(typeof res.body.uptime).toBe("number");
  });

  test("CP-SYS-02 GET /api-docs.json publica la especificación OpenAPI", async () => {
    const res = await api("GET", "/api-docs.json");

    expect(res.status).toBe(200);
    expect(res.body.openapi).toMatch(/^3\./);
    expect(Object.keys(res.body.paths).length).toBeGreaterThan(0);
  });

  test("CP-SYS-03 GET /api-docs sirve Swagger UI", async () => {
    const res = await api("GET", "/api-docs/");

    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/html");
  });

  test("CP-SYS-04 Una ruta inexistente no responde 200", async () => {
    const res = await api("GET", "/api/ruta-que-no-existe");

    expect(res.status).toBe(404);
  });

});
