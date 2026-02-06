import { Router } from 'express';
import { TestBreveEstadoDeAnimoController } from './controller.js';
import { TestBreveEstadoDeAnimoDatasourceImpl } from '../../infrastructure/init.js';
import { TestBreveEstadoDeAnimoRepositoryImpl } from '../../infrastructure/init.js';

export class TestBreveEstadoDeAnimoRouter {

  static get routes(): Router {
    const router = Router();

    const testBreveEstadoDeAnimoDatasource  = new TestBreveEstadoDeAnimoDatasourceImpl();
    const testBreveEstadoDeAnimoRepository = new TestBreveEstadoDeAnimoRepositoryImpl(testBreveEstadoDeAnimoDatasource);
    const testBreveEstadoDeAnimoController = new TestBreveEstadoDeAnimoController(testBreveEstadoDeAnimoRepository);

    router.post("/", testBreveEstadoDeAnimoController.saveTestBreveEstadoDeAnimo);
    router.get("/by-year/:year", testBreveEstadoDeAnimoController.getTestBreveEstadoDeAnimoByYear);
    router.put("", testBreveEstadoDeAnimoController.editarTestBreveEstadoDeAnimoDeHoy);

    router.delete("/:year/:month/:day", testBreveEstadoDeAnimoController.eliminarTestBreveEstadoDeAnimoDeHoy);
    router.get("/by-date/:year/:month/:day", testBreveEstadoDeAnimoController.getTodayTestBreveEstadoDeAnimo);


    return router;
  }

}