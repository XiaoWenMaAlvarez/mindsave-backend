const createHTML = (body: string) => {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Nueva Contraseña</title>
        <style>
            body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #f4f4f4; }
            .card { background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); width: 100%; max-width: 400px; }
            input { width: 100%; padding: 10px; margin: 10px 0; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; }
            button { width: 100%; padding: 10px; background-color: #007BFF; color: white; border: none; border-radius: 4px; cursor: pointer; }
        </style>
    </head>
    <body>
        ${body}
    </body>
    </html>
  `;
}

const cardWithTitleAndSubtitle = (title: string, subtitle: string) => {
  return `
    <div class="card">
        <h2>${title}</h2>
        <p>${subtitle}</p>
    </div>
  `;
}

export const resetPasswordErrorPage = () => {
  const title = "Restablecer Contraseña"
  const subtitle = "Token inválido o vencido";
  const body = cardWithTitleAndSubtitle(title, subtitle);
  return createHTML(body);
}

export const resetPasswordSuccessPage = () => {
  const title = "Restablecer Contraseña"
  const subtitle = "Contraseña cambiada con éxito";
  const body = cardWithTitleAndSubtitle(title, subtitle);
  return createHTML(body);
}

export const resetPasswordFailedPage = () => {
  const title = "Restablecer Contraseña"
  const subtitle = "Error al intentar cambiar la contraseña";
  const body = cardWithTitleAndSubtitle(title, subtitle);
  return createHTML(body);
}

export const emailValidatePage = () => {
  const title = "Email validado con éxito"
  const subtitle = "Ya puede iniciar sesión en la aplicación de MindSave";
  const body = cardWithTitleAndSubtitle(title, subtitle);
  return createHTML(body);
}

export const emailValidatePageError = () => {
  const title = "Error al intentar validar el email"
  const subtitle = "Token no válido o vencido";
  const body = cardWithTitleAndSubtitle(title, subtitle);
  return createHTML(body);
}

export const resetPasswordPage = (token: string) => {
  const body = `
    <div class="card">
        <h2>Restablecer Contraseña</h2>
        <p>Ingresa tu nueva contraseña a continuación.</p>
        
        <form action="/api/auth/reset-password/${token}" method="POST">
            <input type="password" name="password" placeholder="Nueva contraseña" required minlength="6">
            <button type="submit">Guardar Contraseña</button>
        </form>
    </div>
  `;
  return createHTML(body);
}