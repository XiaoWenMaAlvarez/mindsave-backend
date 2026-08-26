import { Router, type Request, type Response, type NextFunction } from 'express';
import { ChatIAController } from './controller.js';
import {
  ChatIADatasourceImpl,
  ChatIARepositoryImpl,
  UserDatasourceImpl,
  UserRepositoryImpl,
} from '../../infrastructure/init.js';
import { AuthMiddleware, HandleFileMiddleware } from '../middlewares/init.js';
import { FilesRepositoryService, GeminiService } from '../../config/init.js';


export class ChatIARouter {

  static routes(
    geminiService: GeminiService,
    filesRepositoryService: FilesRepositoryService
  ): Router {
    const router = Router();

    const chatIADatasource  = new ChatIADatasourceImpl();
    const chatIARepository = new ChatIARepositoryImpl(chatIADatasource);
    const authMiddleware = new AuthMiddleware(
      new UserRepositoryImpl(new UserDatasourceImpl()),
    );
    
    const chatIAController = new ChatIAController(chatIARepository, filesRepositoryService, geminiService);

    router.post("/new-chat", [authMiddleware.validateJWTUser], chatIAController.createNewChat);

    router.get("/get-chats-by-user", [authMiddleware.validateJWTUser], chatIAController.getChatsByUser);
    
    router.get("/get-messages-from-chat/:idChat", [authMiddleware.validateJWTUser], chatIAController.getMessagesFromChat);

    router.post("/send-message-to-chat/:idChat", [authMiddleware.validateJWTUser, HandleFileMiddleware.handleUploadFiles], chatIAController.sendMessageToChat);

    router.delete("/delete-chat/:idChat", [authMiddleware.validateJWTUser], chatIAController.deleteChat);

    return router;
  }

}
