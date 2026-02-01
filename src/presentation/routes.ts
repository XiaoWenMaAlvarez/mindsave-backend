import { type Request, type Response, Router } from 'express';


export class AppRoutes {

  static get routes(): Router {
    const router = Router();

    router.get("/health", (req: Request, res: Response) => res.json({message: "OK"}))

    return router;
  }

}
