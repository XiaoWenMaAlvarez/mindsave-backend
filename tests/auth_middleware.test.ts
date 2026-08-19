import { describe, test, expect, jest, beforeEach } from "@jest/globals";
import express from 'express';
import request from 'supertest';
import { AuthMiddleware } from '../src/presentation/middlewares/auth.middlewares.js';
import { JwtAdapter } from '../src/config/jwt.adapter.js';

describe("AuthMiddleware - Session injection in req.user", () => {
  let app: express.Express;

  beforeEach(() => {
    jest.restoreAllMocks();

    app = express();
    // Intentionally no body parser to test GET/DELETE without body mutation
    app.get('/test-user-session', [AuthMiddleware.validateJWTUser], (req: express.Request, res: express.Response) => {
      res.json({
        user: req.user,
        localsUser: res.locals.user,
        bodyWasMutated: req.body !== undefined
      });
    });

    app.get('/test-admin-session', [AuthMiddleware.validateJWTAdmin], (req: express.Request, res: express.Response) => {
      res.json({ user: req.user });
    });
  });

  test("Debe inyectar el usuario en req.user y res.locals.user sin mutar req.body", async () => {
    const mockUser = {
      id: "u-123",
      email: "user@example.com",
      name: "Usuario Test",
      role: "USER_ROL"
    };

    jest.spyOn(JwtAdapter, 'validateToken').mockReturnValue(mockUser as any);

    const res = await request(app)
      .get('/test-user-session')
      .set('Authorization', 'Bearer valid-token');

    expect(res.status).toBe(200);
    expect(res.body.user).toEqual(mockUser);
    expect(res.body.localsUser).toEqual(mockUser);
    expect(res.body.bodyWasMutated).toBe(false);
  });

  test("Debe rechazar token si el rol no coincide (401)", async () => {
    const mockUser = {
      id: "u-123",
      email: "user@example.com",
      name: "Usuario Test",
      role: "USER_ROL"
    };

    jest.spyOn(JwtAdapter, 'validateToken').mockReturnValue(mockUser as any);

    const res = await request(app)
      .get('/test-admin-session')
      .set('Authorization', 'Bearer valid-token');

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: "Invalid Bearer token - role" });
  });

  test("Debe rechazar si no se envía Authorization header (401)", async () => {
    const res = await request(app).get('/test-user-session');
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: "No token provided" });
  });
});
