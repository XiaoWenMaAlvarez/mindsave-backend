import { Router } from 'express';
import { RegistroEstadoDeAnimoController } from './controller.js';
import {
  RegistroEstadoAnimoDatasourceImpl,
  RegistroEstadoAnimoRepositoryImpl,
  UserDatasourceImpl,
  UserRepositoryImpl,
} from '../../infrastructure/init.js';
import { AuthMiddleware } from '../middlewares/auth.middlewares.js';

export class RegistroEstadoDeAnimoRouter {

  static get routes(): Router {
    const router = Router();

    const registroEstadoDeAnimoDatasource  = new RegistroEstadoAnimoDatasourceImpl();
    const registroEstadoDeAnimoRepository = new RegistroEstadoAnimoRepositoryImpl(registroEstadoDeAnimoDatasource);
    const registroEstadoDeAnimoController = new RegistroEstadoDeAnimoController(registroEstadoDeAnimoRepository);
    const authMiddleware = new AuthMiddleware(
      new UserRepositoryImpl(new UserDatasourceImpl()),
    );

    router.post("/", [authMiddleware.validateJWTUser], registroEstadoDeAnimoController.saveRegistroEstadoDeAnimo);
    router.get("/pendientes", [authMiddleware.validateJWTUser], registroEstadoDeAnimoController.getRegistroEstadoDeAnimoPendientes);
    router.get("/completos", [authMiddleware.validateJWTUser], registroEstadoDeAnimoController.getRegistroEstadoDeAnimoCompletos);
    router.put("/", [authMiddleware.validateJWTUser], registroEstadoDeAnimoController.editarRegistroEstadoDeAnimo);
    router.delete("/:idRegistro", [authMiddleware.validateJWTUser], registroEstadoDeAnimoController.eliminarRegistroEstadoDeAnimo);
    router.get("/:idRegistro", [authMiddleware.validateJWTUser], registroEstadoDeAnimoController.getRegistroEstadoDeAnimoById);


    return router;
  }

}
