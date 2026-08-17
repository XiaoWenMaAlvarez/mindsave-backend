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
    user.password = bcryptAdapter.hash(user.password);
    const error = await this.adminUserRepository.createUser(user);
    if (error) throw CustomError.badRequest(error.toString());

    user.password = "";

    return user;
  }

}
