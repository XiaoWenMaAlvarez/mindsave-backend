import { Router } from 'express';
import { ChatIAController } from './controller.js';
import { ChatIADatasourceImpl, ChatIARepositoryImpl } from '../../infrastructure/init.js';
import { AuthMiddleware } from '../middlewares/auth.middlewares.js';
import multer from 'multer';
import { FilesRepositoryService, GeminiService } from '../../config/init.js';

export class ChatIARouter {

  static get routes(): Router {
    const router = Router();

    const chatIADatasource  = new ChatIADatasourceImpl();
    const chatIARepository = new ChatIARepositoryImpl(chatIADatasource);
    const filesRepositoryService = new FilesRepositoryService();
    const geminiService = new GeminiService({
      model: "gemini-3-flash-preview",
    });
    
    const chatIAController = new ChatIAController(chatIARepository, filesRepositoryService, geminiService);

    const upload = multer({ dest: 'uploads/' });

    router.post("/new-chat", [AuthMiddleware.validateJWTUser], chatIAController.createNewChat);

    router.get("/get-chats-by-user", [AuthMiddleware.validateJWTUser], chatIAController.getChatsByUser);
    
    router.get("/get-messages-from-chat/:idChat", [AuthMiddleware.validateJWTUser], chatIAController.getMessagesFromChat);

    router.post("/send-message-to-chat/:idChat", [upload.array('files'), AuthMiddleware.validateJWTUser], chatIAController.sendMessageToChat);

    router.delete("/delete-chat/:idChat", [AuthMiddleware.validateJWTUser], chatIAController.deleteChat);

    return router;
  }

}