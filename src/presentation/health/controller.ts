import { type Request, type Response } from 'express';
import { prisma } from '../../data/index.js';
import { EmailService, FilesRepositoryService, GeminiService, Logger, withTimeout } from '../../config/init.js';

export class HealthController {
  public static readonly HEALTH_CHECK_TIMEOUT_MS = 5_000;

  constructor(
    private readonly geminiService: GeminiService,
    private readonly filesService: FilesRepositoryService,
    private readonly emailService: EmailService,
    private readonly timeoutMs: number = HealthController.HEALTH_CHECK_TIMEOUT_MS
  ) {}

  public check = async (req: Request, res: Response): Promise<void> => {
    const [dbResult, geminiResult, cloudinaryResult, mailerResult] = await Promise.allSettled([
      withTimeout(
        prisma.$queryRaw`SELECT 1`,
        this.timeoutMs,
        "Database health probe"
      ),
      withTimeout(
        this.geminiService.checkHealth(),
        this.timeoutMs,
        "Gemini health probe"
      ),
      withTimeout(
        this.filesService.checkHealth(),
        this.timeoutMs,
        "Cloudinary health probe"
      ),
      withTimeout(
        this.emailService.checkHealth(),
        this.timeoutMs,
        "Mailer health probe"
      ),
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
    const statusCode = isDbConnected ? 200 : 503;

    const responsePayload = {
      status,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services
    };

    res.status(statusCode).json(responsePayload);
  };

}
