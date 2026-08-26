import { JwtAdapter } from '../../../config/jwt.adapter.js';
import { EmailService } from '../../../config/nodemailer.adapter.js';
import {  UserRepository } from '../../init.js';
import { Logger } from '../../../config/logger.plugin.js';
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

    const token = JwtAdapter.generateToken({ email }, "password-reset", `${tokenTimeAliveMinutes}m`);
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
    const payload = JwtAdapter.validateToken<{email: string}>(token, "password-reset");
    if(payload == null || typeof payload.email !== "string" || payload.email.trim() === "") return false;
    const tokenValid = await this.userRepository.verifyUserByEmailAndToken(payload.email, token);
    if(tokenValid !== true ) return false;
    return true;
  }


  
  async setNewPassword(token: string, password: string): Promise<boolean> {
    if(typeof token !== "string" || token.trim() === "") return false;
    if(typeof password !== "string" || password.length < 6) return false;
    const payload = JwtAdapter.validateToken<{email: string}>(token, "password-reset");
    if(payload == null || typeof payload.email !== "string" || payload.email.trim() === "") return false;
    const newPassword = bcryptAdapter.hash(password);
    return await this.userRepository.resetPassword(payload.email, token, newPassword);
  }

private async sendEmailResetPasswordLink(email: string, link: string, tokenTimeAliveMinutes: number) {
    const escapeHtml = (value: string) => value.replace(
      /[&<>"']/g,
      (character) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
      })[character] ?? character
    );

    const safeEmail = escapeHtml(email);
    const safeLink = escapeHtml(link);
    const currentYear = new Date().getFullYear();

    const htmlBody = `
      <!doctype html>
      <html lang="es">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <meta name="color-scheme" content="light only">
          <title>Restablece tu contraseña en Mind Save</title>
          <style>
            @media only screen and (max-width: 600px) {
              .email-shell { padding: 16px 8px !important; }
              .email-section { padding-left: 24px !important; padding-right: 24px !important; }
              .reset-password-button { display: block !important; padding-left: 20px !important; padding-right: 20px !important; }
            }
          </style>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f0f8f8; color: #3a6060;">
          <div style="display: none; max-height: 0; overflow: hidden; opacity: 0; color: transparent;">
            Crea una nueva contraseña para tu cuenta de Mind Save.
          </div>

          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width: 100%; background-color: #f0f8f8;">
            <tr>
              <td class="email-shell" align="center" style="padding: 32px 16px;">
                <table role="presentation" width="560" cellspacing="0" cellpadding="0" border="0" style="width: 100%; max-width: 560px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 32px rgba(0, 80, 80, 0.1); overflow: hidden;">
                  <tr>
                    <td class="email-section" style="padding: 28px 40px; background-color: #0a1818;">
                      <div style="font-family: 'Lora', Georgia, serif; font-size: 22px; line-height: 1.1; color: #d5ecec;">Mind Save</div>
                      <div style="margin-top: 4px; font-family: 'Inter', Arial, sans-serif; font-size: 11px; line-height: 1.4; letter-spacing: 1.5px; text-transform: uppercase; color: #4a8080;">Bienestar cognitivo</div>
                    </td>
                  </tr>
                  <tr>
                    <td height="4" style="height: 4px; background-color: #00b2b3; font-size: 0; line-height: 0;">&nbsp;</td>
                  </tr>

                  <tr>
                    <td class="email-section" align="center" style="padding: 40px 40px 32px; border-bottom: 1px solid #cce8e8;">
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td align="center" valign="middle" width="60" height="60" style="width: 60px; height: 60px; border: 2px solid #cfecec; border-radius: 50%; background-color: #effafa; font-family: Arial, sans-serif; font-size: 26px; line-height: 60px; color: #00b2b3;">&#128274;</td>
                        </tr>
                      </table>
                      <h1 style="margin: 20px 0 12px; font-family: 'Lora', Georgia, serif; font-size: 26px; font-weight: 400; line-height: 1.25; color: #183030;">Restablece tu contraseña</h1>
                      <p style="max-width: 380px; margin: 0 auto; font-family: 'Inter', Arial, sans-serif; font-size: 15px; line-height: 1.7; color: #3a6060;">
                        Hola. Recibimos una solicitud para restablecer la contraseña de tu cuenta en Mind Save.
                      </p>
                    </td>
                  </tr>

                  <tr>
                    <td class="email-section" align="center" style="padding: 36px 40px; border-bottom: 1px solid #cce8e8;">
                      <p style="margin: 0 0 20px; font-family: 'Inter', Arial, sans-serif; font-size: 13px; line-height: 1.5; letter-spacing: 0.3px; color: #7a9e9e;">Haz clic en el botón para crear una nueva contraseña</p>
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td align="center" bgcolor="#00b2b3" style="border-radius: 50px; box-shadow: 0 6px 24px rgba(0, 178, 179, 0.27);">
                            <a class="reset-password-button" href="${safeLink}" target="_blank" style="display: inline-block; padding: 16px 44px; border-radius: 50px; font-family: 'Inter', Arial, sans-serif; font-size: 16px; font-weight: 700; line-height: 1.2; letter-spacing: 0.3px; color: #fff; text-decoration: none;">&#128273;&nbsp;&nbsp;Restablecer contraseña</a>
                          </td>
                        </tr>
                      </table>
                      <p style="margin: 18px 0 0; font-family: 'Inter', Arial, sans-serif; font-size: 12px; line-height: 1.5; color: #7a9e9e;">Este enlace expira en <strong style="color: #c05000;">${tokenTimeAliveMinutes} minutos</strong></p>
                    </td>
                  </tr>

                  <tr>
                    <td class="email-section" style="padding: 24px 40px; background-color: #f7fdfd; border-bottom: 1px solid #cce8e8;">
                      <p style="margin: 0 0 8px; font-family: 'Inter', Arial, sans-serif; font-size: 12px; line-height: 1.5; color: #7a9e9e;">Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:</p>
                      <div style="padding: 10px 14px; border: 1px solid #d9f0f0; border-radius: 8px; background-color: #f2fbfb; font-family: 'Courier New', monospace; font-size: 11px; line-height: 1.6; word-break: break-all;">
                        <a href="${safeLink}" target="_blank" style="color: #008c8d; text-decoration: underline;">${safeLink}</a>
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td class="email-section" style="padding: 20px 40px; border-bottom: 1px solid #cce8e8;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td align="center" valign="middle" width="32" height="32" style="width: 32px; height: 32px; border-radius: 8px; background-color: #fef3e2; font-family: Arial, sans-serif; font-size: 18px; font-weight: 700; line-height: 32px; color: #c05000;">!</td>
                          <td style="padding-left: 12px; font-family: 'Inter', Arial, sans-serif; font-size: 12px; line-height: 1.65; color: #7a9e9e;">
                            <strong style="color: #7a3800;">¿No solicitaste este cambio?</strong> Ignora este correo con seguridad: tu contraseña actual seguirá siendo la misma y nadie ha accedido a tu cuenta.
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <tr>
                    <td class="email-section" align="center" style="padding: 24px 40px;">
                      <div style="margin-bottom: 6px; font-family: 'Lora', Georgia, serif; font-size: 14px; line-height: 1.4; color: #3a6060;">Mind Save</div>
                      <div style="font-family: 'Inter', Arial, sans-serif; font-size: 11px; line-height: 1.7; color: #7a9e9e;">
                        Este correo fue enviado a <strong>${safeEmail}</strong><br>
                        &copy; ${currentYear} Mind Save &middot; Todos los derechos reservados
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    const options = {
      to: email,
      subject: 'Restablece tu contraseña - Mind Save',
      htmlBody: htmlBody,
    };

    const isSent = await this.emailService.sendEmail(options);
    if (!isSent) Logger.error('Error al enviar correo de restablecimiento de contraseña');
  }

}
