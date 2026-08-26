import { CustomError, UserEntity, AdminUserRepository } from '../../../init.js';
import { bcryptAdapter } from '../../../../config/bcrypt.adapter.js';

interface RegisterUserAdminUseCase {
  execute(user: UserEntity): Promise<UserEntity>;
}

export class CreateUserAdmin implements RegisterUserAdminUseCase {
  constructor(
    private readonly adminUserRepository: AdminUserRepository,
  ) {}

  async execute(user: UserEntity): Promise<UserEntity> {
    if (!user.password || typeof user.password !== "string" || user.password.length < 6) {
      throw CustomError.badRequest("La contraseña debe tener al menos 6 caracteres");
    }
    user.password = bcryptAdapter.hash(user.password);
    const result = await this.adminUserRepository.createUser(user);
    if (typeof result === "string") throw CustomError.badRequest(result);
    result.password = "";
    return result;
  }

}
