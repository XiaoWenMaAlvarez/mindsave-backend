# MindSave Backend — especificación funcional y técnica AS-IS

> Documento de referencia para derivar casos de uso extendidos, diagramas UML, vistas de arquitectura, modelos de datos, diagramas de actividad y diagramas de secuencia. Describe exclusivamente el sistema implementado en el repositorio, sin proponer un estado futuro.

## 1. Identificación y alcance

| Atributo | Valor |
|---|---|
| Proyecto | MindSave Backend |
| Repositorio | `mindsave-backend` |
| Rama analizada | `main` |
| Revisión analizada | `dcf8c84787451d88ba741cc00e3ecb1542d882a0` |
| Fecha del análisis | 27 de agosto de 2026 |
| Runtime | Node.js con módulos ESM |
| Lenguaje | TypeScript estricto |
| API HTTP | Express 5 |
| Persistencia | PostgreSQL mediante Prisma |

La fuente de verdad de este documento es el código ejecutable: composición de rutas, middleware, schemas Zod, DTO, controladores, casos de uso, contratos de repositorio y datasource, implementaciones Prisma, entidades, adaptadores externos y `prisma/schema.prisma`. `src/config/swagger.config.ts` contiene la especificación OpenAPI publicada por la propia aplicación.

El alcance incluye:

- las 33 operaciones HTTP funcionales y operacionales registradas por método;
- los dos puntos de acceso a la documentación OpenAPI/Swagger;
- autenticación, roles, propiedad de recursos y respuestas HTTP;
- validaciones y estructuras de entrada y salida;
- recorrido de cada operación desde Express hasta PostgreSQL o un proveedor externo;
- agregados, entidades, relaciones, cardinalidades, restricciones y transacciones;
- interacción con Gemini, Cloudinary y Nodemailer;
- arranque, cierre, health check, archivos temporales, logging y seed.

Los clientes Flutter y web mencionados en el README son consumidores externos y no forman parte de este repositorio.

## 2. Responsabilidad funcional del sistema

MindSave Backend expone una API de apoyo al bienestar mental con cinco áreas funcionales:

1. **Identidad de usuario:** registro, validación de email, login, comprobación de sesión y recuperación de contraseña.
2. **Administración profesional:** login profesional y creación, consulta, modificación, baja lógica y restauración de cuentas.
3. **Test breve de estado de ánimo:** registro diario de puntuaciones de depresión, impulso suicida, ansiedad física y ansiedad emocional.
4. **Registro cognitivo:** almacenamiento de un suceso trastornador, grupos de emociones, pensamientos, porcentajes de creencia y distorsiones cognitivas.
5. **Chat con IA:** conversaciones con Gemini, respuesta en streaming y adjuntos almacenados en Cloudinary y Gemini Files.

El sistema también publica un health check y su especificación OpenAPI. No hay rutas que asignen usuarios a profesionales ni rutas profesionales para consultar tests, registros cognitivos o chats de otras personas.

## 3. Actores y sistemas colaboradores

| Actor o sistema | Participación implementada |
|---|---|
| Visitante | Registra una cuenta de usuario, valida el email, solicita reenvío de validación, inicia sesión, solicita recuperación de contraseña y usa el formulario de cambio de contraseña. También consulta health y documentación. |
| Usuario final | Posee una cuenta activa con rol `USER_ROL` y un JWT de sesión. Gestiona sus propios tests, registros cognitivos y chats. |
| Profesional/administrador | Posee una cuenta activa con rol `PROFESIONAL_ROL` y un JWT de sesión. Gestiona cuentas mediante `/admin/user`. |
| Monitor de operación | Consume `GET /health`. |
| PostgreSQL | Conserva usuarios, roles, tests, registros cognitivos, chats, mensajes y metadatos de adjuntos. |
| Gemini | Aloja una copia de adjuntos y genera respuestas conversacionales en streaming. |
| Cloudinary | Aloja una copia accesible por URL de los adjuntos del chat. |
| Proveedor de correo | Entrega emails de validación de cuenta y recuperación de contraseña a través de Nodemailer. |
| Sistema de archivos local | Mantiene temporalmente uploads en `uploads/` y escribe logs Winston en `logs/`. |

## 4. Plataforma, configuración y ejecución

### 4.1 Componentes tecnológicos

| Área | Implementación actual |
|---|---|
| Servidor HTTP | Express `5.2.1` y CORS `2.8.6`. |
| Lenguaje/compilación | TypeScript `5.9.3`, `module` y `moduleResolution` `NodeNext`, target `esnext`. |
| Validación | Zod `4.3.6` y `zod-validation-error`. |
| ORM | Prisma CLI `7.9.1`, cliente `7.10.0` y adaptador `@prisma/adapter-pg`. |
| Base de datos | PostgreSQL, con conexión runtime a través de `pg`. |
| Contraseñas | bcrypt `6.0.0`. |
| Sesiones y enlaces | JSON Web Token con `jsonwebtoken` `9.0.3`. |
| Inteligencia artificial | `@google/genai` `1.43.0`; modelo configurado `gemini-3-flash-preview`. |
| Archivos remotos | Cloudinary `2.9.0`. |
| Multipart | Multer `2.0.2`. |
| Correo | Nodemailer `9.0.5`. |
| Logging | Winston `3.19.0`. |
| Documentación | OpenAPI `3.0.3` y Swagger UI. |
| Pruebas | Jest, ts-jest y Supertest. |

### 4.2 Arranque del proceso

`src/app.ts` importa `AppRoutes`, `Server` y `envs`, crea una instancia de `Server` con el puerto configurado y llama a `start()`.

`Server.start()` configura la aplicación en este orden:

1. `express.json()` para cuerpos JSON.
2. Middleware CORS.
3. `express.urlencoded({extended: true})` para el formulario HTML de recuperación.
4. Router compuesto de la aplicación.
5. `ErrorMiddleware.handleError` como manejador final.
6. Listener HTTP en `PORT`.

Los tiempos del servidor HTTP son:

| Parámetro | Valor por defecto |
|---|---:|
| `requestTimeout` | 60 000 ms |
| `headersTimeout` | 65 000 ms |
| `keepAliveTimeout` | 60 000 ms |

Al recibir `SIGINT` o `SIGTERM`, el proceso cierra el listener, ejecuta `prisma.$disconnect()` y termina.

### 4.3 CORS

La configuración permite credenciales y acepta estos orígenes:

- `https://mindsave-admin.vercel.app`
- `http://localhost:5173`

Métodos permitidos: `GET`, `POST`, `PUT`, `DELETE` y `OPTIONS`. Headers permitidos: `Content-Type` y `Authorization`.

### 4.4 Variables de entorno consumidas por la aplicación

| Grupo | Variables |
|---|---|
| Proceso HTTP | `PORT`, `NODE_ENV`, `WEBSERVICE_URL` |
| Aplicación/PostgreSQL | `DATABASE_URL` |
| JWT | `JWT_SEED`, `JWT_EMAIL_VERIFICATION_SEED`, `JWT_PASSWORD_RESET_SEED` |
| Correo | `MAILER_SERVICE`, `MAILER_EMAIL`, `MAILER_SECRET_KEY` |
| Gemini | `GEMINI_API_KEY` |
| Cloudinary | `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `CLOUDINARY_CLOUD_NAME` |

Los tres secretos JWT deben ser distintos. `DATABASE_URL` es la conexión que usa la API. `prisma.config.ts` y `prisma/seed.ts` prefieren `DATABASE_URL_UNPOOLED` y usan `DATABASE_URL` como alternativa.

`.env.example` también enumera variables del contenedor PostgreSQL, del seed administrativo y de Neon: `POSTGRES_USER`, `POSTGRES_DB`, `POSTGRES_PASSWORD`, `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` y `NEON_BRANCH`.

### 4.5 Comandos y artefactos de ejecución

| Acción | Comando |
|---|---|
| Desarrollo | `npm run dev` |
| Build | `npm run build` |
| Ejecución compilada | `npm start` |
| Pruebas | `npm test -- --runInBand` |
| Generar cliente Prisma | `npx prisma generate` |
| Validar schema | `npx prisma validate` |
| Ejecutar seed | `npx prisma db seed` |

El build genera Prisma Client en `src/generated/prisma`, elimina `dist` y compila `src` a `dist`. `compose.yaml` declara PostgreSQL, publica el puerto `5432` y monta `./postgres` como volumen local.

## 5. Arquitectura de implementación

### 5.1 Capas

| Capa | Ubicación | Responsabilidad |
|---|---|---|
| Presentación | `src/presentation` | Routers, middleware, DTO, schemas Zod, controladores, serialización HTTP y páginas HTML. |
| Dominio/aplicación | `src/domain` | Entidades, `CustomError`, casos de uso y contratos abstractos de repositorio/datasource. |
| Infraestructura | `src/infrastructure` | Repositorios concretos, datasources Prisma, mappers y modelos de lectura. |
| Datos | `src/data/postgres` | Instancia compartida de `PrismaClient` con `PrismaPg`. |
| Adaptadores/configuración | `src/config` | Entorno, bcrypt, JWT, correo, Gemini, Cloudinary, timeouts, logging, OpenAPI e instrucción de sistema. |
| Composición | `src/presentation/routes.ts` y cada `routes.ts` | Construcción y enlace de implementaciones concretas. |

El recorrido predominante de una petición es:

```text
Cliente HTTP
  -> Router Express
  -> middleware de autenticación/upload
  -> schema Zod y DTO
  -> controller
  -> caso de uso
  -> interfaz de repository
  -> repository concreto
  -> interfaz de datasource
  -> datasource Prisma
  -> PostgreSQL
