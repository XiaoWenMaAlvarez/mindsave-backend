import type { EmailService } from '../../../config/nodemailer.adapter.js';
import type { UserRepository } from '../../repository/auth.repository.js';
import { EmailVerificationSender } from './email-verification-sender.js';

export class ResendEmailVerification {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly emailService: EmailService,
    private readonly verifyEmailUrl: string,
  ) {}

  async execute(email: string): Promise<void> {
    const user = await this.userRepository.findUnverifiedUserByEmail(email);
    if (!user) return;

    await new EmailVerificationSender(this.emailService, this.verifyEmailUrl)
      .execute(user.email, user.name);
  }
}
