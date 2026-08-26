import { readFileSync } from "node:fs";
import { afterEach, describe, expect, jest, test } from "@jest/globals";
import { v2 as cloudinary } from "cloudinary";
import type { FilesRepositoryService, GeminiService } from "../src/config/init.js";
import { FilesRepositoryService as CloudinaryService, GeminiService as GoogleGeminiService } from "../src/config/init.js";
import {
  ArchivoChatIA,
  type ChatIARepository,
  DeleteChatUseCase,
} from "../src/domain/init.js";

const userId = "0f2cb907-c53f-4218-b728-01c4639bf70a";
const chatId = "c1a4f37a-8dd9-4a45-9d52-f92bdbe11004";

const remoteFile = () => new ArchivoChatIA({
  fileUri: "https://generativelanguage.googleapis.com/v1beta/files/gemini-123",
  mimeType: "image/png",
  fileUrl: "https://res.cloudinary.com/demo/image/upload/v123/folder/cloudinary-123.png",
  cloudinaryPublicId: "folder/cloudinary-123",
  cloudinaryResourceType: "image",
  geminiFileName: "files/gemini-123",
});

describe("Limpieza de archivos remotos al eliminar chats", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("elimina Cloudinary y Gemini antes de borrar PostgreSQL", async () => {
    const events: string[] = [];
    const repository = {
      getFilesForChatDeletion: jest.fn(async () => [remoteFile()]),
      deleteChat: jest.fn(async () => {
        events.push("postgres");
      }),
    } as unknown as ChatIARepository;
    const filesService = {
      deleteFile: jest.fn(async () => {
        events.push("cloudinary");
      }),
    } as unknown as FilesRepositoryService;
    const geminiService = {
      deleteFile: jest.fn(async () => {
        events.push("gemini");
      }),
    } as unknown as GeminiService;

    await new DeleteChatUseCase(repository, filesService, geminiService).execute(chatId, userId);

    expect(events).toEqual(["cloudinary", "gemini", "postgres"]);
    expect(filesService.deleteFile).toHaveBeenCalledWith({
      fileUrl: remoteFile().fileUrl,
      publicId: "folder/cloudinary-123",
      resourceType: "image",
    });
    expect(geminiService.deleteFile).toHaveBeenCalledWith({
      fileName: "files/gemini-123",
      fileUri: remoteFile().fileUri,
    });
    expect(repository.deleteChat).toHaveBeenCalledWith(chatId, userId);
  });

  test("conserva PostgreSQL si un proveedor remoto falla", async () => {
    const repository = {
      getFilesForChatDeletion: jest.fn(async () => [remoteFile()]),
      deleteChat: jest.fn(),
    } as unknown as ChatIARepository;
    const filesService = {
      deleteFile: jest.fn(async () => {
        throw new Error("cloudinary unavailable");
      }),
    } as unknown as FilesRepositoryService;
    const geminiService = {
      deleteFile: jest.fn(async () => undefined),
    } as unknown as GeminiService;

    await expect(
      new DeleteChatUseCase(repository, filesService, geminiService).execute(chatId, userId),
    ).rejects.toMatchObject({
      statusCode: 500,
      message: "No fue posible eliminar todos los archivos remotos del chat",
    });

    expect(geminiService.deleteFile).toHaveBeenCalledTimes(1);
    expect(repository.deleteChat).not.toHaveBeenCalled();
  });

  test("un chat inexistente o ajeno conserva el éxito sin llamar proveedores", async () => {
    const repository = {
      getFilesForChatDeletion: jest.fn(async () => null),
      deleteChat: jest.fn(),
    } as unknown as ChatIARepository;
    const filesService = { deleteFile: jest.fn() } as unknown as FilesRepositoryService;
    const geminiService = { deleteFile: jest.fn() } as unknown as GeminiService;

    await expect(
      new DeleteChatUseCase(repository, filesService, geminiService).execute(chatId, userId),
    ).resolves.toBeUndefined();

    expect(filesService.deleteFile).not.toHaveBeenCalled();
    expect(geminiService.deleteFile).not.toHaveBeenCalled();
    expect(repository.deleteChat).not.toHaveBeenCalled();
  });

  test("los adaptadores pueden limpiar registros históricos usando URL y URI", async () => {
    const destroy = jest
      .spyOn(cloudinary.uploader, "destroy")
      .mockResolvedValue({ result: "ok" } as never);
    const cloudinaryService = new CloudinaryService();
    await cloudinaryService.deleteFile({
      fileUrl: "https://res.cloudinary.com/demo/image/upload/v123/folder/legacy.png",
      publicId: "",
      resourceType: "",
    });

    const geminiService = new GoogleGeminiService();
    const geminiFiles = (geminiService as unknown as {
      ai: { files: { delete: (params: { name: string }) => Promise<unknown> } };
    }).ai.files;
    const deleteGeminiFile = jest
      .spyOn(geminiFiles, "delete")
      .mockResolvedValue({});
    await geminiService.deleteFile({
      fileName: "",
      fileUri: "https://generativelanguage.googleapis.com/v1beta/files/legacy-123",
    });

    expect(destroy).toHaveBeenCalledWith("folder/legacy", {
      resource_type: "image",
      invalidate: true,
    });
    expect(deleteGeminiFile).toHaveBeenCalledWith({ name: "files/legacy-123" });
  });

  test("schema y migración conservan los identificadores necesarios", () => {
    const schema = readFileSync("prisma/schema.prisma", "utf8");
    const migration = readFileSync(
      "prisma/migrations/20260826010000_agrega_identificadores_archivos_remotos/migration.sql",
      "utf8",
    );

    expect(schema).toContain("cloudinaryPublicId      String?");
    expect(schema).toContain("cloudinaryResourceType  String?");
    expect(schema).toContain("geminiFileName          String?");
    expect(migration).toContain('ADD COLUMN "cloudinaryPublicId" TEXT');
    expect(migration).toContain('ADD COLUMN "geminiFileName" TEXT');
  });
});