```

Las operaciones de chat agregan Cloudinary, Gemini Files y Gemini Chat. Las operaciones de registro/recuperación agregan JWT y Nodemailer. El health check consulta directamente adaptadores y Prisma desde su controlador.

### 5.2 Composición por módulo

| Módulo | Objetos construidos |
|---|---|
| Auth de usuario | `UserDatasourceImpl -> UserRepositoryImpl -> AuthController`; reutiliza `EmailService` y crea `AuthMiddleware`. |
| Auth profesional | `AdminAuthDatasourceImpl -> AdminAuthRepositoryImpl -> AdminAuthController`; el middleware consulta un `UserRepositoryImpl`. |
| Administración de usuarios | `AdminUserDatasourceImpl -> AdminUserRepositoryImpl -> AdminUserController`; autenticación mediante `AuthMiddleware`. |
| Test breve | `TestBreveEstadoDeAnimoDatasourceImpl -> TestBreveEstadoDeAnimoRepositoryImpl -> TestBreveEstadoDeAnimoController`. |
| Registro cognitivo | `RegistroEstadoAnimoDatasourceImpl -> RegistroEstadoAnimoRepositoryImpl -> RegistroEstadoDeAnimoController`. |
| Chat IA | `ChatIADatasourceImpl -> ChatIARepositoryImpl -> ChatIAController`; recibe los servicios compartidos de Gemini y Cloudinary. |
| Health | `HealthController` con Prisma, `GeminiService`, `FilesRepositoryService` y `EmailService`. |

`AppRoutes.routes` crea una instancia compartida de `GeminiService`, `FilesRepositoryService` y `EmailService`, monta los routers y publica Swagger.

## 6. Reglas transversales HTTP y seguridad

### 6.1 Identidad de sesión

Los tokens de sesión contienen:

```json
{
  "id": "uuid",
  "email": "persona@example.com",
  "name": "Nombre",
  "role": "USER_ROL o PROFESIONAL_ROL",
  "purpose": "session"
}
```

Propiedades criptográficas y temporales:

| Uso | Secreto | Audiencia | Duración |
|---|---|---|---:|
| Sesión | `JWT_SEED` | `mindsave:session` | 2 horas |
| Validación de email | `JWT_EMAIL_VERIFICATION_SEED` | `mindsave:email-verification` | 24 horas |
| Recuperación | `JWT_PASSWORD_RESET_SEED` | `mindsave:password-reset` | 15 minutos |

Todos usan algoritmo `HS256`, emisor `mindsave-backend` y un campo `purpose` que debe coincidir con el uso esperado.

### 6.2 Middleware de autenticación

Las rutas protegidas esperan `Authorization: Bearer <token>`. El middleware:

1. extrae y valida el JWT de propósito `session`;
2. exige un `id` string no vacío;
3. consulta la cuenta actual por ID con `isActive=true` e incluye su rol;
4. compara el rol persistido con `USER_ROL` o `PROFESIONAL_ROL`, según la ruta;
5. reemplaza los datos del token por la identidad actual de la base;
6. escribe esa identidad en `req.user` y `res.locals.user`.

| Condición | Respuesta |
|---|---|
| Header ausente | `401 {"error":"No token provided"}` |
| Formato distinto de `Bearer ` | `401 {"error":"Invalid Bearer token"}` |
| JWT inválido o expirado | `401 {"error":"Invalid token"}` |
| ID inválido, cuenta inexistente o inactiva | `401 {"error":"Invalid Bearer token - user"}` |
| Rol actual diferente | `401 {"error":"Invalid Bearer token - role"}` |
| Excepción durante el middleware | `500 {"error":"Internal Server Error"}` |

La identidad de propietario utilizada por tests, registros y chats siempre procede de `req.user.id`; un `idUsuario` enviado por el cliente queda reemplazado por ese valor.

### 6.3 Errores y streams

`CustomError` representa status `400`, `401`, `403`, `404`, `500` y `502`. El middleware final transforma un `CustomError` en:

```json
{"error":"mensaje"}
```

Una excepción que no sea `CustomError` produce `500 {"error":"Internal Server Error"}`. Si una excepción alcanza el middleware después de iniciar un stream, el middleware registra el evento y destruye la respuesta si todavía permanece abierta.

### 6.4 Validaciones compartidas

- Los UUID se validan con `z.uuid()` en los endpoints que aplican `UuidDto` o `isValidUuid`.
- Los errores Zod se convierten a texto mediante `zod-validation-error`.
- Las contraseñas de entrada validadas por DTO exigen al menos 6 caracteres.
- bcrypt genera un salt y un hash síncronos; el hash es el único valor de contraseña persistido.

## 7. Inventario efectivo de endpoints

| ID | Método y ruta | Acceso | Entrada | Resultado principal |
|---|---|---|---|---|
| SYS-01 | `GET /health` | Público | Sin body | Estado de PostgreSQL, Gemini, Cloudinary y mailer. |
| DOC-01 | `GET /api-docs.json` | Público | Sin body | Documento OpenAPI JSON. |
| DOC-02 | `GET /api-docs` | Público | Sin body | Swagger UI y recursos asociados. |
| AUTH-01 | `POST /api/auth/register` | Público | JSON | Registra una cuenta `USER_ROL`. |
| AUTH-02 | `POST /api/auth/resend-validation-email` | Público | JSON | Reenvía validación cuando corresponde. |
| AUTH-03 | `GET /api/auth/validate-email/:token` | Público | Token path | Valida email y devuelve HTML. |
| AUTH-04 | `POST /api/auth/login` | Público | JSON | Autentica usuario y emite JWT. |
| AUTH-05 | `GET /api/auth/check-status` | `USER_ROL` | Bearer | Revalida cuenta y renueva JWT. |
| AUTH-06 | `POST /api/auth/reset-password` | Público | JSON | Solicita recuperación. |
| AUTH-07 | `GET /api/auth/reset-password/:token` | Público | Token path | Devuelve formulario HTML. |
| AUTH-08 | `POST /api/auth/reset-password/:token` | Público | Form o JSON | Establece nueva contraseña. |
| ADM-AUTH-01 | `POST /admin/auth/login` | Público | JSON | Autentica profesional. |
| ADM-AUTH-02 | `GET /admin/auth/check-status` | `PROFESIONAL_ROL` | Bearer | Revalida y renueva sesión profesional. |
| ADM-USR-01 | `POST /admin/user/` | `PROFESIONAL_ROL` | JSON | Crea cuenta de usuario o profesional. |
| ADM-USR-02 | `GET /admin/user/` | `PROFESIONAL_ROL` | Query | Lista y filtra cuentas. |
| ADM-USR-03 | `GET /admin/user/:idUsuario` | `PROFESIONAL_ROL` | UUID path | Obtiene una cuenta. |
| ADM-USR-04 | `PUT /admin/user/:idUsuario` | `PROFESIONAL_ROL` | UUID + JSON | Actualiza campos de cuenta. |
| ADM-USR-05 | `DELETE /admin/user/:idUsuario` | `PROFESIONAL_ROL` | UUID path | Establece `isActive=false`. |
| ADM-USR-06 | `PUT /admin/user/restore-user/:idUsuario` | `PROFESIONAL_ROL` | UUID path | Establece `isActive=true`. |
| TB-01 | `POST /api/test-breve-estado-de-animo/` | `USER_ROL` | JSON | Crea o reemplaza el test de la fecha. |
| TB-02 | `GET /api/test-breve-estado-de-animo/by-year/:year` | `USER_ROL` | Año path | Lista tests propios del año. |
| TB-03 | `GET /api/test-breve-estado-de-animo/by-date/:year/:month/:day` | `USER_ROL` | Fecha path | Obtiene test propio de un día. |
| TB-04 | `PUT /api/test-breve-estado-de-animo/` | `USER_ROL` | JSON | Reemplaza el test de la fecha. |
| TB-05 | `DELETE /api/test-breve-estado-de-animo/:year/:month/:day` | `USER_ROL` | Fecha path | Elimina el test de la fecha. |
| REA-01 | `POST /api/registro-estado-de-animo/` | `USER_ROL` | JSON | Crea registro cognitivo. |
| REA-02 | `GET /api/registro-estado-de-animo/pendientes` | `USER_ROL` | Query | Lista registros pendientes. |
| REA-03 | `GET /api/registro-estado-de-animo/completos` | `USER_ROL` | Query | Lista registros completos. |
| REA-04 | `GET /api/registro-estado-de-animo/:idRegistro` | `USER_ROL` | UUID path | Obtiene un registro propio. |
| REA-05 | `PUT /api/registro-estado-de-animo/` | `USER_ROL` | JSON con `id` | Reemplaza un registro propio. |
| REA-06 | `DELETE /api/registro-estado-de-animo/:idRegistro` | `USER_ROL` | Path no vacío | Elimina un registro propio. |
| CHAT-01 | `POST /api/chat-ia/new-chat` | `USER_ROL` | JSON | Crea chat. |
| CHAT-02 | `GET /api/chat-ia/get-chats-by-user` | `USER_ROL` | Sin body | Lista chats con su último mensaje. |
| CHAT-03 | `GET /api/chat-ia/get-messages-from-chat/:idChat` | `USER_ROL` | UUID path | Obtiene historial. |
| CHAT-04 | `POST /api/chat-ia/send-message-to-chat/:idChat` | `USER_ROL` | Multipart | Envía turno y recibe stream. |
| CHAT-05 | `DELETE /api/chat-ia/delete-chat/:idChat` | `USER_ROL` | UUID path | Elimina archivos remotos y chat. |

## 8. Autenticación de usuario

### 8.1 Contratos comunes

Registro:

```json
{
  "email": "persona@example.com",
  "name": "Nombre",
  "password": "seis o más caracteres"
}
```

`email` debe tener formato válido, `name` debe tener un mínimo de 2 caracteres y `password` un mínimo de 6.

Login:

```json
{
  "email": "persona@example.com",
  "password": "seis o más caracteres"
}
```

Respuesta de login y comprobación de sesión:

```json
{
  "id": "uuid",
  "email": "persona@example.com",
  "name": "Nombre",
  "role": "USER_ROL",
  "token": "jwt"
}
```

### 8.2 AUTH-01 — Registrar cuenta

**Endpoint:** `POST /api/auth/register`

**Colaboración:** `AuthController.registerUser -> UserDTO.register -> RegisterUser -> UserRepositoryImpl -> UserDatasourceImpl -> Prisma`, con `bcryptAdapter`, `EmailVerificationSender`, `JwtAdapter` y `EmailService`.

Secuencia implementada:

1. El DTO valida email, nombre y contraseña.
2. Construye un `UserEntity` provisional con `emailVerified=false`.
3. El caso de uso reemplaza la contraseña por su hash bcrypt.
4. El datasource comprueba la unicidad del email.
5. Busca `Role.description=USER_ROL`.
6. Crea la fila `User` activa y no verificada.
7. Genera un JWT de validación de 24 horas.
8. Envía un email HTML cuyo enlace es `${WEBSERVICE_URL}/api/auth/validate-email/<token>`.
9. Vacía la contraseña de la entidad de respuesta.

**Éxito:** `201` con la entidad provisional serializada:

```json
{
  "id": "",
  "email": "persona@example.com",
  "name": "Nombre",
  "password": "",
  "emailVerified": false,
  "role": ""
}
```

**Respuestas no exitosas principales:** body inválido `400`; email existente `400 "Email already exists"`; catálogo de rol ausente `400 "Invalid role"`; error no controlado `500`.

### 8.3 AUTH-02 — Reenviar email de validación

**Endpoint:** `POST /api/auth/resend-validation-email`

**Body:** `{ "email": "persona@example.com" }`.

El controlador valida y recorta el email. El datasource busca una cuenta que reúna simultáneamente estas condiciones: email exacto, `emailVerified=false`, `isActive=true` y rol `USER_ROL`. Si existe, genera un nuevo JWT de 24 horas y envía otro email. Si no existe una cuenta con esas condiciones, la operación concluye sin envío.

**Éxito en ambos casos:** `200 {"message":"OK"}`. Email inválido: `400 {"error":"Invalid email"}`.

### 8.4 AUTH-03 — Validar email

**Endpoint:** `GET /api/auth/validate-email/:token`

**Colaboración:** `AuthController.validateEmail -> ValidateEmail -> JwtAdapter -> UserRepositoryImpl -> UserDatasourceImpl -> Prisma`.

El token debe ser un JWT vigente de propósito `email-verification`, con firma, algoritmo, emisor y audiencia válidos, y debe contener un email string. El datasource actualiza `User.emailVerified=true` por email.

- Éxito: `200 text/html` con la página «Email validado con éxito».
- Token o email no aceptado por el flujo: `400 text/html` con la página «No pudimos validar tu email».

### 8.5 AUTH-04 — Login de usuario

**Endpoint:** `POST /api/auth/login`

Orden de ejecución:

1. validar body;
2. buscar usuario por email e incluir rol;
3. exigir `isActive=true`;
4. comparar contraseña con bcrypt;
5. exigir `emailVerified=true`;
6. exigir rol `USER_ROL`;
7. generar JWT de sesión por 2 horas.

| Resultado | Status/cuerpo |
|---|---|
| Credenciales aceptadas | `200` con identidad y JWT. |
| Email inexistente | `400 {"error":"Email not found"}` |
| Cuenta inactiva | `400 {"error":"User is deleted or ban"}` |
| Contraseña no coincidente | `400 {"error":"Invalid password"}` |
| Email no verificado | `401 {"error":"EMAIL_NOT_VERIFIED"}` |
| Rol diferente | `400 {"error":"INCORRET_ROLE"}` |

### 8.6 AUTH-05 — Comprobar y renovar sesión

**Endpoint:** `GET /api/auth/check-status`

**Precondición técnica:** JWT de sesión aceptado por `validateJWTUser`.

El middleware recupera la identidad actual y comprueba que la cuenta siga activa y conserve `USER_ROL`. El controlador emite un JWT nuevo de 2 horas y devuelve la misma forma de respuesta que el login.

### 8.7 AUTH-06 — Solicitar recuperación de contraseña

**Endpoint:** `POST /api/auth/reset-password`

**Body:** `{ "email": "persona@example.com" }`.

Secuencia:

1. validar formato de email;
2. consultar si existe una cuenta con ese email;
3. si existe, generar JWT de propósito `password-reset` por 15 minutos;
4. guardar el JWT completo en `resetToken` y su límite en `resetTokenExpiration`;
5. enviar `${WEBSERVICE_URL}/api/auth/reset-password/<token>` por correo.

Para todo email sintácticamente válido, exista o no una cuenta, responde `200 {"message":"OK"}`. Un email inválido produce `400 {"error":"Invalid email"}`.

### 8.8 AUTH-07 — Mostrar formulario de recuperación

**Endpoint:** `GET /api/auth/reset-password/:token`

El caso de uso valida dos elementos: el JWT de recuperación y la coincidencia exacta con `User.resetToken`, además de `resetTokenExpiration > ahora`.

- Token vigente: `200 text/html` con formulario que realiza `POST` a la misma URL.
- Token no vigente: `400 text/html` con página de token inválido o vencido.

### 8.9 AUTH-08 — Establecer nueva contraseña

**Endpoint:** `POST /api/auth/reset-password/:token`

**Content-Type aceptado:** `application/json` o `application/x-www-form-urlencoded`.

**Body:** `{ "password": "seis o más caracteres" }`.

El controlador valida el body. El caso de uso valida otra vez propósito y payload del JWT, cifra la nueva contraseña, busca la cuenta por email, token exacto y expiración futura, actualiza `password` y deja `resetToken` y `resetTokenExpiration` en `null`.

- Cambio aplicado: `200 text/html` con página de confirmación.
- Token almacenado no vigente o no coincidente: `400 text/html` con página de operación no aplicada.
- Token path o body inválido: `400`.

## 9. Autenticación y gestión profesional

### 9.1 Origen de las cuentas profesionales

No existe `POST /admin/auth/register`. Una cuenta `PROFESIONAL_ROL` se crea mediante:

- el seed Prisma, usando `ADMIN_NAME`, `ADMIN_EMAIL` y `ADMIN_PASSWORD`; o
- `POST /admin/user/`, ejecutado por una cuenta profesional ya autenticada.

El seed realiza `upsert` de los dos roles de cuenta, los tres roles de chat y la cuenta administrativa. La cuenta del seed queda activa, verificada y con contraseña bcrypt.

### 9.2 ADM-AUTH-01 — Login profesional

**Endpoint:** `POST /admin/auth/login`

Utiliza el mismo body validado del login de usuario. Prisma busca por email, `isActive=true` y relación de rol `PROFESIONAL_ROL`. Después compara bcrypt y exige `emailVerified=true`. En éxito emite un JWT de sesión de 2 horas con `role=PROFESIONAL_ROL`.

| Resultado | Status/cuerpo |
|---|---|
| Login aceptado | `200` con identidad, rol y JWT. |
| Cuenta profesional activa no encontrada | `400 {"error":"User not found"}` |
| Contraseña no coincidente | `400 {"error":"Invalid password"}` |
| Email no verificado | `401 {"error":"EMAIL_NOT_VERIFIED"}` |

### 9.3 ADM-AUTH-02 — Comprobar y renovar sesión profesional

**Endpoint:** `GET /admin/auth/check-status`

`validateJWTAdmin` revalida que la cuenta esté activa y tenga rol actual `PROFESIONAL_ROL`. El controlador emite otro JWT de 2 horas y responde `200` con `id`, `email`, `name`, `token` y `role`.

### 9.4 Contrato administrativo de usuario

Creación, con todos los campos requeridos:

```json
{
  "email": "persona@example.com",
  "name": "Nombre",
  "password": "seis o más caracteres",
  "emailVerified": true,
  "role": "USER_ROL"
}
```

`role` admite `USER_ROL` o `PROFESIONAL_ROL`. La representación de respuesta es:

```json
{
  "id": "uuid",
  "email": "persona@example.com",
  "name": "Nombre",
  "password": "",
  "emailVerified": true,
  "role": "USER_ROL",
  "isActive": true
}
```

### 9.5 ADM-USR-01 — Crear cuenta

**Endpoint:** `POST /admin/user/`

**Colaboración:** `AuthMiddleware -> AdminUserController.createUser -> UserAdminDTO -> CreateUserAdmin -> AdminUserRepositoryImpl -> AdminUserDatasourceImpl -> Prisma`.

El caso de uso cifra la contraseña. El datasource verifica email único, resuelve `Role` y crea la fila con el valor recibido de `emailVerified`. Devuelve la entidad persistida con UUID, rol e indicador de actividad, y con password vacía.

**Éxito:** `201` con representación administrativa. Datos inválidos, email existente o rol no resoluble: `400`.

### 9.6 ADM-USR-02 — Listar y filtrar cuentas

**Endpoint:** `GET /admin/user/`

| Query | Default | Regla y efecto |
|---|---:|---|
| `page` | 1 | Entero, mínimo 1. |
| `limit` | 10 | Entero entre 1 y 999. |
| `query` | `""` | Máximo 100; coincidencia parcial e insensible a mayúsculas sobre nombre o email. |
| `emailVerify` | `""` | `verify`, `unverify` o vacío; filtra `emailVerified`. |
| `rol` | `""` | `USER_ROL`, `PROFESIONAL_ROL` o vacío. |
| `state` | `""` | `active`, `inactive` o vacío; filtra `isActive`. |

Prisma ejecuta `findMany` y `count` en paralelo. La paginación usa `take=limit` y `skip=(page-1)*limit`. `totalPages` es `max(1, ceil(total/limit))`.

```json
{
  "results": [],
  "totalPages": 1,
  "page": 1,
  "limit": 10
}
```

### 9.7 ADM-USR-03 — Obtener cuenta por ID

**Endpoint:** `GET /admin/user/:idUsuario`

Valida UUID, consulta `User` con su `Role` y devuelve la representación administrativa. Un UUID inválido produce `400`; una cuenta inexistente produce `400 {"error":"User not found"}`.

### 9.8 ADM-USR-04 — Actualizar cuenta

**Endpoint:** `PUT /admin/user/:idUsuario`

El body admite como opcionales `email`, `name`, `password`, `emailVerified`, `role` e `isActive`, con las mismas reglas de formato de la creación. El ID path debe ser UUID. Si hay password, el controlador la cifra antes de persistir.

El datasource materializa en Prisma los campos presentes `email`, `name`, `password`, `emailVerified` y el `roleId` resuelto. La actividad se controla mediante las operaciones de baja y restauración. Antes del update verifica existencia del ID y, si cambia el email, su unicidad.

**Éxito:** `200 {"status":"success"}`. Respuestas de dominio: `400 "ID not found"`, `400 "Email already exists"` o `400 "Invalid role"`.

### 9.9 ADM-USR-05 — Baja lógica

**Endpoint:** `DELETE /admin/user/:idUsuario`

Valida UUID y existencia. Ejecuta `User.update({isActive:false})`; no elimina físicamente la fila ni sus relaciones. Responde `200 {"status":"success"}`. ID inexistente: `404 {"error":"ID not found"}`.

### 9.10 ADM-USR-06 — Restaurar cuenta

**Endpoint:** `PUT /admin/user/restore-user/:idUsuario`

Valida UUID y existencia. Ejecuta `User.update({isActive:true})`. Responde `200 {"status":"success"}`. ID inexistente: `404 {"error":"ID not found"}`.

## 10. Test breve de estado de ánimo

### 10.1 Agregado y contrato de entrada

El agregado `TestBreveEstadoDeAnimo` contiene cuatro componentes y una fecha. Todos los ítems de las cuatro escalas son números enteros entre 0 y 4.

| Componente | Campos |
|---|---|
| `depresion` | `tristeza`, `desesperanza`, `bajaAutoestima`, `faltaDeValor`, `perdidaDeSatisfaccion` |
| `impulsoSuicida` | `pensamientosSuicidas`, `deseosDeMorir` |
| `ansiedadFisica` | `palpitaciones`, `sudoracion`, `temblores`, `dificultadRespirar`, `ahogo`, `dolorPecho`, `nauseas`, `mareos`, `sensacionIrrealidad`, `inestabilidadHormigueos` |
| `ansiedadEmocional` | `angustiado`, `nervioso`, `preocupado`, `asustado`, `tenso` |

Campos de nivel raíz:

| Campo | Regla |
|---|---|
| `fecha` | String interpretable como fecha. |
| `notas` | String de máximo 500 o `null`; el campo está presente en el contrato validado. |
| `id` | String opcional. |
| `idUsuario` | Inyectado por el controller desde el JWT. |

Ejemplo abreviado:

```json
{
  "fecha": "2026-08-27T15:00:00.000Z",
  "notas": null,
  "depresion": {
    "tristeza": 1,
    "desesperanza": 0,
    "bajaAutoestima": 1,
    "faltaDeValor": 0,
    "perdidaDeSatisfaccion": 1
  },
  "impulsoSuicida": {"pensamientosSuicidas": 0, "deseosDeMorir": 0},
  "ansiedadFisica": {
    "palpitaciones": 0,
    "sudoracion": 0,
    "temblores": 0,
    "dificultadRespirar": 0,
    "ahogo": 0,
    "dolorPecho": 0,
    "nauseas": 0,
    "mareos": 0,
    "sensacionIrrealidad": 0,
    "inestabilidadHormigueos": 0
  },
  "ansiedadEmocional": {
    "angustiado": 1,
    "nervioso": 1,
    "preocupado": 2,
    "asustado": 0,
    "tenso": 1
  }
}
```

### 10.2 Fecha lógica diaria

Además de `fecha`, el modelo persiste `fechaDia` como `date`. Se calcula con el año, mes y día UTC de `fecha`, a medianoche UTC. Existe una restricción única sobre `(idUsuario, fechaDia)`, por lo que cada usuario posee como máximo un test por día lógico.

### 10.3 TB-01 — Crear o reemplazar test

**Endpoint:** `POST /api/test-breve-estado-de-animo/`

Secuencia:

1. reemplazar cualquier `idUsuario` del body por el ID autenticado;
2. validar y construir las entidades del agregado;
3. comprobar la existencia del usuario;
4. calcular `fechaDia`;
5. consultar la clave `(idUsuario, fechaDia)`;
6. si no existe, crear el test y sus cuatro componentes anidados;
7. si existe, ejecutar el reemplazo transaccional utilizado por edición.

Una colisión de unicidad durante la creación también conduce al reemplazo por fecha. Éxito: `201 {"status":"success"}`.

### 10.4 TB-02 — Listar tests por año

**Endpoint:** `GET /api/test-breve-estado-de-animo/by-year/:year`

El controller convierte `year` mediante `parseInt`. El datasource consulta `fechaDia >= YYYY-01-01 UTC` y `< (YYYY+1)-01-01 UTC`, siempre con `idUsuario` autenticado, e incluye los cuatro componentes.

**Éxito:** `200` con array de tests. Sin coincidencias devuelve `[]`. Año no numérico: `400 {"error":"Año inválido"}`.

La serialización contiene `id`, `idUsuario`, `fecha`, los cuatro componentes y `notas` cuando la entidad conserva un valor no vacío.

### 10.5 TB-03 — Obtener test por fecha

**Endpoint:** `GET /api/test-breve-estado-de-animo/by-date/:year/:month/:day`

El controller comprueba que los tres segmentos sean números y formen una fecha gregoriana real. Prisma busca por la clave única de propietario y fecha lógica.

- Encontrado: `200` con el agregado.
- No encontrado: `200 null`.
- Fecha no válida: `400 {"error":"Fecha inválida"}`.

### 10.6 TB-04 — Reemplazar test

**Endpoint:** `PUT /api/test-breve-estado-de-animo/`

Usa el mismo body completo que la creación. Dentro de una transacción interactiva:

1. comprueba el usuario;
2. elimina por `fechaDia` e `idUsuario`;
3. exige que la eliminación haya afectado una fila;
4. recrea el agregado con los valores recibidos.

Éxito: `200 {"status":"success"}`. Si no existe un test propio para esa fecha: `404 {"error":"Test breve no encontrado"}`.

### 10.7 TB-05 — Eliminar test

**Endpoint:** `DELETE /api/test-breve-estado-de-animo/:year/:month/:day`

Valida la fecha, busca por propietario y `fechaDia`, y elimina el test. Las relaciones uno-a-uno de depresión, impulso suicida y ansiedades se eliminan por cascada.

Éxito: `200 {"status":"success"}`. Test no encontrado: `404 {"error":"Test breve no encontrado"}`.

## 11. Registro cognitivo de estado de ánimo

### 11.1 Agregado

`RegistroEstadoAnimo` es el agregado raíz. Contiene:

- UUID e identificador del usuario propietario;
- fecha y `sucesoTrastornador`;
- nueve grupos predefinidos de emociones;
- un grupo de emociones personalizadas;
- cero o más pensamientos;
- una distorsión de diez indicadores por pensamiento.

Los porcentajes son enteros de 0 a 100. `porcentajeCreenciaAntes` es requerido; `porcentajeCreenciaDespues` admite entero o `null`.

### 11.2 Grupos de emociones

Cada grupo contiene todos los booleanos indicados y ambos porcentajes.

| Grupo | Emociones booleanas |
|---|---|
| `grupoEmociones1` | `triste`, `melancolico`, `deprimido`, `decaido`, `infeliz` |
| `grupoEmociones2` | `angustiado`, `preocupado`, `conPanico`, `nervioso`, `asustado` |
| `grupoEmociones3` | `culpable`, `conRemordimiento`, `malo`, `avergonzado` |
| `grupoEmociones4` | `inferior`, `sinValor`, `inadecuado`, `deficiente`, `incompetente` |
| `grupoEmociones5` | `solitario`, `noQuerido`, `noDeseado`, `rechazado`, `solo`, `abandonado` |
| `grupoEmociones6` | `turbado`, `tonto`, `humillado`, `apurado` |
| `grupoEmociones7` | `desesperanzado`, `desanimado`, `pesimista`, `descorazonado` |
| `grupoEmociones8` | `frustrado`, `atascado`, `chasqueado`, `derrotado` |
| `grupoEmociones9` | `airado`, `enfadado`, `resentido`, `molesto`, `irritado`, `trastornado`, `furioso` |

`grupoEmocionesPersonalizadas` contiene `listaEmociones: string[]`, `porcentajeCreenciaAntes` y `porcentajeCreenciaDespues`.

### 11.3 Pensamientos y distorsiones

Cada elemento de `pensamientos` contiene:

| Campo | Regla |
|---|---|
| `pensamientoNegativo` | String de mínimo un carácter. |
| `porcentajeCreenciaAntes` | Entero 0..100. |
| `porcentajeCreenciaDespues` | Entero 0..100 o `null`. |
| `pensamientoPositivo` | String de mínimo un carácter o `null`. |
| `porcentajeCreenciaPositivo` | Entero 0..100 o `null`. |
| `distorsion` | Array de exactamente 10 booleanos. |

La posición de los booleanos se transforma en estos campos persistidos:

| Índice | Campo de `Distorsion` |
|---:|---|
| 0 | `pensamientoTodoONada` |
| 1 | `generalizacionExcesiva` |
| 2 | `filtroMental` |
| 3 | `descargarLoPositivo` |
| 4 | `saltarAConclusiones` |
| 5 | `magnificacionOMinimizacion` |
| 6 | `razonamientoEmocional` |
| 7 | `afirmacionesDelTipoDeberia` |
| 8 | `ponerEtiquetas` |
| 9 | `inculpacion` |

Las respuestas convierten nuevamente esos diez campos al mismo array booleano posicional.

### 11.4 Contrato raíz

El body de creación exige `fecha`, `sucesoTrastornador`, los nueve grupos, el grupo personalizado y el array `pensamientos`. `fecha` debe ser un string interpretable como fecha y `sucesoTrastornador` debe tener al menos un carácter. Para editar también se exige `id`. `idUsuario` se inyecta desde el JWT.

La respuesta de detalle conserva la misma estructura y agrega `id` e `idUsuario`.

### 11.5 REA-01 — Crear registro

**Endpoint:** `POST /api/registro-estado-de-animo/`

**Colaboración:** `RegistroEstadoDeAnimoController -> RegistroEstadoDeAnimoDTO -> CreateRegistroEstadoDeAnimoUseCase -> RegistroEstadoAnimoRepositoryImpl -> RegistroEstadoAnimoDatasourceImpl -> Prisma`.

Prisma crea en una operación anidada el registro raíz, los nueve grupos, el grupo personalizado y sus emociones, los pensamientos y cada distorsión. La fecha recibida se convierte a `Date`.

**Éxito:** `201 {"status":"success","id":"uuid"}`.

### 11.6 Clasificación pendiente/completo

La clasificación de lectura se deriva de un único campo:

```text
pendiente: grupoEmociones1.porcentajeCreenciaDespues == null
completo:  grupoEmociones1.porcentajeCreenciaDespues != null
```

No se persiste un enum o booleano adicional para este estado.

### 11.7 REA-02 — Listar pendientes

**Endpoint:** `GET /api/registro-estado-de-animo/pendientes`

Queries `page` y `limit` tienen default 1 y 10 y deben convertirse a números mayores que cero. El datasource filtra por propietario y estado pendiente, ordena por `fecha desc`, pagina e incluye todas las relaciones.

```json
{
  "results": [],
  "page": 1,
  "limit": 10
}
```

Cuando query params fueron enviados, `page` y `limit` se reflejan con la representación recibida por Express; los valores por defecto son numéricos.

### 11.8 REA-03 — Listar completos

**Endpoint:** `GET /api/registro-estado-de-animo/completos`

Aplica la misma paginación y forma de respuesta que pendientes, filtrando `grupoEmociones1.porcentajeCreenciaDespues != null` y ordenando por fecha descendente.

### 11.9 REA-04 — Obtener registro por ID

**Endpoint:** `GET /api/registro-estado-de-animo/:idRegistro`

Valida UUID y consulta simultáneamente `id` e `idUsuario`. Incluye todos los grupos, emociones personalizadas, pensamientos y distorsiones; `RegistroEstadoAnimoMapper` los convierte a entidades.

- Encontrado: `200` con el agregado.
- No encontrado o no perteneciente al usuario: `404 {"error":"Registro no encontrado"}`.
- UUID inválido: `400`.

### 11.10 REA-05 — Reemplazar registro

**Endpoint:** `PUT /api/registro-estado-de-animo/`

El body debe contener el agregado completo y un `id` UUID. En una transacción interactiva:

1. comprueba el usuario;
2. elimina por ID y propietario;
3. exige una fila afectada;
4. recrea con el mismo UUID todos los componentes recibidos.

El reemplazo puede cambiar la clasificación pendiente/completo. Éxito: `200 {"status":"success"}`. Sin registro propio coincidente: `404 {"error":"Registro de estado de ánimo no encontrado"}`.

### 11.11 REA-06 — Eliminar registro

**Endpoint:** `DELETE /api/registro-estado-de-animo/:idRegistro`

El controller exige un parámetro no vacío. El datasource busca por ID y propietario, y elimina el registro. Los grupos, pensamientos, distorsiones y emociones personalizadas se eliminan por cascada.

Éxito: `200 {"status":"success"}`. Sin coincidencia de ID y propietario: `404 {"error":"Registro no encontrado"}`.

## 12. Chat con IA

### 12.1 Agregado y respuestas

La jerarquía de dominio es:

```text
ChatChatIA
  - id
  - idUsuario
  - title
  - mensajes: MensajeChatIA[]
      - id
      - text
      - createdAt
      - role: user | model | system
      - archivos: ArchivoChatIA[]
          - fileUri
          - mimeType
          - fileUrl
