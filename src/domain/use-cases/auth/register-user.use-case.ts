import type { EmailService } from '../../../config/nodemailer.adapter.js';
import { bcryptAdapter } from '../../../config/bcrypt.adapter.js';
import { CustomError } from '../../errors/custom.error.js';
import type { UserEntity } from '../../entities/auth/user.entity.js';
import type { UserRepository } from '../../repository/auth.repository.js';
import { EmailVerificationSender } from './email-verification-sender.js';

interface RegisterUserUseCase {
  execute(user: UserEntity): Promise<UserEntity>;
}

export class RegisterUser implements RegisterUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly emailService: EmailService,
    private readonly verifyEmailUrl: string
  ) {}

  async execute(user: UserEntity): Promise<UserEntity> {
    user.password = bcryptAdapter.hash(user.password);
    const error = await this.userRepository.register(user);
    if (error) throw CustomError.badRequest(error.toString());

    await new EmailVerificationSender(this.emailService, this.verifyEmailUrl)
      .execute(user.email, user.name);

    user.password = "";

    return user;
  }
}
