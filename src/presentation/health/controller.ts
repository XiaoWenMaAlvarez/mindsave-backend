import { type Request, type Response } from 'express';
import { prisma } from '../../data/index.js';
import { envs, EmailService, FilesRepositoryService, GeminiService, Logger } from '../../config/init.js';

export class HealthController {

  constructor(
    private readonly geminiService: GeminiService,
    private readonly filesService: FilesRepositoryService,
    private readonly emailService: EmailService
  ) {}

  public check = async (req: Request, res: Response): Promise<void> => {
    const [dbResult, geminiResult, cloudinaryResult, mailerResult] = await Promise.allSettled([
      prisma.$queryRaw`SELECT 1`,
      this.geminiService.checkHealth(),
      this.filesService.checkHealth(),
      this.emailService.checkHealth(),
    ]);

    const isDbConnected = dbResult.status === 'fulfilled';
    if (!isDbConnected && dbResult.status === 'rejected') {
      Logger.error(`Health check database failure: ${dbResult.reason}`);
    }

    const isGeminiReady = geminiResult.status === 'fulfilled' && geminiResult.value === true;
    const isCloudinaryReady = cloudinaryResult.status === 'fulfilled' && cloudinaryResult.value === true;
    const isMailerReady = mailerResult.status === 'fulfilled' && mailerResult.value === true;

    const services = {
      database: isDbConnected ? "connected" : "disconnected",
      gemini: isGeminiReady ? "connected" : "disconnected",
      cloudinary: isCloudinaryReady ? "connected" : "disconnected",
      mailer: isMailerReady ? "connected" : "disconnected",
    };

    const isHealthy = isDbConnected && isGeminiReady && isCloudinaryReady && isMailerReady;
    const isDegraded = isDbConnected && !isHealthy;

    const status = isHealthy ? "ok" : isDegraded ? "degraded" : "error";
    const statusCode = isDbConnected ? (isHealthy ? 200 : 200) : 503;

    const responsePayload = {
      status,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services
    };

    res.status(statusCode).json(responsePayload);
  };

}
