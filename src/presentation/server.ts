import express, { Router } from 'express';
import { type Server as HttpServer } from 'node:http';
import { Logger } from '../config/logger.plugin.js';
import { prisma } from '../data/index.js';
import { ErrorMiddleware } from './middlewares/init.js';
import cors from 'cors';


interface Options {
  port: number;
  routes: Router;
  requestTimeoutMs?: number;
  headersTimeoutMs?: number;
  keepAliveTimeoutMs?: number;
}


export class Server {

  public readonly app = express();
  private readonly port: number;
  private readonly routes: Router;
  private readonly requestTimeoutMs: number;
  private readonly headersTimeoutMs: number;
  private readonly keepAliveTimeoutMs: number;
  private serverListener?: HttpServer | undefined;

  constructor(options: Options) {
    const {
      port,
      routes,
      requestTimeoutMs = 60_000,
      headersTimeoutMs = 65_000,
      keepAliveTimeoutMs = 60_000,
    } = options;
    this.port = port;
    this.routes = routes;
    this.requestTimeoutMs = requestTimeoutMs;
    this.headersTimeoutMs = headersTimeoutMs;
    this.keepAliveTimeoutMs = keepAliveTimeoutMs;
  }

  async start() {
    this.app.use( express.json() );

    this.app.use(cors({
      origin: [
        "https://mindsave-admin.vercel.app",
        "http://localhost:5173"
      ],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true
    }));
    
    this.app.use( express.urlencoded({ extended: true }) ); // Para el formulario de recuperar contraseña

    this.app.use( this.routes );

    this.app.use( ErrorMiddleware.handleError );
    
    this.serverListener = this.app.listen(this.port, () => {
      console.log(`Server running on port ${ this.port }`);
    });

    this.serverListener.requestTimeout = this.requestTimeoutMs;
    this.serverListener.headersTimeout = this.headersTimeoutMs;
    this.serverListener.keepAliveTimeout = this.keepAliveTimeoutMs;

    this.setupGracefulShutdown();
  }

  public async close(): Promise<void> {
    if (this.serverListener && this.serverListener.listening) {
      await new Promise<void>((resolve, reject) => {
        this.serverListener!.close((err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    }
    this.serverListener = undefined;
    await prisma.$disconnect();
  }

  private setupGracefulShutdown() {
    const shutdown = async (signal: string) => {
      Logger.info(`Recibida señal ${signal}. Cerrando servidor HTTP y desconectando base de datos...`);
      try {
        await this.close();
        Logger.info("Cierre ordenado completado con éxito.");
        process.exit(0);
      } catch (error) {
        Logger.error(`Error durante el cierre ordenado: ${error}`);
        process.exit(1);
      }
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  }
}