```

Los identificadores usados para eliminación en proveedores (`cloudinaryPublicId`, `cloudinaryResourceType`, `geminiFileName`) se conservan en dominio/persistencia, pero `ArchivoChatIA.toJson()` expone únicamente `fileUri`, `mimeType` y `fileUrl`.

### 12.2 CHAT-01 — Crear chat

**Endpoint:** `POST /api/chat-ia/new-chat`

**Body:** `{ "title": "Título no vacío" }`.

El controller exige un string con valor truthy. El datasource comprueba el usuario, busca un chat del mismo propietario y título exacto, y crea `Chat`. La base también impone unicidad `(idUsuario, title)`.

- Éxito: `201 {"result":"uuid-del-chat"}`.
- Título ausente/vacío: `400 {"error":"Title is required"}`.
- Título ya utilizado por el usuario: `400 {"error":"Chat already exists"}`.

### 12.3 CHAT-02 — Listar chats

**Endpoint:** `GET /api/chat-ia/get-chats-by-user`

Prisma filtra por propietario. Para cada chat incluye como máximo un mensaje: el más reciente por `createdAt desc`, con sus archivos y rol.

```json
{
  "results": [
    {
      "id": "uuid",
      "idUsuario": "uuid",
      "title": "Título",
      "mensajes": []
    }
  ]
}
```

Un chat sin mensajes tiene `mensajes: []`; uno con historial contiene solamente su mensaje más reciente en esta operación.

### 12.4 CHAT-03 — Obtener historial

**Endpoint:** `GET /api/chat-ia/get-messages-from-chat/:idChat`

Valida UUID, filtra por ID de chat y propietario, e incluye todos los mensajes con archivos y rol, ordenados por `createdAt desc`.

```json
{
  "result": {
    "id": "uuid",
    "idUsuario": "uuid",
    "title": "Título",
    "mensajes": [
      {
        "id": "uuid",
        "text": "Contenido",
        "role": "model",
        "createdAt": "2026-08-27T12:00:00.000Z",
        "archivos": []
      }
    ]
  }
}
```

UUID inválido: `400`. Chat inexistente o de otro propietario: `400 {"error":"Chat not found"}`.

### 12.5 Política de adjuntos

`HandleFileMiddleware` usa el campo multipart `files` y escribe temporales en `uploads/`.

| Regla | Valor |
|---|---|
| Número máximo | 5 archivos |
| Tamaño máximo | 5 MiB por archivo |
| Campo multipart | `files` |

MIME permitidos:

- imágenes: JPEG, PNG, GIF, WebP y SVG;
- documentos: PDF, Word (`.doc`, `.docx`), Excel (`.xls`, `.xlsx`), PowerPoint (`.ppt`, `.pptx`), texto plano y CSV.

El middleware devuelve `400` para MIME no permitido, exceso de tamaño, exceso de cantidad o error de procesamiento. Los temporales registrados en `req.files` se eliminan si Multer rechaza la carga.

### 12.6 CHAT-04 — Enviar mensaje y recibir respuesta

**Endpoint:** `POST /api/chat-ia/send-message-to-chat/:idChat`

**Content-Type:** `multipart/form-data`.

| Campo | Regla |
|---|---|
| `prompt` | String de mínimo un carácter. |
| `files` | Array opcional sujeto a la política anterior. |
| `idChat` | UUID path. |
| `idUsuario` | Inyectado desde el JWT. |

**Colaboración principal:** `AuthMiddleware -> HandleFileMiddleware -> ChatIAController -> PromptChatDTO -> SendMessageToChatUseCase -> ChatIARepository/Cloudinary/Gemini -> stream HTTP -> Prisma`.

Secuencia implementada:

1. autenticar usuario y procesar multipart;
2. validar prompt, UUID del chat e identidad;
3. consultar el chat propio y cargar hasta 20 mensajes recientes;
4. invertir esos 20 mensajes para entregar a Gemini un historial cronológico;
5. subir los adjuntos a Cloudinary;
6. subir los mismos adjuntos a Gemini Files;
7. construir `MensajeChatIA` de rol `user` con prompt y referencias;
8. crear un chat Gemini con la instrucción de sistema y el historial;
9. solicitar `sendMessageStream` con prompt y referencias de archivo;
10. responder `200 text/plain` y escribir cada fragmento recibido;
11. acumular el texto completo y construir un mensaje `model`;
12. guardar ambos mensajes y los metadatos de archivo dentro de una transacción Prisma;
13. finalizar el stream;
14. eliminar todos los archivos temporales locales en el bloque `finally`.

La persistencia ocurre al terminar la generación. `sendMessagesToChat` vuelve a comprobar usuario y propiedad, resuelve los registros `ChatRole` de `user` y `model`, y crea ambos mensajes en una sola transacción.

Respuestas antes de iniciar el stream:

| Condición | Respuesta |
|---|---|
| Payload/UUID inválido | `400` |
| Chat inexistente o ajeno | `400 {"error":"Chat not found"}` |
| Restricción de Multer | `400` con detalle de upload |
| Carga de adjuntos no completada | `502 {"error":"No fue posible subir todos los archivos adjuntos"}` |

Si la respuesta ya comenzó y la generación o persistencia no concluye, el manejador de errores cierra la conexión abierta. En todos los caminos el controller intenta eliminar los temporales locales.

### 12.7 Instrucción de sistema de Gemini

`src/config/system_instruction.ts` configura al modelo como asistente de la técnica TCC «Externalización de Voces». Define:

- una fase de saludo y una pregunta inicial;
- configuración de voz negativa para el usuario y voz positiva/racional para la IA;
- respuestas concisas por turnos;
- inversión de roles cuando el usuario lo solicita o expresa bloqueo;
- suspensión del ejercicio ante ideación suicida, autolesión o violencia explícita, con indicación de contacto profesional o emergencia local;
- salida exclusiva en texto plano, sin Markdown.

### 12.8 CHAT-05 — Eliminar chat

**Endpoint:** `DELETE /api/chat-ia/delete-chat/:idChat`

Secuencia:

1. validar UUID;
2. consultar el chat por ID y propietario;
3. recuperar todos los metadatos de archivos de sus mensajes;
4. ejecutar en paralelo una eliminación Cloudinary y una eliminación Gemini por archivo;
5. exigir que todas las eliminaciones remotas concluyan;
6. eliminar el chat por ID y propietario;
7. dejar que PostgreSQL elimine mensajes y filas `Archivo` por cascada.

- Éxito: `200 {"result":"success"}`.
- Chat no encontrado o ajeno: `404 {"error":"Chat no encontrado"}`.
- Alguna eliminación remota no concluida: `500 {"error":"No fue posible eliminar todos los archivos remotos del chat"}`; en este camino no se ejecuta el borrado del chat en PostgreSQL.

## 13. Health check y documentación

### 13.1 SYS-01 — Health check

**Endpoint:** `GET /health`

`HealthController` inicia simultáneamente cuatro comprobaciones con `Promise.allSettled`:

| Servicio | Comprobación |
|---|---|
| PostgreSQL | `SELECT 1` mediante Prisma. |
| Gemini | Obtención de metadatos del modelo configurado. |
| Cloudinary | `cloudinary.api.ping()`. |
| Mailer | `transporter.verify()`. |

Cada comprobación está limitada a 5 segundos en el controlador; los adaptadores también aplican sus tiempos configurados.

Respuesta:

```json
{
  "status": "ok",
  "timestamp": "2026-08-27T12:00:00.000Z",
  "uptime": 120.45,
  "services": {
    "database": "connected",
    "gemini": "connected",
    "cloudinary": "connected",
    "mailer": "connected"
  }
}
```

| Condición agregada | HTTP | `status` |
|---|---:|---|
| Los cuatro servicios disponibles | 200 | `ok` |
| PostgreSQL disponible y al menos un proveedor externo no disponible | 200 | `degraded` |
| PostgreSQL no disponible | 503 | `error` |

Cada entrada de `services` vale `connected` o `disconnected`.

### 13.2 DOC-01 — OpenAPI JSON

**Endpoint:** `GET /api-docs.json`

Devuelve `swaggerDocument`, un objeto OpenAPI `3.0.3` con esquemas, seguridad Bearer, tags, rutas, parámetros, bodies y respuestas.

### 13.3 DOC-02 — Swagger UI

**Endpoint base:** `GET /api-docs`

El montaje `swaggerUi.serve` y `swaggerUi.setup(swaggerDocument)` publica la interfaz Swagger y sus recursos estáticos bajo `/api-docs`.

## 14. Modelo de dominio para UML

### 14.1 Identidad

`UserEntity` contiene `id`, `email`, `name`, `password`, `emailVerified`, `role` e `isActive`. Sus operaciones de entidad son `fromJson()` y `toJson()`.

Casos de uso de identidad:

| Clase | Operación pública |
|---|---|
| `RegisterUser` | `execute(user)` |
| `EmailVerificationSender` | `execute(email, name)` |
| `ValidateEmail` | `execute(token)` |
| `ResendEmailVerification` | `execute(email)` |
| `ResetPasswordUseCase` | `sendResetPasswordEmail`, `validateResetPasswordToken`, `setNewPassword` |
| `CreateUserAdmin` | `execute(user)` |

### 14.2 Test breve

```text
TestBreveEstadoDeAnimo
  *-- DepresionTestBreve
  *-- ImpulsoSuicidaTestBreve
  *-- SentimientosAnsiedadFisicaTestBreve
  *-- SentimientosAnsiedadEmocionalTestBreve
