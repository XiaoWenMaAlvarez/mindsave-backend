import { describe, expect, jest, test } from '@jest/globals';
import { EmailService, type SendMailOptions } from '../src/config/nodemailer.adapter.js';
import type { UserRepository } from '../src/domain/init.js';
import { RegisterUser } from '../src/domain/use-cases/auth/register-user.use-case.js';

type SendEmailValidationLink = (email: string, link: string, name: string) => Promise<void>;

const createUseCase = () => {
  const sendEmail = jest.fn<(options: SendMailOptions) => Promise<boolean>>();
  sendEmail.mockResolvedValue(true);

  const emailService = Object.create(EmailService.prototype) as EmailService;
  emailService.sendEmail = sendEmail;

  const useCase = new RegisterUser(
    undefined as unknown as UserRepository,
    emailService,
    'https://mindsave.test/validate-email'
  );

  const sendValidationEmail = Reflect.get(
    useCase,
    'sendEmailValidationLink'
  ) as SendEmailValidationLink;

  return { sendEmail, sendValidationEmail: sendValidationEmail.bind(useCase) };
};

describe('RegisterUser - correo de validación', () => {
  test('envía el diseño Calma con un CTA y un enlace alternativo', async () => {
    const { sendEmail, sendValidationEmail } = createUseCase();
    const email = 'usuario@example.com';
    const link = 'https://mindsave.test/validate-email/token-seguro';

    await sendValidationEmail(email, link, 'María');

    expect(sendEmail).toHaveBeenCalledTimes(1);
    const options = sendEmail.mock.calls[0]?.[0];
    if (!options) throw new Error('No se capturaron las opciones del correo');

    expect(options.to).toBe(email);
    expect(options.subject).toBe('Valida tu cuenta - Mind Save');
    expect(options.htmlBody).toContain('Valida tu cuenta');
    expect(options.htmlBody).toContain('Bienestar cognitivo');
    expect(options.htmlBody).toContain('<strong style="color: #183030;">María</strong>');
    expect(options.htmlBody).toContain('background-color: #00b2b3');
    expect(options.htmlBody).toContain(`href="${link}"`);
    expect(options.htmlBody).toContain(`>${link}</a>`);
    expect(options.htmlBody).toContain(`<strong>${email}</strong>`);
    expect(options.htmlBody).toContain('<strong style="color: #3a6060;">24 horas</strong>');
    expect(options.htmlBody).toContain('¿No creaste esta cuenta?');
  });

  test('escapa el correo y el enlace antes de insertarlos en el HTML', async () => {
    const { sendEmail, sendValidationEmail } = createUseCase();

    await sendValidationEmail(
      'usuario@example.com<script>',
      'https://mindsave.test/validate?token="<script>',
      'María<script>'
    );

    const options = sendEmail.mock.calls[0]?.[0];
    if (!options) throw new Error('No se capturaron las opciones del correo');

    expect(options.htmlBody).not.toContain('<script>');
    expect(options.htmlBody).toContain('usuario@example.com&lt;script&gt;');
    expect(options.htmlBody).toContain('token=&quot;&lt;script&gt;');
    expect(options.htmlBody).toContain('María&lt;script&gt;');
  });
});
