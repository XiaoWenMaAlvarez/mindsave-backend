import { Router } from 'express';
import { TestBreveEstadoDeAnimoController } from './controller.js';
import {
  TestBreveEstadoDeAnimoDatasourceImpl,
  TestBreveEstadoDeAnimoRepositoryImpl,
  UserDatasourceImpl,
  UserRepositoryImpl,
} from '../../infrastructure/init.js';
import { AuthMiddleware } from '../middlewares/auth.middlewares.js';

export class TestBreveEstadoDeAnimoRouter {

  static get routes(): Router {
    const router = Router();

    const testBreveEstadoDeAnimoDatasource  = new TestBreveEstadoDeAnimoDatasourceImpl();
    const testBreveEstadoDeAnimoRepository = new TestBreveEstadoDeAnimoRepositoryImpl(testBreveEstadoDeAnimoDatasource);
    const testBreveEstadoDeAnimoController = new TestBreveEstadoDeAnimoController(testBreveEstadoDeAnimoRepository);
    const authMiddleware = new AuthMiddleware(
      new UserRepositoryImpl(new UserDatasourceImpl()),
    );

    router.post("/", [authMiddleware.validateJWTUser], testBreveEstadoDeAnimoController.saveTestBreveEstadoDeAnimo);
    router.get("/by-year/:year", [authMiddleware.validateJWTUser], testBreveEstadoDeAnimoController.getTestBreveEstadoDeAnimoByYear);
    router.put("/", [authMiddleware.validateJWTUser], testBreveEstadoDeAnimoController.editarTestBreveEstadoDeAnimoDeHoy);

    router.delete("/:year/:month/:day", [authMiddleware.validateJWTUser], testBreveEstadoDeAnimoController.eliminarTestBreveEstadoDeAnimoDeHoy);
    router.get("/by-date/:year/:month/:day", [authMiddleware.validateJWTUser], testBreveEstadoDeAnimoController.getTodayTestBreveEstadoDeAnimo);


    return router;
  }

}
