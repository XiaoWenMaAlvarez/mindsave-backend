import { type Request, type Response, Router } from 'express';
import { TestBreveEstadoDeAnimoRouter } from './test_breve_estado_de_animo/routes.js';
import { AuthRouter } from './auth/routes.js';
import fs from 'node:fs';

export class AppRoutes {

  static get routes(): Router {
    const router = Router();

    router.get("/health", (req: Request, res: Response) => res.json({message: "OK"}))
    router.use("/api/test-breve-estado-de-animo", TestBreveEstadoDeAnimoRouter.routes);
    router.use("/api/auth", AuthRouter.routes);

    return router;
  }

}
