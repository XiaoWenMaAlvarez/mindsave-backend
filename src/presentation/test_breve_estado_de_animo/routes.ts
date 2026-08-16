import { Router } from 'express';
import { TestBreveEstadoDeAnimoController } from './controller.js';
import { TestBreveEstadoDeAnimoDatasourceImpl } from '../../infrastructure/init.js';
import { TestBreveEstadoDeAnimoRepositoryImpl } from '../../infrastructure/init.js';
import { AuthMiddleware } from '../middlewares/auth.middlewares.js';

export class TestBreveEstadoDeAnimoRouter {

  static get routes(): Router {
    const router = Router();

    const testBreveEstadoDeAnimoDatasource  = new TestBreveEstadoDeAnimoDatasourceImpl();
    const testBreveEstadoDeAnimoRepository = new TestBreveEstadoDeAnimoRepositoryImpl(testBreveEstadoDeAnimoDatasource);
    const testBreveEstadoDeAnimoController = new TestBreveEstadoDeAnimoController(testBreveEstadoDeAnimoRepository);

    router.post("/", [AuthMiddleware.validateJWTUser], testBreveEstadoDeAnimoController.saveTestBreveEstadoDeAnimo);
    router.get("/by-year/:year", [AuthMiddleware.validateJWTUser], testBreveEstadoDeAnimoController.getTestBreveEstadoDeAnimoByYear);
    router.put("/", [AuthMiddleware.validateJWTUser], testBreveEstadoDeAnimoController.editarTestBreveEstadoDeAnimoDeHoy);

    router.delete("/:year/:month/:day", [AuthMiddleware.validateJWTUser], testBreveEstadoDeAnimoController.eliminarTestBreveEstadoDeAnimoDeHoy);
    router.get("/by-date/:year/:month/:day", [AuthMiddleware.validateJWTUser], testBreveEstadoDeAnimoController.getTodayTestBreveEstadoDeAnimo);


    return router;
  }

}