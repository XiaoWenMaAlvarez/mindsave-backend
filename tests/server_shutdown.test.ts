import { describe, test, expect, jest, beforeEach, afterEach } from "@jest/globals";
import { Router } from "express";
import { Server } from "../src/presentation/server.js";
import { prisma, disconnectPrisma } from "../src/data/index.js";

describe("Server & Prisma Graceful Shutdown", () => {
  let server: Server;
  const testPort = 3999;

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(async () => {
    if (server) {
      await server.close();
    }
  });

  test("disconnectPrisma debe invocar prisma.$disconnect()", async () => {
    const disconnectSpy = jest.spyOn(prisma, '$disconnect').mockResolvedValue(undefined);
    await disconnectPrisma();
    expect(disconnectSpy).toHaveBeenCalledTimes(1);
  });

  test("Server.close() debe cerrar el listener HTTP y desconectar Prisma", async () => {
    const disconnectSpy = jest.spyOn(prisma, '$disconnect').mockResolvedValue(undefined);
    const router = Router();
    router.get('/health', (req, res) => res.send('OK'));

    server = new Server({
      port: testPort,
      routes: router,
    });

    await server.start();
    await server.close();

    expect(disconnectSpy).toHaveBeenCalled();
  });

  test("Server.start() debe registrar listeners para SIGINT y SIGTERM", async () => {
    const processOnSpy = jest.spyOn(process, 'on');
    jest.spyOn(prisma, '$disconnect').mockResolvedValue(undefined);

    const router = Router();
    server = new Server({
      port: 4001,
      routes: router,
    });

    await server.start();

    const registeredSignals = processOnSpy.mock.calls.map(call => call[0]);
    expect(registeredSignals).toContain('SIGINT');
    expect(registeredSignals).toContain('SIGTERM');
  });
});
