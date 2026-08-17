import { Router } from 'express';
import { AdminUserController } from './controller.js';
import { AdminUserDatasourceImpl, AdminUserRepositoryImpl } from './../../../infrastructure/init.js';
import { AuthMiddleware } from '../../middlewares/auth.middlewares.js';

export class AdminUserRouter {

  static get routes(): Router {
    const router = Router();

    const adminUserDatasource  = new AdminUserDatasourceImpl();
    const adminUserRepository = new AdminUserRepositoryImpl(adminUserDatasource);

    const adminUserController = new AdminUserController(adminUserRepository);
    
    router.post("/", [AuthMiddleware.validateJWTAdmin], adminUserController.createUser);
    router.get("/", [AuthMiddleware.validateJWTAdmin], adminUserController.getUsers);
    router.get("/:idUsuario", [AuthMiddleware.validateJWTAdmin], adminUserController.getUserById);
    router.put("/:idUsuario", [AuthMiddleware.validateJWTAdmin], adminUserController.updateUser);
    router.delete("/:idUsuario", [AuthMiddleware.validateJWTAdmin], adminUserController.deleteUser);
    router.put("/restore-user/:idUsuario", [AuthMiddleware.validateJWTAdmin], adminUserController.restoreUser);

    return router;
  }

}