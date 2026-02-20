import { Router } from 'express';
import { RegistroEstadoDeAnimoController } from './controller.js';
import { RegistroEstadoAnimoDatasourceImpl, RegistroEstadoAnimoRepositoryImpl } from '../../infrastructure/init.js';
import { AuthMiddleware } from '../middlewares/auth.middlewares.js';

export class RegistroEstadoDeAnimoRouter {

  static get routes(): Router {
    const router = Router();

    const registroEstadoDeAnimoDatasource  = new RegistroEstadoAnimoDatasourceImpl();
    const registroEstadoDeAnimoRepository = new RegistroEstadoAnimoRepositoryImpl(registroEstadoDeAnimoDatasource);
    const registroEstadoDeAnimoController = new RegistroEstadoDeAnimoController(registroEstadoDeAnimoRepository);

    router.post("/", [AuthMiddleware.validateJWT], registroEstadoDeAnimoController.saveRegistroEstadoDeAnimo);
    router.get("/pendientes", [AuthMiddleware.validateJWT], registroEstadoDeAnimoController.getRegistroEstadoDeAnimoPendientes);
    router.get("/completos", [AuthMiddleware.validateJWT], registroEstadoDeAnimoController.getRegistroEstadoDeAnimoCompletos);
    router.put("/", [AuthMiddleware.validateJWT], registroEstadoDeAnimoController.editarRegistroEstadoDeAnimo);
    router.delete("/:idRegistro", [AuthMiddleware.validateJWT], registroEstadoDeAnimoController.eliminarTestBreveEstadoDeAnimo);
    router.get("/:idRegistro", [AuthMiddleware.validateJWT], registroEstadoDeAnimoController.getRegistroEstadoDeAnimoById);


    return router;
  }

}