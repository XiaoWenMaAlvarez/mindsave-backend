import { Router } from 'express';
import { AdminAuthController } from './controller.js';
import { AdminAuthDatasourceImpl, AdminAuthRepositoryImpl } from './../../../infrastructure/init.js';
import { AuthMiddleware } from '../../middlewares/auth.middlewares.js';

export class AdminAuthRouter {

  static get routes(): Router {
    const router = Router();

    const adminAuthDatasource  = new AdminAuthDatasourceImpl();
    const adminAuthRepository = new AdminAuthRepositoryImpl(adminAuthDatasource);


    const adminAuthController = new AdminAuthController(adminAuthRepository);

    router.post("/login", adminAuthController.loginUser);
    
    router.get("/check-status", [AuthMiddleware.validateJWTAdmin], adminAuthController.checkStatus);

    return router;
  }

}