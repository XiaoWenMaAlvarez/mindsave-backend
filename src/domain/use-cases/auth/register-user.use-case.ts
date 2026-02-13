import { JwtAdapter } from '../../../config/jwt.adapter.js';
import { EmailService } from '../../../config/nodemailer.adapter.js';
import { CustomError, UserEntity, UserRepository } from '../../init.js';
import { bcryptAdapter } from '../../../config/bcrypt.adapter.js';

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

    const token = JwtAdapter.generateToken({ email: user.email });
    if (!token) throw CustomError.internalServerError('Error al generar token de verificación');

    const verifyEmailUrlWithToken = `${this.verifyEmailUrl}/${token}`;

    await this.sendEmailValidationLink(user.email, verifyEmailUrlWithToken);

    user.password = "";

    return user;
  }

  private async sendEmailValidationLink(email: string, link: string) {
    const htmlBody = `
      <h1>Valida tu correo electrónico</h1>
      <p>Haz clic en el siguiente enlace para validar tu cuenta en MindSave:</p>
      <a href="${link}">Validar mi cuenta: ${email}</a>
    `;

    const options = {
      to: email,
      subject: 'Validar cuenta - MindSave',
      htmlBody: htmlBody,
    };

    const isSent = await this.emailService.sendEmail(options);
    if (!isSent) throw CustomError.internalServerError('Error al enviar correo de verificación');
  }

}
