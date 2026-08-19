import { type NextFunction, type Request, type Response } from 'express';
import { CustomError } from '../../domain/init.js';
import { Logger } from '../../config/logger.plugin.js';

export class ErrorMiddleware {

  static handleError(
    error: unknown,
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    if (res.headersSent) {
      Logger.error(`Error after headers were sent: ${error}`);
      if (!res.writableEnded) {
        res.end();
      }
      return;
    }

    if (error instanceof CustomError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }

    Logger.error(`Unhandled Error: ${error}`);
    res.status(500).json({ error: "Internal Server Error" });
  }

}
