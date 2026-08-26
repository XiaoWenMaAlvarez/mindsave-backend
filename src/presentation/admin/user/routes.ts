import { Router } from 'express';
import { AdminUserController } from './controller.js';
import {
  AdminUserDatasourceImpl,
  AdminUserRepositoryImpl,
  UserDatasourceImpl,
  UserRepositoryImpl,
} from './../../../infrastructure/init.js';
import { AuthMiddleware } from '../../middlewares/auth.middlewares.js';

export class AdminUserRouter {

  static get routes(): Router {
    const router = Router();

    const adminUserDatasource  = new AdminUserDatasourceImpl();
    const adminUserRepository = new AdminUserRepositoryImpl(adminUserDatasource);
    const authMiddleware = new AuthMiddleware(
      new UserRepositoryImpl(new UserDatasourceImpl()),
    );

    const adminUserController = new AdminUserController(adminUserRepository);
    
    router.post("/", [authMiddleware.validateJWTAdmin], adminUserController.createUser);
    router.get("/", [authMiddleware.validateJWTAdmin], adminUserController.getUsers);
    router.put("/restore-user/:idUsuario", [authMiddleware.validateJWTAdmin], adminUserController.restoreUser);
    router.get("/:idUsuario", [authMiddleware.validateJWTAdmin], adminUserController.getUserById);
    router.put("/:idUsuario", [authMiddleware.validateJWTAdmin], adminUserController.updateUser);
    router.delete("/:idUsuario", [authMiddleware.validateJWTAdmin], adminUserController.deleteUser);

    return router;
  }

}
