import { type Request, type Response } from 'express';
import { Logger } from '../../config/logger.plugin.js';
import { ChatIARepository, CreateChatIAUseCase, CustomError, DeleteChatUseCase, GetChatsByUserUseCase, GetMessagesFromChatUseCase, SendMessageToChatUseCase } from '../../domain/init.js';
import { UuidDto, PromptChatDTO } from '../validators/dtos/init.js';
import type { FilesRepositoryService, GeminiService } from '../services/init.js';

export class ChatIAController {

  constructor(
    private readonly chatIARepository: ChatIARepository,
    private readonly filesRepositoryService: FilesRepositoryService,
    private readonly geminiService: GeminiService
  ) {}

  private handleError = (res: Response, error: any) => {
    if(error instanceof CustomError) {
      res.status(error.statusCode).json({error: error.message});
      return;
    } 
    Logger.error(`${error}`);
    res.status(500).json({error: "Internal Server Error"});
  }

  public createNewChat = (req: Request, res: Response) => {
    const {title} = req.body;
    if(!title || typeof title !== "string"|| title === "" ) {
      this.handleError(res, new CustomError("Title is required", 400));
      return; 
    }
    const createChatUseCase = new CreateChatIAUseCase(this.chatIARepository);
    createChatUseCase.execute(req.body.payload.id, title)
      .then((idChat) => res.status(201).json({result: idChat}))
      .catch(error => this.handleError(res, error));
  }

  public getChatsByUser = (req: Request, res: Response) => {  
    const getChatsUseCase = new GetChatsByUserUseCase(this.chatIARepository);
    getChatsUseCase.execute(req.body.payload.id)
      .then((results) => res.json({results: results.map(chat => chat.toJson())}))
      .catch(error => this.handleError(res, error));
  }

  public getMessagesFromChat = (req: Request, res: Response) => {  
    const idChat = req.params.idChat;
    const error = UuidDto.verify(idChat);
    if(error !== null) return this.handleError(res, new CustomError(error, 400));  
    
    const getMessagesUseCase = new GetMessagesFromChatUseCase(this.chatIARepository);
    getMessagesUseCase.execute(idChat!.toString(), req.body.payload.id)
      .then((result) => res.json({result}))
      .catch(error => this.handleError(res, error));
  }

  public deleteChat = (req: Request, res: Response) => { 
    const idChat = req.params.idChat;
    const error = UuidDto.verify(idChat);
    if(error !== null) return this.handleError(res, new CustomError(error, 400)); 
    
    const deleteChatUseCase = new DeleteChatUseCase(this.chatIARepository);
    deleteChatUseCase.execute(idChat!.toString(), req.body.payload.id)
      .then(() => res.json({result: "success"}))
      .catch(error => this.handleError(res, error));
  }

  public sendMessageToChat = async (req: Request, res: Response) => {
    try {
      const options = {
        prompt: req.body.prompt,
        files: req.files as Express.Multer.File[] ?? [],
        chatId: req.params.idChat,
        idUsuario: req.body.payload.id
      }

      const [error, promptChatDTO] = PromptChatDTO.create(options);
      if(error) return res.status(400).json({error});

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
      Logger.error(`${error}`);
      this.handleError(res, error);
    }
    return;
  }

}