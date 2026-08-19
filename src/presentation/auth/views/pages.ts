

import fs from 'node:fs';
import path from 'node:path';

type MessagePageContent = {
  title: string;
  paragraph: string;
};

const loadLogoSvg = (): string => {
  try {
    const iconUrl = new URL('./icon.svg', import.meta.url);
    if (fs.existsSync(iconUrl)) {
      return fs.readFileSync(iconUrl, 'utf-8');
    }
    const srcPath = path.resolve(process.cwd(), 'src/presentation/auth/views/icon.svg');
    if (fs.existsSync(srcPath)) {
      return fs.readFileSync(srcPath, 'utf-8');
    }
  } catch {
    // Ignore and fallback to empty string
  }
  return '';
};

const rawLogo = loadLogoSvg();
const logo = rawLogo.includes('class="logo"')
  ? rawLogo
  : rawLogo.replace('<svg ', '<svg class="logo" ');

const createHTML = (title: string, body: string) => `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | Mind Save</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Lora:wght@400;600&amp;family=Inter:wght@400;500;600&amp;display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      min-height: 100vh;
      background-color: #080F0F;
      background-image: radial-gradient(ellipse 60% 40% at 50% 0%, #00B2B314 0%, transparent 70%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px;
      color: #D5ECEC;
      font-family: 'Inter', Arial, sans-serif;
    }

    body::before,
    body::after {
      content: '';
      position: fixed;
      top: 50%;
      left: 50%;
      border: 1px solid #00B2B30C;
      border-radius: 50%;
      pointer-events: none;
      transform: translate(-50%, -50%);
    }

    body::before {
      width: 520px;
      height: 520px;
    }

    body::after {
      width: 360px;
      height: 360px;
      border-color: #00B2B312;
    }

    .card {
      position: relative;
      z-index: 1;
      width: 100%;
      max-width: 440px;
      padding: 48px 40px 44px;
      overflow: hidden;
      background: #0F1E1E;
      border: 1px solid #1C3838;
      border-radius: 24px;
      box-shadow: 0 24px 64px rgba(0, 0, 0, .5);
      text-align: center;
    }

    .card::before {
      content: '';
      position: absolute;
      top: 0;
      right: 40px;
      left: 40px;
      height: 3px;
      background: linear-gradient(90deg, transparent, #00B2B3, transparent);
      border-radius: 0 0 3px 3px;
    }

    .logo {
      display: block;
      width: 72px;
      height: 72px;
      margin: 0 auto 28px;
    }

    .brand {
      margin-bottom: 32px;
      color: #4A8080;
      font-family: 'Lora', Georgia, serif;
      font-size: 13px;
      font-weight: 400;
      letter-spacing: 2.5px;
      text-transform: uppercase;
    }

    .divider {
      width: 48px;
      height: 2px;
      margin: 0 auto 28px;
      background: linear-gradient(90deg, transparent, #00B2B3, transparent);
      border-radius: 2px;
    }

    h1 {
      margin-bottom: 16px;
      color: #D5ECEC;
      font-family: 'Lora', Georgia, serif;
      font-size: clamp(22px, 5vw, 28px);
      font-weight: 600;
      line-height: 1.25;
    }

    p {
      color: #7A9E9E;
      font-size: 15px;
      font-weight: 400;
      line-height: 1.7;
    }

    form {
      margin-top: 28px;
      text-align: left;
    }

    label {
      display: block;
      margin-bottom: 8px;
      color: #B8D4D4;
      font-size: 14px;
      font-weight: 500;
    }

    input {
      width: 100%;
      min-height: 48px;
      padding: 13px 15px;
      color: #D5ECEC;
      background: #0A1717;
      border: 1px solid #285050;
      border-radius: 12px;
      font: inherit;
      outline: none;
      transition: border-color .2s ease, box-shadow .2s ease;
    }

    input::placeholder {
      color: #4A7373;
    }

    input:focus {
      border-color: #00B2B3;
      box-shadow: 0 0 0 3px #00B2B326;
    }

    .form-help {
      margin-top: 8px;
      font-size: 12px;
      line-height: 1.5;
    }

    button {
      width: 100%;
      min-height: 48px;
      margin-top: 24px;
      padding: 13px 20px;
      color: #061414;
      background: #00B2B3;
      border: 0;
      border-radius: 999px;
      box-shadow: 0 10px 28px #00B2B32E;
      cursor: pointer;
      font: inherit;
      font-size: 15px;
      font-weight: 600;
      transition: background-color .2s ease, transform .2s ease;
    }

    button:hover {
      background: #00CACB;
      transform: translateY(-1px);
    }

    button:focus-visible {
      outline: 3px solid #D5ECEC;
      outline-offset: 3px;
    }

    .footer {
      position: relative;
      z-index: 1;
      margin-top: 40px;
      color: #2E5252;
      font-size: 12px;
      letter-spacing: .3px;
      text-align: center;
    }

    @media (max-width: 520px) {
      body {
        padding: 20px;
      }

      .card {
        padding: 40px 24px 36px;
      }

      .card::before {
        right: 24px;
        left: 24px;
      }

      body::before {
        width: 420px;
        height: 420px;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      input,
      button {
        transition: none;
      }
    }
  </style>
</head>
<body>
  ${body}
  <footer class="footer">&copy; ${new Date().getFullYear()} Mind Save &middot; Todos los derechos reservados</footer>
</body>
</html>`;

const card = (content: string) => `
  <main class="card">
    ${logo}
    <div class="brand">Mind Save</div>
    <div class="divider" aria-hidden="true"></div>
    ${content}
  </main>
`;

const messagePage = ({ title, paragraph }: MessagePageContent) => createHTML(
  title,
  card(`
    <h1>${title}</h1>
    <p>${paragraph}</p>
  `),
);

export const resetPasswordErrorPage = () => messagePage({
  title: "Restablecer contraseña",
  paragraph: "El token no es válido o ha vencido.",
});

export const resetPasswordSuccessPage = () => messagePage({
  title: "Restablecer contraseña",
  paragraph: "La contraseña se cambió con éxito.",
});

export const resetPasswordFailedPage = () => messagePage({
  title: "Restablecer contraseña",
  paragraph: "Ocurrió un error al intentar cambiar la contraseña.",
});

export const emailValidatePage = () => messagePage({
  title: "Email validado con éxito",
  paragraph: "Ya puedes iniciar sesión en la aplicación de Mind Save.",
});

export const emailValidatePageError = () => messagePage({
  title: "No pudimos validar tu email",
  paragraph: "El token no es válido o ha vencido.",
});

export const resetPasswordPage = (token: string) => {
  const action = `/api/auth/reset-password/${encodeURIComponent(token)}`;

  return createHTML(
    "Restablecer contraseña",
    card(`
      <h1>Restablecer contraseña</h1>
      <p>Ingresa tu nueva contraseña para recuperar el acceso a tu cuenta.</p>
      <form action="${action}" method="POST">
        <label for="password">Nueva contraseña</label>
        <input
          id="password"
          type="password"
          name="password"
          placeholder="Ingresa tu nueva contraseña"
          minlength="6"
          autocomplete="new-password"
          aria-describedby="password-help"
          required
        >
        <p id="password-help" class="form-help">Debe tener al menos 6 caracteres.</p>
        <button type="submit">Guardar contraseña</button>
      </form>
    `),
  );
};
