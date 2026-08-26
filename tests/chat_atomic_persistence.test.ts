import { afterEach, describe, expect, jest, test } from "@jest/globals";
import { prisma } from "../src/data/index.js";
import { ArchivoChatIA, MensajeChatIA } from "../src/domain/init.js";
import { ChatIADatasourceImpl } from "../src/infrastructure/datasources/chatIA.datasource.impl.js";

const userId = "0f2cb907-c53f-4218-b728-01c4639bf70a";
const chatId = "c1a4f37a-8dd9-4a45-9d52-f92bdbe11004";
const userCreatedAt = new Date("2026-08-26T14:00:00.000Z");
const modelCreatedAt = new Date("2026-08-26T14:00:05.000Z");

const createMessages = (): readonly MensajeChatIA[] => [
  new MensajeChatIA({
    text: "Mensaje del usuario",
    role: "user",
    createdAt: userCreatedAt,
    archivos: [new ArchivoChatIA({
      fileUri: "gemini://archivo",
      mimeType: "image/png",
      fileUrl: "https://example.com/archivo.png",
    })],
  }),
  new MensajeChatIA({
    text: "Respuesta de Gemini",
    role: "model",
    createdAt: modelCreatedAt,
    archivos: [],
  }),
];

describe("Persistencia atómica del turno de chat", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("crea ambos mensajes en una sola escritura dentro de la transacción", async () => {
    const tx = {
      user: {
        findUnique: jest.fn(async () => ({ id: userId })),
      },
      chatRole: {
        findUnique: jest.fn(async ({ where }: { where: { description: string } }) => ({
          id: where.description === "user" ? 1 : 2,
          description: where.description,
        })),
      },
      chat: {
        findFirst: jest.fn(async () => ({ id: chatId })),
        update: jest.fn(async () => ({ id: chatId })),
      },
    };
    const transaction = jest
      .spyOn(prisma, "$transaction")
      .mockImplementation(async (callback: any) => callback(tx));

    await new ChatIADatasourceImpl().sendMessagesToChat(chatId, userId, createMessages());

    expect(transaction).toHaveBeenCalledWith(expect.any(Function));
    expect(tx.chat.update).toHaveBeenCalledTimes(1);
    expect(tx.chat.update).toHaveBeenCalledWith({
      where: { id: chatId },
      data: {
        mensajes: {
          create: [
            {
              text: "Mensaje del usuario",
              createdAt: userCreatedAt,
              role: { connect: { id: 1 } },
              archivos: {
                create: [{
                  fileUri: "gemini://archivo",
                  mimeType: "image/png",
                  fileUrl: "https://example.com/archivo.png",
                  cloudinaryPublicId: null,
                  cloudinaryResourceType: null,
                  geminiFileName: null,
                }],
              },
            },
            {
              text: "Respuesta de Gemini",
              createdAt: modelCreatedAt,
              role: { connect: { id: 2 } },
              archivos: {},
            },
          ],
        },
      },
    });
  });

  test("propaga un fallo de la escritura conjunta para que Prisma revierta el turno", async () => {
    const persistenceError = new Error("nested message create failed");
    const tx = {
      user: {
        findUnique: jest.fn(async () => ({ id: userId })),
      },
      chatRole: {
        findUnique: jest.fn(async ({ where }: { where: { description: string } }) => ({
          id: where.description === "user" ? 1 : 2,
          description: where.description,
        })),
      },
      chat: {
        findFirst: jest.fn(async () => ({ id: chatId })),
        update: jest.fn(async () => {
          throw persistenceError;
        }),
      },
    };
    jest
      .spyOn(prisma, "$transaction")
      .mockImplementation(async (callback: any) => callback(tx));

    await expect(
      new ChatIADatasourceImpl().sendMessagesToChat(chatId, userId, createMessages()),
    ).rejects.toBe(persistenceError);

    expect(tx.chat.update).toHaveBeenCalledTimes(1);
  });
});