```

El agregado raíz tiene `id?`, `idUsuario`, `fecha`, `notas?` y los cuatro componentes. Cada componente implementa `fromJson()` y `toJson()`; el agregado implementa `fromJson()`.

Existe un caso de uso por operación: crear, listar por año, obtener por fecha, editar y eliminar. Todos dependen de `TestBreveEstadoDeAnimoRepository`.

### 14.3 Registro cognitivo

```text
RegistroEstadoAnimo
  *-- GrupoEmociones1
  *-- GrupoEmociones2
  *-- GrupoEmociones3
  *-- GrupoEmociones4
  *-- GrupoEmociones5
  *-- GrupoEmociones6
  *-- GrupoEmociones7
  *-- GrupoEmociones8
  *-- GrupoEmociones9
  *-- GrupoEmocionesPersonalizadas
  *-- "0..*" Pensamiento
Pensamiento
  *-- Distorsion
```

Todas estas entidades usan `fromJson()`/constructores para entrada y `toJson()` para salida. `Distorsion.fromJson(boolean[10])` transforma el contrato posicional en campos nominados; `toJson()` ejecuta la conversión inversa.

Los casos de uso son crear, listar pendientes, listar completos, obtener por ID, editar y eliminar. Todos dependen de `RegistroEstadoAnimoRepository`.

### 14.4 Chat

```text
ChatChatIA
  *-- "0..*" MensajeChatIA
