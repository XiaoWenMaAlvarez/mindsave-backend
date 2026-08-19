import { Router, type Request, type Response, type NextFunction } from 'express';
import { ChatIAController } from './controller.js';
import { ChatIADatasourceImpl, ChatIARepositoryImpl } from '../../infrastructure/init.js';
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
    
    const chatIAController = new ChatIAController(chatIARepository, filesRepositoryService, geminiService);

    router.post("/new-chat", [AuthMiddleware.validateJWTUser], chatIAController.createNewChat);

    router.get("/get-chats-by-user", [AuthMiddleware.validateJWTUser], chatIAController.getChatsByUser);
    
    router.get("/get-messages-from-chat/:idChat", [AuthMiddleware.validateJWTUser], chatIAController.getMessagesFromChat);

    router.post("/send-message-to-chat/:idChat", [AuthMiddleware.validateJWTUser, HandleFileMiddleware.handleUploadFiles], chatIAController.sendMessageToChat);

    router.delete("/delete-chat/:idChat", [AuthMiddleware.validateJWTUser], chatIAController.deleteChat);

    return router;
  }

}