import type { ChatIARepository } from "../../init.js";

export interface CreateChatIAUseCaseInterface {
  execute(idUsuario: string, title: string): Promise<string>;
}

export class CreateChatIAUseCase implements CreateChatIAUseCaseInterface {
  constructor(
    private readonly repository: ChatIARepository
  ){}

  execute(idUsuario: string, title: string): Promise<string> {
    return this.repository.createNewChat(idUsuario, title);
  }
}