MensajeChatIA
  *-- "0..*" ArchivoChatIA
```

`ChatChatIA`, `MensajeChatIA` y `ArchivoChatIA` implementan `fromJson()` y `toJson()`. Los casos de uso son crear chat, listar chats, consultar mensajes, preparar/generar/persistir un turno y eliminar chat.

### 14.5 Contratos de repositorio y datasource

| Contrato | Operaciones |
|---|---|
| `UserRepository` / `UserDatasource` | `register`, `login`, `findActiveUserById`, `findUnverifiedUserByEmail`, `validateEmail`, `verifyUserByEmail`, `verifyUserByEmailAndToken`, `createResetPasswordToken`, `resetPassword` |
| `AdminAuthRepository` / `AdminAuthDatasource` | `login` |
| `AdminUserRepository` / `AdminUserDatasource` | `createUser`, `getUsers`, `getUserById`, `updateUser`, `deleteUser`, `restoreUser` |
| `TestBreveEstadoDeAnimoRepository` / datasource | `saveTestBreveEstadoDeAnimo`, `getTestBreveEstadoDeAnimoByYear`, `editarTestBreveEstadoDeAnimoDeHoy`, `eliminarTestBreveEstadoDeAnimoDeHoy`, `getTodayTestBreveEstadoDeAnimo` |
| `RegistroEstadoAnimoRepository` / datasource | `saveRegistroEstadoDeAnimo`, `getRegistroEstadoDeAnimoPendientes`, `getRegistroEstadoDeAnimoCompletos`, `editarRegistroEstadoDeAnimo`, `eliminarRegistroEstadoDeAnimo`, `getRegistroEstadoDeAnimoById` |
| `ChatIARepository` / `ChatIADatasource` | `createNewChat`, `getChatsByUser`, `getMessagesFromChat`, `sendMessagesToChat`, `getFilesForChatDeletion`, `deleteChat` |

Cada clase `*RepositoryImpl` delega sus operaciones al datasource correspondiente. Los datasources concretos contienen las consultas y escrituras Prisma.

## 15. Modelo de persistencia

### 15.1 Catálogos y cuenta

| Modelo | Clave y campos | Relaciones/restricciones |
|---|---|---|
| `Role` | `id Int`, `description TipoRol` | Descripción única; uno a muchos con `User`. Tabla `role`. |
| `User` | UUID, email, name, password, `emailVerified`, `isActive`, timestamps, reset token/expiración | Email único; FK a `Role`; uno a muchos con tests, registros y chats. Tabla `user`. |

`TipoRol` contiene `PROFESIONAL_ROL` y `USER_ROL`.

### 15.2 Test breve

| Modelo | Contenido | Relación |
|---|---|---|
| `TestBreveEstadoDeAnimo` | UUID, `idUsuario`, `fecha`, `fechaDia`, `notas` | Muchos a uno con `User`; único `(idUsuario, fechaDia)`. |
| `Depresion` | Cinco puntuaciones | Uno a uno opcional desde test; FK única y cascada. |
| `ImpulsoSuicida` | Dos puntuaciones | Uno a uno opcional; FK única y cascada. |
| `SentimientosAnsiedadFisica` | Diez puntuaciones | Uno a uno opcional; FK única y cascada. |
| `SentimientosAnsiedadEmocional` | Cinco puntuaciones | Uno a uno opcional; FK única y cascada. |

El borrado físico de `User` elimina tests; el borrado del test elimina sus cuatro componentes.

### 15.3 Registro cognitivo

| Modelo | Contenido | Relación |
|---|---|---|
| `RegistroEstadoAnimo` | UUID, `idUsuario`, `fecha`, `sucesoTrastornador` | Muchos a uno con usuario; agrega grupos y pensamientos. |
| `GrupoEmociones1..9` | Booleanos y porcentajes antes/después | Cada tabla posee FK única al registro y cascada. |
| `GrupoEmocionesPersonalizadas` | Porcentajes | FK única al registro; uno a muchos con emociones. |
| `EmocionPersonalizada` | `descripcion` | Muchos a uno con grupo personalizado; cascada. |
| `Pensamiento` | Textos y porcentajes | Muchos a uno con registro; cascada. |
| `Distorsion` | Diez booleanos | FK única a pensamiento; cascada. |

### 15.4 Chat

| Modelo | Contenido | Relación/restricción |
|---|---|---|
| `Chat` | UUID, `title`, `idUsuario` | Muchos a uno con usuario; único `(idUsuario, title)`. |
| `ChatRole` | ID y `TipoChatRol` | Descripción única; uno a muchos con mensajes. |
| `Mensaje` | UUID, `text`, `createdAt`, `roleId`, `chatId` | Muchos a uno con chat y rol; cascada al borrar chat. |
| `Archivo` | UUID, URI Gemini, MIME, URL Cloudinary, IDs remotos, `mensajeId` | Muchos a uno con mensaje; cascada al borrar mensaje. |

`TipoChatRol` contiene `model`, `user` y `system`.

### 15.5 Cardinalidades consolidadas

| Origen | Cardinalidad | Destino | Política de borrado definida |
|---|---:|---|---|
| `Role` | 1 — 0..* | `User` | Restricción de FK por defecto. |
| `User` | 1 — 0..* | `TestBreveEstadoDeAnimo` | Cascada. |
| `User` | 1 — 0..* | `RegistroEstadoAnimo` | Cascada. |
| `User` | 1 — 0..* | `Chat` | Cascada. |
| `TestBreveEstadoDeAnimo` | 1 — 0..1 | Cada subescala | Cascada desde componente por FK al test. |
| `RegistroEstadoAnimo` | 1 — 0..1 | Cada grupo de emociones | Cascada. |
| `RegistroEstadoAnimo` | 1 — 0..* | `Pensamiento` | Cascada. |
| `GrupoEmocionesPersonalizadas` | 1 — 0..* | `EmocionPersonalizada` | Cascada. |
| `Pensamiento` | 1 — 0..1 | `Distorsion` | Cascada. |
| `Chat` | 1 — 0..* | `Mensaje` | Cascada. |
| `ChatRole` | 1 — 0..* | `Mensaje` | Restricción de FK por defecto. |
| `Mensaje` | 1 — 0..* | `Archivo` | Cascada. |

## 16. Transacciones, propiedad y estados derivados

### 16.1 Límites transaccionales

| Operación | Unidad atómica en PostgreSQL |
|---|---|
| Crear test | Creación Prisma anidada del test y cuatro componentes. |
| Reemplazar test | `deleteMany` y recreación dentro de una transacción interactiva. |
| Crear registro cognitivo | Creación anidada de raíz, grupos, emociones, pensamientos y distorsiones. |
| Reemplazar registro | Eliminación y recreación completa con el mismo UUID en una transacción interactiva. |
| Guardar turno de chat | Comprobaciones, resolución de roles y creación de mensajes/archivos en una transacción interactiva. |
| Eliminar chat | La eliminación del chat y sus cascadas es una operación de PostgreSQL; antes se completan las eliminaciones de proveedores remotos. |

### 16.2 Propiedad de recursos

| Recurso | Filtro de propiedad |
|---|---|
| Test breve | `idUsuario` autenticado + fecha lógica. |
| Registro cognitivo | `idUsuario` autenticado + UUID del registro. |
| Chat | `idUsuario` autenticado + UUID del chat. |

Este filtro se aplica en lecturas, reemplazos y eliminaciones. En chat también se aplica antes de preparar historial, persistir mensajes y enumerar archivos para borrado.

### 16.3 Estados de cuenta

```text
Verificación: no_verificada -> verificada
Actividad:    activa <-> inactiva
```

- El registro público crea `no_verificada + activa`.
- El seed crea la cuenta profesional `verificada + activa`.
- La creación administrativa recibe el estado de verificación y usa actividad inicial `true` de Prisma.
- Validar email establece `emailVerified=true`.
- Baja y restauración alternan `isActive`.

### 16.4 Estado del token de recuperación

```text
ausente -> vigente -> consumido
                 \-> expirado
