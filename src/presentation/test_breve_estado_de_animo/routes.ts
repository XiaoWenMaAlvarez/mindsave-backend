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

    router.post("/", [AuthMiddleware.validateJWT], testBreveEstadoDeAnimoController.saveTestBreveEstadoDeAnimo);
    router.get("/by-year/:year", [AuthMiddleware.validateJWT], testBreveEstadoDeAnimoController.getTestBreveEstadoDeAnimoByYear);
    router.put("", [AuthMiddleware.validateJWT], testBreveEstadoDeAnimoController.editarTestBreveEstadoDeAnimoDeHoy);

    router.delete("/:year/:month/:day", [AuthMiddleware.validateJWT], testBreveEstadoDeAnimoController.eliminarTestBreveEstadoDeAnimoDeHoy);
    router.get("/by-date/:year/:month/:day", [AuthMiddleware.validateJWT], testBreveEstadoDeAnimoController.getTodayTestBreveEstadoDeAnimo);


    return router;
  }

}