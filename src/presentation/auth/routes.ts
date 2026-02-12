import { Router } from 'express';
import { AuthController } from './controller.js';
import { UserDatasourceImpl, UserRepositoryImpl } from '../../infrastructure/init.js';
import { EmailService } from '../../config/nodemailer.adapter.js';
import { envs } from '../../config/envs.js';
import { AuthMiddleware } from '../middlewares/auth.middlewares.js';

export class AuthRouter {

  static get routes(): Router {
    const router = Router();

    const userDatasource  = new UserDatasourceImpl();
    const userRepository = new UserRepositoryImpl(userDatasource);
    const emailService = new EmailService(
      envs.MAILER_SERVICE,
      envs.MAILER_EMAIL,
      envs.MAILER_SECRET_KEY,
    );

    const verifyEmailUrl = `${envs.WEBSERVICE_URL}/api/auth/validate-email`;

    const authController = new AuthController(userRepository, emailService, verifyEmailUrl);

    router.post("/login", authController.loginUser);
    router.post("/register", authController.registerUser);
    router.get("/validate-email/:token", authController.validateEmail);
    router.get("/check-status", [AuthMiddleware.validateJWT], authController.checkStatus);

    return router;
  }

}