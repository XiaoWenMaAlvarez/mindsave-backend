import { JwtAdapter } from '../../../config/jwt.adapter.js';
import { CustomError, UserRepository } from '../../init.js';

interface ValidateEmailUseCase {
  execute(token: string): Promise<boolean>;
}

export class ValidateEmail implements ValidateEmailUseCase {
  constructor(
    private readonly userRepository: UserRepository,
  ) {}

  async execute(token: string): Promise<boolean> {
    const payload = JwtAdapter.validateToken<{ email: string }>(token, "email-verification");
    if (!payload || typeof payload.email !== "string" || payload.email.trim() === "") {
      throw CustomError.badRequest('Token inválido');
    }

    const result = await this.userRepository.validateEmail(payload.email);
    if (!result) throw CustomError.internalServerError("Email no existe");
    
    return true;
  }
}
