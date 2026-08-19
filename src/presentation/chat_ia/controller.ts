import { type NextFunction, type Request, type Response } from 'express';
import { Logger } from '../../config/logger.plugin.js';
import { ChatIARepository, CreateChatIAUseCase, CustomError, DeleteChatUseCase, GetChatsByUserUseCase, GetMessagesFromChatUseCase, SendMessageToChatUseCase } from '../../domain/init.js';
import { UuidDto, PromptChatDTO } from '../validators/dtos/init.js';
import { type FilesRepositoryService, type GeminiService } from '../../config/init.js';
import { existsSync } from 'node:fs';
import { unlink } from 'node:fs/promises';

export class ChatIAController {

  constructor(
    private readonly chatIARepository: ChatIARepository,
    private readonly filesRepositoryService: FilesRepositoryService,
    private readonly geminiService: GeminiService
  ) {}

  public createNewChat = (req: Request, res: Response, next: NextFunction) => {
    const {title} = req.body;
    if(!title || typeof title !== "string"|| title === "" ) {
      return next(CustomError.badRequest("Title is required"));
    }
    const createChatUseCase = new CreateChatIAUseCase(this.chatIARepository);
    createChatUseCase.execute(req.user!.id, title)
      .then((idChat) => res.status(201).json({result: idChat}))
      .catch(next);
  }

  public getChatsByUser = (req: Request, res: Response, next: NextFunction) => {  
    const getChatsUseCase = new GetChatsByUserUseCase(this.chatIARepository);
    getChatsUseCase.execute(req.user!.id)
      .then((results) => res.json({results: results.map(chat => chat.toJson())}))
      .catch(next);
  }

  public getMessagesFromChat = (req: Request, res: Response, next: NextFunction) => {  
    const idChat = req.params.idChat;
    const error = UuidDto.verify(idChat);
    if(error !== null) return next(CustomError.badRequest(error));  
    
    const getMessagesUseCase = new GetMessagesFromChatUseCase(this.chatIARepository);
    getMessagesUseCase.execute(idChat!.toString(), req.user!.id)
      .then((result) => res.json({result}))
      .catch(next);
  }

  public deleteChat = (req: Request, res: Response, next: NextFunction) => { 
    const idChat = req.params.idChat;
    const error = UuidDto.verify(idChat);
    if(error !== null) return next(CustomError.badRequest(error)); 
    
    const deleteChatUseCase = new DeleteChatUseCase(this.chatIARepository);
    deleteChatUseCase.execute(idChat!.toString(), req.user!.id)
      .then(() => res.json({result: "success"}))
      .catch(next);
  }

  public sendMessageToChat = async (req: Request, res: Response, next: NextFunction) => {
    const files = (req.files as Express.Multer.File[]) ?? [];
    try {
      const options = {
        prompt: req.body.prompt,
        files,
        chatId: req.params.idChat,
        idUsuario: req.user?.id
      }

      const [error, promptChatDTO] = PromptChatDTO.create(options);
      if(error) {
        return res.status(400).json({error});
      }

      const sendMessageToChatUseCase = new SendMessageToChatUseCase(this.chatIARepository, this.filesRepositoryService, this.geminiService);

      const userMessage = await sendMessageToChatUseCase.createUserMessage(promptChatDTO!);
      const stream = await sendMessageToChatUseCase.streamResponse(promptChatDTO!.chatId, promptChatDTO!.idUsuario, userMessage);

      res.setHeader('Content-Type', 'text/plain');
      res.status(200);

      let resultText = "";

      for await(const chunk of stream) {
        const piece = chunk.text;
        resultText += piece;
        res.write(piece);
      }
      res.end();

      const geminiMessage = await sendMessageToChatUseCase.createGeminiMessage(resultText);

      await sendMessageToChatUseCase.saveMessage(promptChatDTO!.chatId, promptChatDTO!.idUsuario, userMessage);
      await sendMessageToChatUseCase.saveMessage(promptChatDTO!.chatId, promptChatDTO!.idUsuario, geminiMessage);

    } catch(error) {
      next(error);
    } finally {
      await Promise.all(
        files.map(file => this.deleteLocalFile(file.path))
      );
    }
    return;
  }

  async deleteLocalFile(filePath: string): Promise<void> {
    try {
      if (filePath && existsSync(filePath)) {
        await unlink(filePath);
      }
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        Logger.error(`Error al eliminar el archivo temporal ${filePath}: ${error}`);
      }
    }
  }

}