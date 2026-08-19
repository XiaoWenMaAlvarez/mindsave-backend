import { describe, test, expect, jest, beforeEach } from "@jest/globals";
import express from 'express';
import request from 'supertest';
import { ChatIARouter } from '../src/presentation/chat_ia/routes.js';
import { JwtAdapter } from '../src/config/jwt.adapter.js';
import { SendMessageToChatUseCase } from '../src/domain/use-cases/chat_ia/sendMessageToChatUseCase.js';
import { MensajeChatIA } from '../src/domain/entities/chat_ia/mensajeChatIA.entity.js';
import { ErrorMiddleware } from '../src/presentation/middlewares/init.js';

describe("ChatIA File Uploads & Limits", () => {
  let app: express.Express;
  const validToken = "valid-test-token";
  const validChatId = "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22";

  beforeEach(() => {
    jest.restoreAllMocks();

    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Mock validateToken for AuthMiddleware
    jest.spyOn(JwtAdapter, 'validateToken').mockImplementation((token: string) => {
      if (token === validToken) {
        return {
          id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
          email: "user@example.com",
          name: "Test User",
          role: "USER_ROL"
        } as any;
      }
      return null;
    });

    // Mock SendMessageToChatUseCase to avoid real DB / AI / Cloudinary calls in unit tests
    jest.spyOn(SendMessageToChatUseCase.prototype, 'createUserMessage').mockResolvedValue(
      new MensajeChatIA({ text: "test", role: "user", archivos: [], createdAt: new Date() })
    );

    jest.spyOn(SendMessageToChatUseCase.prototype, 'streamResponse').mockImplementation(async function* () {
      yield { text: "Respuesta de prueba" } as any;
    } as any);

    jest.spyOn(SendMessageToChatUseCase.prototype, 'createGeminiMessage').mockResolvedValue(
      new MensajeChatIA({ text: "test gemini", role: "model", archivos: [], createdAt: new Date() })
    );

    jest.spyOn(SendMessageToChatUseCase.prototype, 'saveMessage').mockResolvedValue(undefined as any);

    app.use('/api/chat-ia', ChatIARouter.routes);
    app.use(ErrorMiddleware.handleError);
  });

  test("Debe rechazar la petición si no se proporciona token de autenticación (401)", async () => {
    const res = await request(app)
      .post(`/api/chat-ia/send-message-to-chat/${validChatId}`)
      .attach('files', Buffer.from('dummy image content'), 'test.png');

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: "No token provided" });
  });

  test("Debe aceptar archivos con tipos MIME permitidos (ej. image/png, application/pdf, text/plain)", async () => {
    const res = await request(app)
      .post(`/api/chat-ia/send-message-to-chat/${validChatId}`)
      .set('Authorization', `Bearer ${validToken}`)
      .field('prompt', 'Hola con archivos')
      .attach('files', Buffer.from('%PDF-1.4 dummy pdf'), { filename: 'test.pdf', contentType: 'application/pdf' })
      .attach('files', Buffer.from('hello plain text'), { filename: 'doc.txt', contentType: 'text/plain' });

    expect(res.status).toBe(200);
    expect(res.text).toBe("Respuesta de prueba");
  });

  test("Debe rechazar archivos con tipos MIME no permitidos (ej. application/x-msdownload / .exe)", async () => {
    const res = await request(app)
      .post(`/api/chat-ia/send-message-to-chat/${validChatId}`)
      .set('Authorization', `Bearer ${validToken}`)
      .field('prompt', 'Hola archivo no permitido')
      .attach('files', Buffer.from('MZ executable dummy'), { filename: 'malicious.exe', contentType: 'application/x-msdownload' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Tipo de archivo no permitido/);
  });

  test("Debe rechazar archivos que superen el límite de 5MB (LIMIT_FILE_SIZE)", async () => {
    const largeBuffer = Buffer.alloc(5.5 * 1024 * 1024, 'a');

    const res = await request(app)
      .post(`/api/chat-ia/send-message-to-chat/${validChatId}`)
      .set('Authorization', `Bearer ${validToken}`)
      .field('prompt', 'Hola archivo grande')
      .attach('files', largeBuffer, { filename: 'large.png', contentType: 'image/png' });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('5MB');
  });

  test("Debe rechazar cuando se exceda el número máximo de 5 archivos", async () => {
    const req = request(app)
      .post(`/api/chat-ia/send-message-to-chat/${validChatId}`)
      .set('Authorization', `Bearer ${validToken}`)
      .field('prompt', 'Muchos archivos');

    for (let i = 1; i <= 6; i++) {
      req.attach('files', Buffer.from(`file ${i}`), { filename: `img${i}.png`, contentType: 'image/png' });
    }

    const res = await req;
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/número de archivos excede el máximo permitido/i);
  });

  test("Debe manejar errores durante el streaming sin fallar por 'headers already sent'", async () => {
    jest.spyOn(SendMessageToChatUseCase.prototype, 'streamResponse').mockImplementation(async function* () {
      yield { text: "Parte 1" } as any;
      throw new Error("Stream connection failed mid-flight");
    } as any);

    const res = await request(app)
      .post(`/api/chat-ia/send-message-to-chat/${validChatId}`)
      .set('Authorization', `Bearer ${validToken}`)
      .field('prompt', 'Hola test stream error');

    // Headers were sent before error, so status is 200 with partial chunk, and stream terminates cleanly
    expect(res.status).toBe(200);
    expect(res.text).toContain("Parte 1");
  });
});
