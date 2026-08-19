import { describe, test, expect, beforeEach } from "@jest/globals";
import express from 'express';
import request from 'supertest';
import { AppRoutes } from '../src/presentation/routes.js';

describe("Swagger / OpenAPI Documentation Endpoints", () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use(AppRoutes.routes);
  });

  test("Debe servir la especificación OpenAPI 3.0 en formato JSON en /api-docs.json (200)", async () => {
    const res = await request(app).get('/api-docs.json');

    expect(res.status).toBe(200);
    expect(res.body.openapi).toBe("3.0.3");
    expect(res.body.info.title).toBe("MindSave Backend API");
    expect(res.body.paths).toBeDefined();
    expect(res.body.paths["/api/auth/login"]).toBeDefined();
    expect(res.body.paths["/api/chat-ia/send-message-to-chat/{idChat}"]).toBeDefined();
    expect(res.body.components.securitySchemes.bearerAuth).toBeDefined();
  });

  test("Debe servir la interfaz Swagger UI HTML en /api-docs (200 / 301 redirect)", async () => {
    const res = await request(app).get('/api-docs/');

    expect([200, 301, 302]).toContain(res.status);
    if (res.status === 200) {
      expect(res.text).toContain("Swagger UI");
    }
  });

  test("Debe responder en el endpoint /health con status ok", async () => {
    const res = await request(app).get('/health');
    expect([200, 503]).toContain(res.status);
    expect(res.body.services).toBeDefined();
  });
});
