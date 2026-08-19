import { describe, expect, jest, test } from '@jest/globals';
import { EmailService, type SendMailOptions } from '../src/config/nodemailer.adapter.js';
import type { UserRepository } from '../src/domain/init.js';
import { ResetPasswordUseCase } from '../src/domain/use-cases/auth/reset-password.use-case.js';

type SendEmailResetPasswordLink = (
  email: string,
  link: string,
  tokenTimeAliveMinutes: number
) => Promise<void>;

const createUseCase = () => {
  const sendEmail = jest.fn<(options: SendMailOptions) => Promise<boolean>>();
  sendEmail.mockResolvedValue(true);

  const emailService = Object.create(EmailService.prototype) as EmailService;
  emailService.sendEmail = sendEmail;

  const useCase = new ResetPasswordUseCase(
    undefined as unknown as UserRepository,
    emailService,
    'https://mindsave.test/reset-password'
  );

  const sendResetPasswordEmail = Reflect.get(
    useCase,
    'sendEmailResetPasswordLink'
  ) as SendEmailResetPasswordLink;

  return {
    sendEmail,
    sendResetPasswordEmail: sendResetPasswordEmail.bind(useCase),
  };
};

describe('ResetPasswordUseCase - correo de restablecimiento', () => {
  test('envía el diseño Calma con CTA, expiración y aviso de seguridad', async () => {
    const { sendEmail, sendResetPasswordEmail } = createUseCase();
    const email = 'usuario@example.com';
    const link = 'https://mindsave.test/reset-password/token-seguro';

    await sendResetPasswordEmail(email, link, 15);

    expect(sendEmail).toHaveBeenCalledTimes(1);
    const options = sendEmail.mock.calls[0]?.[0];
    if (!options) throw new Error('No se capturaron las opciones del correo');

    expect(options.to).toBe(email);
    expect(options.subject).toBe('Restablece tu contraseña - Mind Save');
    expect(options.htmlBody).toContain('Restablece tu contraseña');
    expect(options.htmlBody).toContain('Bienestar cognitivo');
    expect(options.htmlBody).toContain('background-color: #00b2b3');
    expect(options.htmlBody).toContain(`href="${link}"`);
    expect(options.htmlBody).toContain(`>${link}</a>`);
    expect(options.htmlBody).toContain(`<strong>${email}</strong>`);
    expect(options.htmlBody).toContain('<strong style="color: #c05000;">15 minutos</strong>');
    expect(options.htmlBody).toContain('¿No solicitaste este cambio?');
  });

  test('escapa el correo y el enlace antes de insertarlos en el HTML', async () => {
    const { sendEmail, sendResetPasswordEmail } = createUseCase();

    await sendResetPasswordEmail(
      'usuario@example.com<script>',
      'https://mindsave.test/reset-password?token="<script>',
      15
    );

    const options = sendEmail.mock.calls[0]?.[0];
    if (!options) throw new Error('No se capturaron las opciones del correo');

    expect(options.htmlBody).not.toContain('<script>');
    expect(options.htmlBody).toContain('usuario@example.com&lt;script&gt;');
    expect(options.htmlBody).toContain('token=&quot;&lt;script&gt;');
  });
});