```

Una solicitud nueva reemplaza token y expiración anteriores. El cambio de contraseña consume el token dejando ambos campos en `null`.

### 16.5 Estado diario del test

```text
sin_test --POST--> con_test
con_test --POST/PUT--> con_test_reemplazado
con_test --DELETE--> sin_test
```

La identidad del estado diario es `(idUsuario, fechaDia)`.

### 16.6 Estado del registro cognitivo

```text
pendiente <-> completo
```

La transición se deriva del porcentaje posterior del grupo 1 y puede producirse al reemplazar el agregado.

### 16.7 Estado del chat y del turno

```text
chat inexistente -> chat creado -> chat con mensajes -> chat eliminado
```

Para cada turno, los estados transitorios son: autorizado, adjuntos cargados, generación en streaming y turno persistido. Sólo el último estado deja `Mensaje` y `Archivo` en PostgreSQL.

## 17. Integraciones externas

### 17.1 Nodemailer

`EmailService` crea un transporter con servicio, usuario y secreto configurados. Usa timeout de conexión y saludo de 10 segundos, socket de 15 segundos, 5 segundos para health y 15 segundos para envío. Los emails son HTML y escapan nombre, email y enlaces antes de interpolarlos.

### 17.2 Gemini

`GeminiService` crea `GoogleGenAI`, consulta el modelo para health, sube archivos, elimina referencias y crea chats con historial. Timeouts por defecto: 5 segundos para health, 30 segundos para upload y 10 segundos para borrado. El stream de respuesta se consume como `AsyncGenerator<GenerateContentResponse>`.

### 17.3 Cloudinary

`FilesRepositoryService` configura el SDK con cloud name, API key y secret. `uploadImages()` carga todos los temporales y conserva `secure_url`, `public_id` y `resource_type`. `deleteFile()` usa esos identificadores o los deriva de la URL. Timeouts por defecto: 5 segundos para health, 30 segundos para upload y 10 segundos para borrado.

### 17.4 Timeouts

`withTimeout()` ejecuta `Promise.race` entre la operación y un temporizador, genera `TimeoutError` con el nombre de la operación y limpia el timer en `finally`.

### 17.5 Logging

Winston escribe:

- `logs/info.log`
- `logs/warn.log`
- `logs/error.log`
- `logs/combined.log`

Los timestamps se formatean en `America/Santiago`. Fuera de producción también se agregan transports de consola.

## 18. Participantes de los flujos principales

Esta tabla enumera las lifelines que participan efectivamente en los escenarios y permite trasladar la descripción a diagramas de secuencia.

| Escenario | Participantes implementados |
|---|---|
| Registro de usuario | Cliente, `AuthRouter`, `AuthController`, `UserDTO`, `RegisterUser`, `bcryptAdapter`, `UserRepositoryImpl`, `UserDatasourceImpl`, Prisma/PostgreSQL, `EmailVerificationSender`, `JwtAdapter`, `EmailService`, proveedor de correo. |
| Validación de email | Navegador, controller, `ValidateEmail`, `JwtAdapter`, repository, datasource, PostgreSQL, generador de página HTML. |
| Login/check-status | Cliente, controller o `AuthMiddleware`, DTO, repository, datasource, PostgreSQL, bcrypt, JWT. |
| Recuperación | Cliente/navegador, controller, `ResetPasswordUseCase`, JWT, repository, datasource, PostgreSQL, mailer, páginas HTML. |
| Gestión administrativa | Cliente profesional, `AuthMiddleware`, `AdminUserController`, DTO, caso de uso de creación cuando aplica, repository, datasource, Prisma/PostgreSQL. |
| Test breve | Cliente, auth, controller, DTO, caso de uso, repository, datasource, Prisma y tablas del agregado. |
| Registro cognitivo | Cliente, auth, controller, DTO/entidades, caso de uso, repository, datasource, Prisma, mapper de lectura y tablas del agregado. |
| Turno de chat | Cliente, auth, Multer, controller, DTO, `SendMessageToChatUseCase`, repository/datasource, PostgreSQL, Cloudinary, Gemini Files, Gemini Chat, stream HTTP y filesystem temporal. |
| Eliminación de chat | Cliente, auth, controller, `DeleteChatUseCase`, repository/datasource, Cloudinary, Gemini Files y PostgreSQL. |
| Health | Monitor, `HealthController`, Prisma/PostgreSQL, Gemini, Cloudinary y Nodemailer en paralelo. |

## 19. Vista lógica de despliegue

```text
Clientes HTTP / Flutter / Web
             |
             | JSON, form, multipart, text/plain stream, Bearer JWT
             v
