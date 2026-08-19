import { describe, expect, test } from '@jest/globals';
import {
  emailValidatePage,
  emailValidatePageError,
  resetPasswordErrorPage,
  resetPasswordFailedPage,
  resetPasswordPage,
  resetPasswordSuccessPage,
} from '../src/presentation/auth/views/pages.js';

const messagePages = [
  resetPasswordErrorPage,
  resetPasswordSuccessPage,
  resetPasswordFailedPage,
  emailValidatePage,
  emailValidatePageError,
];

describe('Auth static pages', () => {
  test.each(messagePages)('aplica el diseño Calma sin JavaScript', (renderPage) => {
    const html = renderPage();

    expect(html).toContain('<html lang="es">');
    expect(html).toContain('background-color: #080F0F');
    expect(html).toContain('background: #0F1E1E');
    expect(html).toContain('border: 1px solid #1C3838');
    expect(html).toContain("font-family: 'Lora', Georgia, serif");
    expect(html).toContain('<svg class="logo"');
    expect(html).toContain('viewBox="0 0 1024 1024"');
    expect(html).toContain('<div class="brand">Mind Save</div>');
    expect(html).not.toContain('<script');
    expect(html).not.toMatch(/[ÃÂ]/);
  });

  test('renderiza los mensajes correspondientes a cada resultado', () => {
    expect(resetPasswordErrorPage()).toContain('El token no es válido o ha vencido.');
    expect(resetPasswordSuccessPage()).toContain('La contraseña se cambió con éxito.');
    expect(resetPasswordFailedPage()).toContain('Ocurrió un error al intentar cambiar la contraseña.');
    expect(emailValidatePage()).toContain('Email validado con éxito');
    expect(emailValidatePage()).toContain('Ya puedes iniciar sesión en la aplicación de Mind Save.');
    expect(emailValidatePageError()).toContain('No pudimos validar tu email');
  });

  test('mantiene el formulario de contraseña accesible y funcional', () => {
    const token = 'token-seguro';
    const html = resetPasswordPage(token);

    expect(html).toContain(`action="/api/auth/reset-password/${token}"`);
    expect(html).toContain('method="POST"');
    expect(html).toContain('<label for="password">Nueva contraseña</label>');
    expect(html).toContain('name="password"');
    expect(html).toContain('minlength="6"');
    expect(html).toContain('autocomplete="new-password"');
    expect(html).toContain('type="submit">Guardar contraseña</button>');
    expect(html).not.toContain('<script');
  });

  test('codifica el token antes de interpolarlo en el atributo action', () => {
    const token = 'token"><script>alert(1)</script>';
    const html = resetPasswordPage(token);

    expect(html).toContain(`/api/auth/reset-password/${encodeURIComponent(token)}`);
    expect(html).not.toContain(token);
    expect(html).not.toContain('<script>alert(1)</script>');
  });
});
