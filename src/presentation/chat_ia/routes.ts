import { Router } from 'express';
import { ChatIAController } from './controller.js';
import { ChatIADatasourceImpl, ChatIARepositoryImpl } from '../../infrastructure/init.js';
import { AuthMiddleware } from '../middlewares/auth.middlewares.js';
import multer from 'multer';
import { FilesRepositoryService, GeminiService } from '../services/init.js';

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

    router.post("/new-chat", [AuthMiddleware.validateJWT], chatIAController.createNewChat);

    router.get("/get-chats-by-user", [AuthMiddleware.validateJWT], chatIAController.getChatsByUser);
    
    router.get("/get-messages-from-chat/:idChat", [AuthMiddleware.validateJWT], chatIAController.getMessagesFromChat);

    router.post("/send-message-to-chat/:idChat", [upload.array('files'), AuthMiddleware.validateJWT], chatIAController.sendMessageToChat);

    router.delete("/delete-chat/:idChat", [AuthMiddleware.validateJWT], chatIAController.deleteChat);

    return router;
  }

}