Proceso Node.js + Express
  |          |            |             |              |
  |          |            |             |              +--> uploads/ temporales
  |          |            |             +-----------------> logs/ Winston
  |          |            +-------------------------------> Proveedor de correo
  |          +--------------------------------------------> Cloudinary
  +-------------------------------------------------------> Gemini API y Files
             |
             +--------------------------------------------> PostgreSQL vía Prisma/pg
```

En desarrollo local, PostgreSQL puede ejecutarse mediante Docker Compose. En la configuración descrita por el README, la aplicación también puede conectarse a Neon con URL pooled en runtime y URL directa para Prisma CLI.

## 20. Mapa de fuentes del repositorio

| Tema | Fuente principal |
|---|---|
| Arranque | `src/app.ts` |
| Servidor, CORS y cierre | `src/presentation/server.ts` |
| Montaje global | `src/presentation/routes.ts` |
| Endpoints | `src/presentation/**/routes.ts` |
| Contratos HTTP | `src/presentation/**/controller.ts`, `validators/dtos`, `validators/schemas` |
| Autenticación | `src/presentation/middlewares/auth.middlewares.ts`, `src/config/jwt.adapter.ts` |
| Uploads | `src/presentation/middlewares/handleFiles.middlewares.ts` |
| Casos de uso | `src/domain/use-cases` |
| Entidades | `src/domain/entities` |
| Contratos de acceso | `src/domain/repository`, `src/domain/datasources` |
| Persistencia concreta | `src/infrastructure/datasources`, `src/infrastructure/repository` |
| Mappers | `src/infrastructure/mappers` |
| Modelo relacional | `prisma/schema.prisma` |
| Seed | `prisma/seed.ts` |
| PostgreSQL runtime | `src/data/postgres/index.ts` |
| Gemini | `src/config/gemini.adapter.ts`, `src/config/system_instruction.ts` |
| Cloudinary | `src/config/cloudinary.adapter.ts` |
| Correo | `src/config/nodemailer.adapter.ts` y casos de uso auth |
| OpenAPI | `src/config/swagger.config.ts` |
| Entorno | `src/config/envs.ts`, `.env.example`, `prisma.config.ts` |
| Scripts | `package.json` |

## 21. Catálogo de casos de uso AS-IS

| Caso | Actor primario | Precondición implementada | Postcondición de éxito |
|---|---|---|---|
| CU-01 Registrar cuenta | Visitante | Body válido, email no registrado, rol `USER_ROL` existente. | Cuenta activa/no verificada creada y email de validación enviado. |
| CU-02 Reenviar validación | Visitante | Email válido. | Si existe cuenta activa/no verificada de usuario, se envía un enlace nuevo. |
| CU-03 Validar email | Titular del enlace | JWT de validación vigente y email persistido. | `emailVerified=true`. |
| CU-04 Iniciar sesión de usuario | Usuario | Cuenta activa, verificada, password correcta y rol usuario. | JWT de sesión emitido. |
| CU-05 Renovar sesión de usuario | Usuario | JWT vigente y cuenta aún activa con rol usuario. | JWT nuevo emitido con identidad actual. |
| CU-06 Solicitar recuperación | Visitante | Email sintácticamente válido. | Para email existente, token/expiración guardados y correo procesado. |
| CU-07 Restablecer contraseña | Titular del enlace | JWT y token persistido vigentes; password válida. | Hash actualizado y token consumido. |
| CU-08 Iniciar/renovar sesión profesional | Profesional | Cuenta activa, verificada y rol profesional. | JWT profesional emitido. |
| CU-09 Crear cuenta administrativamente | Profesional | JWT profesional y body válido. | Cuenta de rol seleccionado creada. |
| CU-10 Consultar cuentas | Profesional | JWT profesional y filtros válidos. | Página o detalle de cuenta devueltos. |
| CU-11 Actualizar cuenta | Profesional | JWT profesional, UUID y body válidos. | Campos persistibles recibidos actualizados. |
| CU-12 Dar de baja/restaurar cuenta | Profesional | JWT profesional y UUID existente. | `isActive` establecido en `false` o `true`. |
| CU-13 Registrar test breve | Usuario | JWT usuario y agregado válido. | Test de la fecha creado o reemplazado. |
| CU-14 Consultar tests | Usuario | JWT usuario y año/fecha válida. | Tests propios devueltos. |
| CU-15 Editar/eliminar test | Usuario | JWT usuario y test propio para la fecha. | Agregado reemplazado o eliminado. |
| CU-16 Crear registro cognitivo | Usuario | JWT usuario y agregado válido. | Registro y componentes creados; UUID devuelto. |
| CU-17 Consultar registros cognitivos | Usuario | JWT usuario y paginación/UUID aceptada. | Pendientes, completos o detalle propio devueltos. |
| CU-18 Editar/eliminar registro | Usuario | JWT usuario y registro propio. | Agregado reemplazado o eliminado. |
| CU-19 Crear/listar chat | Usuario | JWT usuario; título no vacío y único para el usuario. | Chat creado o lista propia devuelta. |
| CU-20 Consultar historial | Usuario | JWT usuario y UUID de chat propio. | Mensajes propios devueltos. |
| CU-21 Conversar con IA | Usuario | JWT usuario, chat propio, prompt válido y adjuntos aceptados. | Texto transmitido y turno completo persistido. |
| CU-22 Eliminar chat | Usuario | JWT usuario y chat propio. | Adjuntos remotos procesados y agregado de chat eliminado. |
| CU-23 Consultar salud | Monitor/visitante | Ninguna. | Estado agregado de cuatro dependencias devuelto. |
| CU-24 Consultar documentación | Visitante | Ninguna. | OpenAPI JSON o Swagger UI devuelto. |

## 22. Pruebas automatizadas presentes

`jest.config.ts` ejecuta TypeScript ESM mediante ts-jest, usa entorno Node, limpia mocks y recolecta cobertura V8 en cada ejecución. El repositorio contiene `tests/app.test.ts`, una prueba de disponibilidad del entorno Jest con una aserción verdadera.
