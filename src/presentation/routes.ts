import { type Request, type Response, Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import { GeminiService, swaggerDocument, FilesRepositoryService, EmailService, envs } from '../config/init.js';
import { HealthController } from './health/controller.js';
import { TestBreveEstadoDeAnimoRouter } from './test_breve_estado_de_animo/routes.js';
import { AuthRouter } from './auth/routes.js';
import { RegistroEstadoDeAnimoRouter } from './registro_estado_de_animo/routes.js';
import { ChatIARouter } from './chat_ia/routes.js';
import { AdminAuthRouter } from './admin/auth/routes.js'
import { AdminUserRouter } from './admin/user/routes.js';

export class AppRoutes {

  static get routes(): Router {
    const router = Router();

    const geminiService = new GeminiService({
      model: "gemini-3-flash-preview",
    });

    const filesRepositoryService = new FilesRepositoryService();

    const emailService = new EmailService(
      envs.MAILER_SERVICE,
      envs.MAILER_EMAIL,
      envs.MAILER_SECRET_KEY,
    );

    const healthController = new HealthController(geminiService, filesRepositoryService, emailService);

    router.get("/health", healthController.check);
    
    // Documentación Swagger / OpenAPI
    router.get("/api-docs.json", (req: Request, res: Response) => res.json(swaggerDocument));
    router.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

    router.use("/api/test-breve-estado-de-animo", TestBreveEstadoDeAnimoRouter.routes);
    router.use("/api/registro-estado-de-animo", RegistroEstadoDeAnimoRouter.routes);
    router.use("/api/auth", AuthRouter.routes(emailService));
    router.use("/api/chat-ia", ChatIARouter.routes(geminiService, filesRepositoryService));

    router.use("/admin/auth", AdminAuthRouter.routes);
    router.use("/admin/user", AdminUserRouter.routes);

    return router;
  }

}

