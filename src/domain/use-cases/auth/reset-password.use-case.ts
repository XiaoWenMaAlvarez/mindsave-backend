import { JwtAdapter } from '../../../config/jwt.adapter.js';
import { EmailService } from '../../../config/nodemailer.adapter.js';
import {  UserRepository } from '../../init.js';
import { Logger } from '../../../plugins/init.js';
import { bcryptAdapter } from '../../../config/bcrypt.adapter.js';

export interface ResetPasswordUseCaseInterface {
  sendResetPasswordEmail(email: string, tokenTimeAliveMinutes: number): Promise<void>;
  setNewPassword(token: string, password: string): Promise<boolean>;
}

export class ResetPasswordUseCase implements ResetPasswordUseCaseInterface {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly emailService: EmailService,
    private readonly resetPasswordUrl: string
  ) {}

  async sendResetPasswordEmail(email: string, tokenTimeAliveMinutes: number): Promise<void> {
    const userExists = await this.userRepository.verifyUserByEmail(email);
    if(userExists !== true ) return;

    const token = JwtAdapter.generateToken({ email },`${tokenTimeAliveMinutes}m`);
    if(token == null) {
      Logger.error(`Error al generar un token con el email ${email}`);
      return;
    }
    await this.userRepository.createResetPasswordToken(email, token, tokenTimeAliveMinutes);
    const resetPasswordUrlWithToken = `${this.resetPasswordUrl}/${token}`;
    await this.sendEmailResetPasswordLink(email, resetPasswordUrlWithToken, tokenTimeAliveMinutes);
    return;
  }


  async validateResetPasswordToken(token: string): Promise<boolean> {
    const payload = JwtAdapter.validateToken<{email: string}>(token);
    if(payload == null) return false;
    const tokenValid = await this.userRepository.verifyUserByEmailAndToken(payload.email, token);
    if(tokenValid !== true ) return false;
    return true;
  }


  
  async setNewPassword(token: string, password: string): Promise<boolean> {
    const payload = JwtAdapter.validateToken<{email: string}>(token);
    if(payload == null) return false;
    const newPassword = bcryptAdapter.hash(password);
    return await this.userRepository.resetPassword(payload.email, token, newPassword);
  }


  private async sendEmailResetPasswordLink(email: string, link: string, tokenTimeAliveMinutes: number) {
    const htmlBody = `
      <h1>Restablece tu contraseña para MindSave</h1>
      <p>Haz clic en el siguiente enlace (válido por ${tokenTimeAliveMinutes} minutos):</p>
      <a href="${link}">Restablecer contraseña</a>
    `;

    const options = {
      to: email,
      subject: 'Restablecer contraseña - MindSave',
      htmlBody: htmlBody,
    };

    const isSent = await this.emailService.sendEmail(options);
    if (!isSent) Logger.error('Error al enviar correo de restablecimiento de contraseña');
  }

}
