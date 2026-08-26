import { afterEach, describe, expect, jest, test } from "@jest/globals";
import type { NextFunction, Request, Response } from "express";
import { Logger, type FilesRepositoryService, type GeminiService } from "../src/config/init.js";
import {
  ChatChatIA,
  type ChatIARepository,
  type MensajeChatIA,
} from "../src/domain/init.js";
import { ChatIAController } from "../src/presentation/chat_ia/controller.js";
import { ErrorMiddleware } from "../src/presentation/middlewares/error.middleware.js";

const userId = "0f2cb907-c53f-4218-b728-01c4639bf70a";
const chatId = "c1a4f37a-8dd9-4a45-9d52-f92bdbe11004";

async function* responseStream() {
  yield { text: "Respuesta " };
  yield { text: "completa" };
}

const createRequest = (): Request => ({
  body: { prompt: "Necesito ayuda" },
  files: [],
  params: { idChat: chatId },
  user: { id: userId },
} as unknown as Request);

const createResponse = (events: string[]) => {
  const response = {
    headersSent: false,
    writableEnded: false,
    setHeader: jest.fn(),
    status: jest.fn(),
    write: jest.fn((piece: string) => {
      response.headersSent = true;
      events.push(`write:${piece}`);
      return true;
    }),
    end: jest.fn(() => {
      response.writableEnded = true;
      events.push("end");
      return response;
    }),
    destroy: jest.fn(() => {
      response.writableEnded = true;
      events.push("destroy");
      return response;
    }),
  };
  response.status.mockReturnValue(response);
  return response;
};

const createController = (
  saveMessages: (messages: readonly MensajeChatIA[]) => Promise<void>,
): ChatIAController => {
  const repository = {
    getMessagesFromChat: jest.fn(async () => new ChatChatIA({
      id: chatId,
      idUsuario: userId,
      title: "Chat de prueba",
      mensajes: [],
    })),
    sendMessagesToChat: jest.fn(async (
      _idChat: string,
      _idUsuario: string,
      messages: readonly MensajeChatIA[],
    ) => saveMessages(messages)),
  } as unknown as ChatIARepository;
  const filesRepositoryService = {
    uploadImages: jest.fn(async () => []),
  } as unknown as FilesRepositoryService;
  const geminiService = {
    chatPromptUseCase: jest.fn(async () => responseStream()),
    uploadFiles: jest.fn(async () => []),
  } as unknown as GeminiService;

  return new ChatIAController(repository, filesRepositoryService, geminiService);
};

describe("Persistencia del stream de chat", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("cierra la respuesta sólo después de guardar ambos mensajes", async () => {
    const events: string[] = [];
    const controller = createController(async (messages) => {
      events.push(`save:${messages.map(message => message.role).join("+")}`);
    });
    const response = createResponse(events);
    const next = jest.fn();

    await controller.sendMessageToChat(
      createRequest(),
      response as unknown as Response,
      next as unknown as NextFunction,
    );

    expect(events).toEqual([
      "write:Respuesta ",
      "write:completa",
      "save:user+model",
      "end",
    ]);
    expect(response.setHeader).toHaveBeenCalledWith("Content-Type", "text/plain");
    expect(response.status).toHaveBeenCalledWith(200);
    expect(next).not.toHaveBeenCalled();
  });

  test("no ejecuta el cierre exitoso si falla la persistencia", async () => {
    const events: string[] = [];
    const persistenceError = new Error("database write failed");
    const controller = createController(async (messages) => {
      events.push(`save:${messages.map(message => message.role).join("+")}`);
      throw persistenceError;
    });
    const response = createResponse(events);
    const request = createRequest();
    jest.spyOn(Logger, "error").mockImplementation(() => undefined);
    const next = jest.fn((error: unknown) => {
      ErrorMiddleware.handleError(
        error,
        request,
        response as unknown as Response,
        jest.fn() as unknown as NextFunction,
      );
    });

    await controller.sendMessageToChat(
      request,
      response as unknown as Response,
      next as unknown as NextFunction,
    );

    expect(events).toEqual([
      "write:Respuesta ",
      "write:completa",
      "save:user+model",
      "destroy",
    ]);
    expect(response.end).not.toHaveBeenCalled();
    expect(response.destroy).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(persistenceError);
  });
});
