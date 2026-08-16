import { CustomError, UserEntity, AdminAuthRepository } from '../../../init.js';
import { bcryptAdapter } from '../../../../config/bcrypt.adapter.js';

interface RegisterAdminUseCase {
  execute(user: UserEntity): Promise<UserEntity>;
}

export class RegisterAdmin implements RegisterAdminUseCase {
  
  constructor(
    private readonly userRepository: AdminAuthRepository,
  ) {}

  async execute(user: UserEntity): Promise<UserEntity> {
    user.password = bcryptAdapter.hash(user.password);
    const result = await this.userRepository.register(user);
    if (typeof result === "string") throw CustomError.badRequest(result.toString());
    result.password = "";
    return result;
  }

}
