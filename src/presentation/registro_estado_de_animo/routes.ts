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

    router.post("/", [AuthMiddleware.validateJWTUser], registroEstadoDeAnimoController.saveRegistroEstadoDeAnimo);
    router.get("/pendientes", [AuthMiddleware.validateJWTUser], registroEstadoDeAnimoController.getRegistroEstadoDeAnimoPendientes);
    router.get("/completos", [AuthMiddleware.validateJWTUser], registroEstadoDeAnimoController.getRegistroEstadoDeAnimoCompletos);
    router.put("/", [AuthMiddleware.validateJWTUser], registroEstadoDeAnimoController.editarRegistroEstadoDeAnimo);
    router.delete("/:idRegistro", [AuthMiddleware.validateJWTUser], registroEstadoDeAnimoController.eliminarRegistroEstadoDeAnimo);
    router.get("/:idRegistro", [AuthMiddleware.validateJWTUser], registroEstadoDeAnimoController.getRegistroEstadoDeAnimoById);


    return router;
  }

}