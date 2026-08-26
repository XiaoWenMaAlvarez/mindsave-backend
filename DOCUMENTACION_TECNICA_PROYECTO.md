# MindSave Backend — especificación funcional y técnica del sistema actual

> Documento de referencia para elaborar casos de uso extendidos, diagramas UML, vistas de arquitectura, modelos de datos y planes de prueba.

## 1. Identificación, alcance y criterio de verdad

- **Proyecto:** MindSave Backend.
- **Repositorio analizado:** `mindsave-backend`.
- **Revisión analizada:** `d8ee6bb`, rama `main`.
- **Fecha del análisis:** 25 de agosto de 2026.
- **Estado documentado:** comportamiento actual (`as-is`), no una propuesta futura.
- **Fuentes principales:** rutas Express, controladores, validadores Zod/DTO, casos de uso, contratos de repositorio y datasource, implementaciones Prisma, `prisma/schema.prisma`, adaptadores externos, configuración del servidor y pruebas automatizadas.

El código ejecutable es la fuente de verdad de este documento. La especificación OpenAPI incluida en `src/config/swagger.config.ts` se usó como fuente secundaria, porque contiene rutas y esquemas que no coinciden en varios puntos con la implementación. Las diferencias se detallan en la sección 16.

El alcance comprende:

- los 33 endpoints funcionales y operacionales registrados por método HTTP;
- los endpoints de OpenAPI y Swagger UI;
- actores, autenticación, autorización y pertenencia de recursos;
- entradas, validaciones, respuestas, errores y efectos laterales;
- colaboración entre capas y clases;
- modelo relacional y reglas de persistencia;
- integraciones con PostgreSQL, Gemini, Cloudinary y Nodemailer;
- estados de negocio útiles para diagramas de actividad y de estados;
- limitaciones y riesgos relevantes del comportamiento actual.

No se describen el frontend Flutter ni el frontend web, porque no forman parte de este repositorio.

## 2. Propósito y límite del sistema

MindSave Backend es una API de apoyo al bienestar mental. Permite que una persona usuaria:

1. cree y valide una cuenta, inicie sesión y recupere su contraseña;
2. registre una evaluación breve diaria con puntuaciones de depresión, ansiedad e impulso suicida;
3. construya un registro cognitivo detallado con suceso, emociones, pensamientos automáticos, distorsiones y reevaluación posterior;
4. mantenga conversaciones multimodales con Gemini bajo una instrucción de sistema orientada a la técnica de TCC «Externalización de Voces»;
5. adjunte imágenes y documentos a mensajes de chat.

También ofrece una superficie profesional/administrativa para autenticarse y gestionar cuentas de usuario, además de un health check de las dependencias externas y documentación Swagger.

La API **no** implementa en el estado actual asignación de pacientes a profesionales, consulta clínica de tests o registros por parte de profesionales, diagnóstico, alertas automáticas por riesgo suicida, notificaciones a terceros ni eliminación remota de archivos de Cloudinary/Gemini.

## 3. Actores y sistemas externos

| Actor o sistema | Responsabilidad y acceso real |
|---|---|
| Visitante | Puede registrar cuentas de usuario y profesional, iniciar sesión, validar email, solicitar recuperación y usar el formulario de nueva contraseña. También puede consultar health y Swagger. |
| Usuario final | Cuenta con rol JWT exacto `USER_ROL`. Gestiona exclusivamente sus tests breves, registros cognitivos y chats. |
| Profesional/administrador | Cuenta con rol JWT exacto `PROFESIONAL_ROL`. Gestiona cuentas mediante `/admin/user`. No tiene endpoints para acceder a datos clínicos de usuarios. |
| PostgreSQL | Persistencia canónica de usuarios, roles, tests, registros, chats y metadatos de archivos. |
| Gemini | Genera la respuesta conversacional en streaming y aloja archivos usados como contexto del modelo. |
| Cloudinary | Almacena una copia pública de los adjuntos y entrega `secure_url`. |
| Nodemailer/proveedor SMTP | Envía enlaces de validación de email y recuperación de contraseña. |
| Cliente web en desarrollo | Origen CORS permitido de forma explícita: `http://localhost:5173`. |

## 4. Plataforma y ejecución

### 4.1 Tecnologías

| Área | Implementación |
|---|---|
| Runtime | Node.js, módulos ESM (`type: module`). |
| Lenguaje | TypeScript 5.9 en modo `strict`, `NodeNext`, `noUncheckedIndexedAccess` y `exactOptionalPropertyTypes`. |
| HTTP | Express 5.2. |
| Validación | Zod 4 y `zod-validation-error`. |
| ORM/base de datos | Prisma 7 con `@prisma/adapter-pg` y PostgreSQL. |
| Seguridad | JWT con `jsonwebtoken`; hash de contraseñas con bcrypt. |
| IA | SDK `@google/genai`, modelo configurado `gemini-3-flash-preview`. |
| Archivos | Multer para temporales y Cloudinary para almacenamiento público. |
| Email | Nodemailer. |
| Observabilidad | Winston a archivos y consola fuera de producción. |
| API docs | OpenAPI 3.0.3 y Swagger UI. |
| Pruebas | Jest, ts-jest, Supertest y cobertura V8. |

### 4.2 Arranque y cierre

`src/app.ts` obtiene todas las variables de entorno, crea `Server` con `AppRoutes.routes` y ejecuta `server.start()`.

El servidor aplica, en este orden:

1. parser JSON;
2. CORS;
3. parser `application/x-www-form-urlencoded` para el formulario de contraseña;
4. todas las rutas;
5. `ErrorMiddleware.handleError` como manejador final.

En `SIGINT` o `SIGTERM` deja de aceptar conexiones HTTP, desconecta Prisma y termina con código 0; si el cierre falla, registra el error y termina con código 1.

### 4.3 Variables de entorno

Todas se validan al importar la configuración, por lo que la aplicación no arranca si falta cualquiera de ellas:

- aplicación: `PORT`, `NODE_ENV`, `WEBSERVICE_URL`;
- PostgreSQL: `POSTGRES_URL`, `POSTGRES_USER`, `POSTGRES_DB`, `POSTGRES_PASSWORD`;
- autenticación: `JWT_SEED`, `JWT_EMAIL_VERIFICATION_SEED`, `JWT_PASSWORD_RESET_SEED`;
- correo: `MAILER_SERVICE`, `MAILER_EMAIL`, `MAILER_SECRET_KEY`;
- Gemini: `GEMINI_API_KEY`;
- Cloudinary: `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `CLOUDINARY_CLOUD_NAME`.

`DATABASE_URL` aparece en `.env.example`, pero no es consumida por el código actual. Prisma CLI y la aplicación usan `POSTGRES_URL`.

## 5. Arquitectura de implementación

### 5.1 Capas y responsabilidades

| Capa | Ubicación | Responsabilidad real |
|---|---|---|
| Presentación | `src/presentation` | Rutas, middleware, parseo HTTP, validación Zod/DTO, controladores, respuestas JSON/texto/HTML y páginas de autenticación. |
| Dominio/aplicación | `src/domain` | Entidades, casos de uso y contratos abstractos de repositorio/datasource. La mayoría de los casos de uso delega en un repositorio; autenticación y chat contienen más orquestación. |
| Infraestructura | `src/infrastructure` | Implementaciones Prisma, mapeo entre filas y entidades, y repositorios que delegan en datasources. |
| Datos | `src/data/postgres` | Instancia compartida de `PrismaClient` con adaptador `pg`. |
| Configuración/adaptadores | `src/config` | Entorno, JWT, bcrypt, email, Gemini, Cloudinary, logging, OpenAPI e instrucción de sistema. |
| Composición | `src/presentation/routes.ts` y cada `routes.ts` | Construye adaptadores, datasource, repositorio y controlador concretos; monta cada router. |

Flujo predominante:

```text
cliente HTTP
  -> middleware de autenticación/upload
  -> schema Zod y DTO
  -> controller
  -> caso de uso
  -> repository abstracto/implementación
  -> datasource abstracto/implementación Prisma
  -> PostgreSQL
```

Excepciones relevantes:

- `HealthController` consulta Prisma y adaptadores externos directamente.
- Los casos de uso de autenticación usan adaptadores concretos de JWT, bcrypt y email.
- Los casos de uso paginados de registro cognitivo reciben `PaginationDto` desde presentación.
- Los repositorios concretos son adaptadores de paso directo; las consultas y reglas de persistencia están principalmente en los datasources.

### 5.2 Construcción de dependencias por módulo

| Módulo | Colaboración principal |
|---|---|
| Auth usuario | `AuthRouter -> AuthController -> RegisterUser/ValidateEmail/ResetPasswordUseCase o UserRepositoryImpl -> UserDatasourceImpl -> Prisma` |
| Auth profesional | `AdminAuthRouter -> AdminAuthController -> RegisterAdmin o AdminAuthRepositoryImpl -> AdminAuthDatasourceImpl -> Prisma` |
| Administración | `AdminUserRouter -> AdminUserController -> CreateUserAdmin o AdminUserRepositoryImpl -> AdminUserDatasourceImpl -> Prisma` |
| Test breve | `TestBreveEstadoDeAnimoRouter -> Controller -> caso de uso específico -> RepositoryImpl -> DatasourceImpl -> Prisma` |
| Registro cognitivo | `RegistroEstadoDeAnimoRouter -> Controller -> caso de uso específico -> RepositoryImpl -> DatasourceImpl -> Prisma/Mapper` |
| Chat | `ChatIARouter -> ChatIAController -> caso de uso -> ChatIARepositoryImpl -> ChatIADatasourceImpl -> Prisma`, más Gemini y Cloudinary. |
| Health | `AppRoutes -> HealthController -> Prisma + GeminiService + FilesRepositoryService + EmailService` |

## 6. Reglas HTTP, autenticación y errores

### 6.1 CORS y formatos

- Origen permitido: `http://localhost:5173`.
- Métodos permitidos: `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`.
- Headers permitidos: `Content-Type`, `Authorization`.
- Credenciales CORS: habilitadas.
- Respuesta normal: JSON, salvo páginas de autenticación (`text/html`) y respuesta de Gemini (`text/plain` en streaming).

### 6.2 JWT y roles

Los endpoints protegidos exigen:

```http
Authorization: Bearer <jwt>
```

El token de sesión se firma con `JWT_SEED`, dura 2 horas por defecto y contiene:

```json
{
  "id": "uuid",
  "email": "persona@example.com",
  "name": "Nombre",
  "role": "USER_ROL | PROFESIONAL_ROL",
  "purpose": "session"
}
```

`AuthMiddleware` valida firma, expiración, emisor, audiencia, algoritmo HS256 y `purpose=session`. Después consulta el usuario por `id` en PostgreSQL, exige que siga activo y que su rol actual coincida con el endpoint. `req.user` y `res.locals.user` se construyen con los datos actuales de la base, no con email, nombre o rol posiblemente obsoletos del token. La identidad enviada en body, query o params no se utiliza como propietario: los controladores sustituyen o complementan esos datos con `req.user.id`.

Los tokens de validación de email y recuperación usan secretos distintos, audiencias distintas y los propósitos `email-verification` y `password-reset`. Las tres variables de secreto deben tener valores diferentes o la aplicación no arranca.

Respuestas del middleware:

| Condición | Respuesta |
|---|---|
| Sin `Authorization` | `401 {"error":"No token provided"}` |
| No comienza con `Bearer ` | `401 {"error":"Invalid Bearer token"}` |
| JWT inválido/expirado | `401 {"error":"Invalid token"}` |
| Sin id, cuenta inexistente o cuenta inactiva | `401 {"error":"Invalid Bearer token - user"}` |
| Rol incorrecto | `401 {"error":"Invalid Bearer token - role"}` |
| Excepción inesperada en middleware | `500 {"error":"Internal Server Error"}` |

### 6.3 Errores centralizados

- `CustomError(statusCode, message)` se convierte en `{ "error": message }` con su status.
- Cualquier otro error se registra y se convierte en `500 {"error":"Internal Server Error"}`.
- Si ya se enviaron headers —caso posible durante streaming— se registra el error y se aborta la conexión sin intentar enviar JSON ni cambiar el status, de modo que el cliente no confunda un stream incompleto con una finalización normal.

## 7. Inventario efectivo de endpoints

Esta tabla refleja las rutas montadas por Express, incluidas las diferencias con OpenAPI.

| ID | Método y ruta efectiva | Acceso | Formato de entrada | Resultado principal |
|---|---|---|---|---|
| SYS-01 | `GET /health` | Público | Sin body | Estado de PostgreSQL, Gemini, Cloudinary y mailer. |
| DOC-01 | `GET /api-docs.json` | Público | Sin body | Documento OpenAPI como JSON. |
| DOC-02 | `GET /api-docs` | Público | Sin body | Swagger UI; también sirve sus recursos bajo el mismo montaje. |
| AUTH-01 | `POST /api/auth/register` | Público | JSON | Registra usuario y envía validación. |
| AUTH-02 | `GET /api/auth/validate-email/:token` | Público | Token path | Valida email y muestra HTML. |
| AUTH-03 | `POST /api/auth/login` | Público | JSON | Autentica usuario y entrega JWT. |
| AUTH-04 | `GET /api/auth/check-status` | `USER_ROL` | Bearer | Renueva JWT. |
| AUTH-05 | `POST /api/auth/reset-password` | Público | JSON | Solicita enlace de recuperación. |
| AUTH-06 | `GET /api/auth/reset-password/:token` | Público | Token path | Muestra formulario HTML o error. |
| AUTH-07 | `POST /api/auth/reset-password/:token` | Público | Form o JSON | Cambia contraseña y muestra HTML. |
| ADM-AUTH-01 | `POST /admin/auth/register` | Público en la implementación actual | JSON | Registra profesional ya verificado. |
| ADM-AUTH-02 | `POST /admin/auth/login` | Público | JSON | Autentica profesional y entrega JWT. |
| ADM-AUTH-03 | `GET /admin/auth/check-status` | `PROFESIONAL_ROL` | Bearer | Renueva JWT profesional. |
| ADM-USR-01 | `POST /admin/user/` | `PROFESIONAL_ROL` | JSON | Crea usuario de cualquier rol permitido. |
| ADM-USR-02 | `GET /admin/user/` | `PROFESIONAL_ROL` | Query | Lista y filtra usuarios. |
| ADM-USR-03 | `GET /admin/user/:idUsuario` | `PROFESIONAL_ROL` | UUID path | Obtiene cuenta. |
| ADM-USR-04 | `PUT /admin/user/:idUsuario` | `PROFESIONAL_ROL` | UUID + JSON | Actualiza campos de cuenta. |
| ADM-USR-05 | `DELETE /admin/user/:idUsuario` | `PROFESIONAL_ROL` | UUID path | Baja lógica (`isActive=false`). |
| ADM-USR-06 | `PUT /admin/user/restore-user/:idUsuario` | `PROFESIONAL_ROL` | UUID path | Reactiva cuenta. |
| TB-01 | `POST /api/test-breve-estado-de-animo/` | `USER_ROL` | JSON | Crea o reemplaza el test del usuario para la fecha. |
| TB-02 | `GET /api/test-breve-estado-de-animo/by-year/:year` | `USER_ROL` | Año path | Lista tests del año. |
| TB-03 | `GET /api/test-breve-estado-de-animo/by-date/:year/:month/:day` | `USER_ROL` | Fecha path | Obtiene test del día. |
| TB-04 | `PUT /api/test-breve-estado-de-animo/` | `USER_ROL` | JSON | Reemplaza el test de la fecha del body. |
| TB-05 | `DELETE /api/test-breve-estado-de-animo/:year/:month/:day` | `USER_ROL` | Fecha path | Elimina test(s) del día. |
| REA-01 | `POST /api/registro-estado-de-animo/` | `USER_ROL` | JSON | Crea registro cognitivo. |
| REA-02 | `GET /api/registro-estado-de-animo/pendientes` | `USER_ROL` | Query | Lista registros pendientes. |
| REA-03 | `GET /api/registro-estado-de-animo/completos` | `USER_ROL` | Query | Lista registros completos. |
| REA-04 | `GET /api/registro-estado-de-animo/:idRegistro` | `USER_ROL` | UUID path | Obtiene registro propio. |
| REA-05 | `PUT /api/registro-estado-de-animo/` | `USER_ROL` | JSON con `id` | Reemplaza registro propio. |
| REA-06 | `DELETE /api/registro-estado-de-animo/:idRegistro` | `USER_ROL` | Path | Elimina registro propio. |
| CHAT-01 | `POST /api/chat-ia/new-chat` | `USER_ROL` | JSON | Crea chat. |
| CHAT-02 | `GET /api/chat-ia/get-chats-by-user` | `USER_ROL` | Sin body | Lista chats y último mensaje. |
| CHAT-03 | `GET /api/chat-ia/get-messages-from-chat/:idChat` | `USER_ROL` | UUID path | Obtiene historial. |
| CHAT-04 | `POST /api/chat-ia/send-message-to-chat/:idChat` | `USER_ROL` | Multipart | Envía prompt/adjuntos y recibe stream. |
| CHAT-05 | `DELETE /api/chat-ia/delete-chat/:idChat` | `USER_ROL` | UUID path | Elimina chat propio. |

## 8. Autenticación de usuario final

### 8.1 Contratos compartidos

Registro:

```json
{
  "email": "persona@example.com",
  "name": "Nombre de al menos 2 caracteres",
  "password": "mínimo 6 caracteres"
}
```

Login:

```json
{
  "email": "persona@example.com",
  "password": "mínimo 6 caracteres"
}
```

Zod valida el formato de email, aplica `trim` a email y nombre durante la validación y exige las longitudes indicadas. Sin embargo, el DTO construye la entidad desde el body original, no desde el valor transformado por Zod; por tanto, los valores persistidos no reciben necesariamente el `trim` validado.

Respuesta de sesión:

```json
{
  "id": "uuid",
  "email": "persona@example.com",
  "name": "Nombre",
  "role": "USER_ROL",
  "token": "jwt"
}
```

### 8.2 AUTH-01 — Registrar usuario

**Endpoint:** `POST /api/auth/register`

**Actor:** visitante.

**Clases:** `AuthController.registerUser -> UserDTO.register -> RegisterUser -> UserRepositoryImpl -> UserDatasourceImpl`.

Flujo principal:

1. Se valida el body de registro.
2. Se crea `UserEntity` provisional con `id=""`, `emailVerified=false` y `role=""`.
3. `RegisterUser` cifra la contraseña con bcrypt.
4. El datasource comprueba que el email no exista y busca `Role.description=USER_ROL`.
5. Crea `User` con email no verificado.
6. Genera un JWT de validación `{email, purpose:"email-verification"}` con duración de 24 horas y el secreto exclusivo de validación.
7. Construye `${WEBSERVICE_URL}/api/auth/validate-email/<token>` y envía un email HTML. Email, nombre y enlace se escapan antes de interpolarlos.
8. Vacía la contraseña de la entidad de respuesta.

**Respuesta exitosa:** `201` con la entidad provisional:

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

`isActive` vale `undefined` y normalmente no aparece al serializar JSON. El endpoint no recupera desde la base de datos el UUID ni el rol asignado.

**Alternativas y errores:**

- body inválido: `400 {error: <detalle Zod>}`;
- email repetido: `400 {error:"Email already exists"}`;
- rol semilla ausente: `400 {error:"Invalid role"}`;
- fallo al generar token o al informar fallo de envío: `500`.

La fila del usuario se crea antes de enviar el correo; si el envío falla, la cuenta permanece registrada y un segundo intento de registro encuentra el email duplicado.

### 8.3 AUTH-02 — Validar email

**Endpoint:** `GET /api/auth/validate-email/:token`

**Clases:** `AuthController.validateEmail -> ValidateEmail -> JwtAdapter -> UserRepositoryImpl -> UserDatasourceImpl`.

1. Se verifica que el parámetro sea string.
2. Se validan firma, expiración, algoritmo, emisor, audiencia y `purpose=email-verification`; después se extrae `email`.
3. Prisma actualiza `User.emailVerified=true` buscando por email.
4. En éxito se devuelve una página HTML «Email validado con éxito».
5. Cualquier error —token inválido, expirado, email inexistente o fallo de base de datos— es capturado por el controlador y produce una página HTML «No pudimos validar tu email».

Ambas páginas se envían con status HTTP 200; el fallo se comunica en el contenido HTML, no mediante el status.

### 8.4 AUTH-03 — Iniciar sesión de usuario

**Endpoint:** `POST /api/auth/login`

**Clases:** `AuthController.loginUser -> UserRepositoryImpl -> UserDatasourceImpl -> bcryptAdapter/JwtAdapter`.

Orden de verificaciones:

1. formato del body;
2. existencia por email;
3. `isActive=true`;
4. coincidencia bcrypt;
5. `emailVerified=true`;
6. rol exacto `USER_ROL`;
7. generación de JWT de sesión de 2 horas.

**Resultados:**

| Condición | Status y error |
|---|---|
| Éxito | `200` con respuesta de sesión. |
| Email inexistente | `400`, `Email not found`. |
| Cuenta inactiva | `400`, `User is deleted or ban`. |
| Password incorrecta | `400`, `Invalid password`. |
| Email no verificado | `401`, `EMAIL_NOT_VERIFIED`. |
| Rol distinto | `400`, `INCORRET_ROLE` (ortografía literal del código). |
| Fallo de token u otro error | `500`. |

### 8.5 AUTH-04 — Verificar/renovar sesión

**Endpoint:** `GET /api/auth/check-status`

**Actor:** JWT de sesión `USER_ROL` válido cuya cuenta continúa activa.

El middleware consulta PostgreSQL por el `id` del token y rechaza cuentas eliminadas, desactivadas o cuyo rol actual no sea `USER_ROL`. Con la identidad actual recuperada genera otro JWT de sesión de 2 horas y devuelve la misma forma que el login.

### 8.6 AUTH-05 — Solicitar recuperación de contraseña

**Endpoint:** `POST /api/auth/reset-password`

**Body:** `{ "email": "persona@example.com" }`.

**Clases:** `AuthController.resetPassword -> ResetPasswordUseCase -> UserRepositoryImpl -> UserDatasourceImpl -> EmailService`.

Flujo diseñado e implementado:

1. Se valida que `email` sea string y tenga formato de email.
2. Se intenta comprobar si el usuario existe.
3. Si no existe, se termina sin revelar esa condición.
4. Si existe, se genera JWT `{email, purpose:"password-reset"}` de 15 minutos con su secreto exclusivo.
5. El JWT completo y su expiración se guardan en `resetToken` y `resetTokenExpiration`.
6. Se envía un enlace `${WEBSERVICE_URL}/api/auth/reset-password/<token>`.
7. Se responde siempre `200 {"message":"OK"}` para un email sintácticamente válido, exista o no.

**Comportamiento efectivo importante:** `UserRepositoryImpl.verifyUserByEmail(email)` delega por error a `userDatasource.validateEmail(email)`, no a `verifyUserByEmail(email)`. Por ello, solicitar recuperación para una cuenta existente también establece `emailVerified=true` antes de crear el token. Esta desviación debe representarse en cualquier diagrama del sistema actual y corregirse antes de modelarla como regla deseada.

### 8.7 AUTH-06 — Mostrar formulario de recuperación

**Endpoint:** `GET /api/auth/reset-password/:token`.

El token debe cumplir dos condiciones:

- JWT válido, no expirado y con `purpose=password-reset`;
- coincidencia exacta con `User.resetToken` y `resetTokenExpiration > ahora`.

Si ambas se cumplen, devuelve una página HTML con formulario `POST` a la misma ruta. El token se codifica con `encodeURIComponent` antes de insertarlo en el atributo `action`. En otro caso devuelve una página HTML de token inválido o vencido. Los dos resultados usan status 200.

### 8.8 AUTH-07 — Establecer nueva contraseña

**Endpoint:** `POST /api/auth/reset-password/:token`

**Content-Type:** `application/x-www-form-urlencoded` desde el formulario o JSON desde otro cliente.

**Body:** `{ "password": "nueva contraseña" }`.

1. Valida el JWT de propósito `password-reset` y extrae email.
2. Cifra `password` con bcrypt.
3. Busca usuario por email, token exacto y expiración futura.
4. Actualiza el hash y deja `resetToken` y `resetTokenExpiration` en `null`.
5. Devuelve HTML de éxito o fracaso, normalmente con status 200.

El formulario HTML exige 6 caracteres, pero el controlador no aplica validación Zod ni comprueba tipo/longitud. Un cliente directo puede omitir esa restricción y un valor ausente o no compatible puede terminar como error 500 durante bcrypt.

## 9. Autenticación y administración profesional

### 9.1 ADM-AUTH-01 — Registrar profesional

**Endpoint:** `POST /admin/auth/register`

**Acceso efectivo:** público; la ruta no incluye `validateJWTAdmin`.

**Body:** mismo contrato que registro de usuario.

**Clases:** `AdminAuthController.registerUser -> RegisterAdmin -> AdminAuthRepositoryImpl -> AdminAuthDatasourceImpl`.

El flujo cifra la contraseña, rechaza emails repetidos, busca el rol `PROFESIONAL_ROL` y crea una cuenta con `emailVerified=true`. Devuelve `201` con UUID real, email, nombre, password vacía, rol profesional y email verificado. La posibilidad de crear públicamente una cuenta privilegiada es comportamiento actual y un riesgo de autorización, no una recomendación funcional.

### 9.2 ADM-AUTH-02 — Login profesional

**Endpoint:** `POST /admin/auth/login`.

Valida existencia, password bcrypt, email verificado y rol `PROFESIONAL_ROL`; luego devuelve un JWT de 2 horas con la forma de sesión estándar.

| Condición | Resultado |
|---|---|
| Éxito | `200`, datos de profesional y JWT. |
| Email inexistente/password inválida/rol de usuario | `400` con `Email not found`, `Invalid password` o `USER_IS_NOT_ADMIN`. |
| Email no verificado | `401 EMAIL_NOT_VERIFIED`. |

A diferencia del login de usuario final, este datasource no comprueba `isActive`, por lo que una cuenta profesional dada de baja puede iniciar sesión.

### 9.3 ADM-AUTH-03 — Verificar/renovar sesión profesional

**Endpoint:** `GET /admin/auth/check-status`

**Acceso:** JWT `PROFESIONAL_ROL`.

Replica el comportamiento de `AUTH-04`: revalida en la base que la cuenta siga activa y conserve el rol `PROFESIONAL_ROL`, genera un token nuevo con la identidad actual y responde `200` con identidad, rol y token.

### 9.4 Contrato de usuario administrado

El schema usado para creación y edición admite estos campos, todos marcados como opcionales en la implementación:

| Campo | Validación |
|---|---|
| `email` | Email válido. |
| `name` | String, mínimo 2 caracteres. |
| `password` | String, mínimo 6 caracteres. |
| `emailVerified` | Boolean. |
| `role` | `USER_ROL` o `PROFESIONAL_ROL`. |

Una petición de creación válida en términos de negocio debería enviar los cinco campos. Como todos son opcionales para Zod, omisiones pueden avanzar hasta bcrypt o Prisma y producir un 500; este es un defecto del contrato actual.

La representación administrativa de usuario es:

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

### 9.5 ADM-USR-01 — Crear usuario desde administración

**Endpoint:** `POST /admin/user/`

**Acceso:** `PROFESIONAL_ROL`.

**Clases:** `AdminUserController.createUser -> UserAdminDTO -> CreateUserAdmin -> AdminUserRepositoryImpl -> AdminUserDatasourceImpl`.

Se cifra la contraseña, se rechaza email repetido, se resuelve el rol y se crea la fila con el valor de `emailVerified` recibido. Si `role` no es exactamente profesional, el datasource elige `USER_ROL`; el schema impide otros strings, pero permite que el campo falte. Responde `201` con la representación administrativa y password vacía.

### 9.6 ADM-USR-02 — Listar y filtrar usuarios

**Endpoint:** `GET /admin/user/`

**Acceso:** `PROFESIONAL_ROL`.

| Query | Default | Validación y efecto |
|---|---:|---|
| `page` | 1 | Entero mínimo 1. |
| `limit` | 10 | Entero entre 1 y 999. |
| `query` | `""` | Máximo 100; busca parcialmente y sin distinguir mayúsculas en nombre **o** email. |
| `emailVerify` | `""` | `verify`, `unverify` o vacío; filtra `emailVerified`. |
| `rol` | `""` | `USER_ROL`, `PROFESIONAL_ROL` o vacío. |
| `state` | `""` | `active`, `inactive` o vacío; filtra `isActive`. |

Prisma ejecuta en paralelo `findMany` y `count`, con `skip=(page-1)*limit`. No hay `orderBy`, por lo que el orden no está garantizado. Respuesta:

```json
{
  "results": ["<representaciones administrativas>"],
  "totalPages": 1,
  "page": 1,
  "limit": 10
}
```

`totalPages` tiene mínimo 1, incluso con cero resultados.

### 9.7 ADM-USR-03 — Obtener usuario por ID

**Endpoint:** `GET /admin/user/:idUsuario`.

Valida UUID, busca usuario con su rol y devuelve la representación administrativa. UUID inválido y usuario inexistente se reportan como 400; el segundo usa `User not found`.

### 9.8 ADM-USR-04 — Actualizar usuario

**Endpoint:** `PUT /admin/user/:idUsuario`.

Valida UUID y el body opcional. Si se envía password, se cifra. El datasource:

1. comprueba que exista el ID;
2. si cambia el email, comprueba unicidad;
3. si cambia el rol, resuelve su `roleId`;
4. construye un update sólo con `email`, `name`, `password`, `emailVerified` y `roleId` presentes.

Responde `200 {"status":"success"}`. Errores esperados: `ID not found`, `Email already exists` o `Invalid role`, todos como 400.

Aunque el DTO contiene una rama para `isActive`, el schema no lo declara y el datasource no lo incorpora al update. La activación debe hacerse mediante el endpoint de restauración.

### 9.9 ADM-USR-05 y ADM-USR-06 — Baja lógica y restauración

- `DELETE /admin/user/:idUsuario` establece `isActive=false`.
- `PUT /admin/user/restore-user/:idUsuario` establece `isActive=true`.

Ambos validan UUID, exigen que la fila exista y responden `200 {"status":"success"}`. Son idempotentes respecto del estado: volver a eliminar una cuenta ya inactiva o restaurar una activa sigue produciendo éxito. No borran datos relacionados porque la cuenta permanece en la base.

## 10. Test breve de estado de ánimo

### 10.1 Objetivo y reglas de datos

El módulo guarda una evaluación fechada compuesta por cuatro subescalas. Todos los ítems son enteros entre 0 y 4. El backend no calcula totales, umbrales, diagnósticos ni alertas; incluso puntuaciones altas de impulso suicida se almacenan sin disparar otro flujo.

Body canónico de creación y edición:

```json
{
  "fecha": "2026-08-25T15:00:00.000Z",
  "notas": "Texto opcional de hasta 500 caracteres o null",
  "depresion": {
    "tristeza": 0,
    "desesperanza": 0,
    "bajaAutoestima": 0,
    "faltaDeValor": 0,
    "perdidaDeSatisfaccion": 0
  },
  "impulsoSuicida": {
    "pensamientosSuicidas": 0,
    "deseosDeMorir": 0
  },
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
    "angustiado": 0,
    "nervioso": 0,
    "preocupado": 0,
    "asustado": 0,
    "tenso": 0
  }
}
```

`idUsuario` no debe confiarse al cliente: el controlador lo inserta desde el JWT. `id` es admitido por el schema pero no se usa para localizar ni guardar el test. `fecha` sólo se valida como string; no se comprueba formato ISO ni que represente una fecha válida. `notas` es un campo requerido por Zod cuyo valor puede ser string de hasta 500 caracteres o `null`.

La entidad `TestBreveEstadoDeAnimo` transforma la fecha a `Date` y encapsula `DepresionTestBreve`, `ImpulsoSuicidaTestBreve`, `SentimientosAnsiedadFisicaTestBreve` y `SentimientosAnsiedadEmocionalTestBreve`.

### 10.2 TB-01 — Crear test de una fecha

**Endpoint:** `POST /api/test-breve-estado-de-animo/`

**Clases:** `TestBreveEstadoDeAnimoController.save... -> TestBreveEstadoDeAnimoDTO -> CreateTestBreveEstadoDeAnimoUseCase -> RepositoryImpl -> DatasourceImpl`.

1. Se valida el body completo y se fuerza `idUsuario=req.user.id`.
2. El datasource comprueba que la fila `User` exista.
3. Deriva de `fecha` la clave de calendario `fechaDia`, almacenada como `DATE`.
4. Busca por la clave compuesta `(idUsuario, fechaDia)`.
5. Si ya existe, llama a la lógica de edición, que elimina y vuelve a crear.
6. Si no existe, crea el test y sus cuatro relaciones uno-a-uno mediante escritura anidada Prisma.
7. Si otra petición crea la misma clave entre la consulta y la escritura, Prisma devuelve `P2002` y el datasource reintenta mediante la lógica de reemplazo.

**Respuesta:** `201 {"status":"success"}` tanto si creó como si reemplazó. Si el usuario físico no existe, el datasource retorna sin escribir y el controlador también responde éxito.

La base de datos garantiza «un test por usuario y día» mediante un índice único sobre `(idUsuario, fechaDia)`. La consulta previa sólo decide entre crear y reemplazar; no es la garantía de unicidad.

### 10.3 TB-02 — Listar tests por año

**Endpoint:** `GET /api/test-breve-estado-de-animo/by-year/:year`.

El controlador usa `parseInt` y sólo rechaza `NaN`; no impone un rango de años. El datasource consulta `fechaDia >= 1 de enero del año` y `< 1 de enero del año siguiente`, siempre junto con `idUsuario` del JWT, e incluye las cuatro subescalas. No especifica orden.

**Respuesta:** `200` con un array directo, no envuelto:

```json
[
  {
    "id": "uuid",
    "idUsuario": "uuid-del-token",
    "fecha": "2026-08-25T15:00:00.000Z",
    "notas": "texto si existe",
    "depresion": { "tristeza": 0, "desesperanza": 0, "bajaAutoestima": 0, "faltaDeValor": 0, "perdidaDeSatisfaccion": 0 },
    "impulsoSuicida": { "pensamientosSuicidas": 0, "deseosDeMorir": 0 },
    "ansiedadFisica": { "palpitaciones": 0, "sudoracion": 0, "temblores": 0, "dificultadRespirar": 0, "ahogo": 0, "dolorPecho": 0, "nauseas": 0, "mareos": 0, "sensacionIrrealidad": 0, "inestabilidadHormigueos": 0 },
    "ansiedadEmocional": { "angustiado": 0, "nervioso": 0, "preocupado": 0, "asustado": 0, "tenso": 0 }
  }
]
```

Si `notas` es `null` o string vacío, la construcción actual de la entidad puede omitir la propiedad de la respuesta.

### 10.4 TB-03 — Obtener test por fecha

**Endpoint:** `GET /api/test-breve-estado-de-animo/by-date/:year/:month/:day`.

Valida que los tres segmentos sean números y que formen una fecha calendario real mediante `new Date(year, month-1, day)`. Busca por la clave compuesta `(idUsuario, fechaDia)` usando siempre el propietario del JWT.

- encontrado: `200` con la forma de test anterior;
- no encontrado: `200 null`;
- fecha inválida: `400 {"error":"Fecha inválida"}`.

### 10.5 TB-04 — Editar/reemplazar test

**Endpoint:** `PUT /api/test-breve-estado-de-animo/`.

Usa exactamente el mismo body y validación que la creación. La fecha que controla el reemplazo proviene del body; pese al nombre de clase `Editar...DeHoy`, no se compara con la fecha actual del servidor.

La operación:

1. elimina el test propio identificado por `(idUsuario, fechaDia)`;
2. recrea el test y sus cuatro componentes con los valores nuevos.

Ambos pasos usan el mismo cliente de una transacción interactiva Prisma. Si falla la recreación o cualquiera de sus creaciones anidadas, Prisma revierte también el borrado y conserva el test anterior. La recreación sólo se ejecuta cuando `deleteMany` informa que eliminó al menos un test propio; si no existía uno para ese usuario y fecha, responde `404 {"error":"Test breve no encontrado"}` sin crear un registro nuevo. En una edición exitosa responde `200 {"status":"success"}`.

### 10.6 TB-05 — Eliminar test por fecha

**Endpoint:** `DELETE /api/test-breve-estado-de-animo/:year/:month/:day`.

Valida la fecha calendario, localiza por `(idUsuario, fechaDia)` y ejecuta `deleteMany`. Las relaciones de depresión, impulso y ansiedad se borran en cascada. Si no existe un test propio, no produce error; responde igualmente `200 {"status":"success"}`.

## 11. Registro cognitivo de estado de ánimo

### 11.1 Propósito y estructura

Este módulo representa un registro de reestructuración cognitiva compuesto por:

- el suceso trastornador;
- nueve grupos predefinidos de emociones;
- un grupo de emociones personalizadas;
- intensidad o porcentaje de creencia antes y después;
- cero o más pensamientos negativos;
- una selección de diez distorsiones por pensamiento;
- pensamiento positivo y porcentajes posteriores, que pueden quedar pendientes.

Todos los porcentajes son enteros de 0 a 100. Los campos «después», el pensamiento positivo y su porcentaje aceptan `null`. Los nueve grupos predefinidos y el grupo personalizado son requeridos por el schema HTTP, incluso cuando todas sus emociones estén en `false` o la lista personalizada esté vacía.

### 11.2 Contrato de entrada

Estructura canónica abreviada:

```json
{
  "id": "uuid requerido sólo para PUT",
  "fecha": "2026-08-25T15:00:00.000Z",
  "sucesoTrastornador": "Descripción no vacía",
  "grupoEmociones1": {
    "triste": true,
    "melancolico": false,
    "deprimido": false,
    "decaido": false,
    "infeliz": false,
    "porcentajeCreenciaAntes": 80,
    "porcentajeCreenciaDespues": null
  },
  "grupoEmociones2": { "<emociones del grupo>": false, "porcentajeCreenciaAntes": 0, "porcentajeCreenciaDespues": null },
  "grupoEmociones3": { "<emociones del grupo>": false, "porcentajeCreenciaAntes": 0, "porcentajeCreenciaDespues": null },
  "grupoEmociones4": { "<emociones del grupo>": false, "porcentajeCreenciaAntes": 0, "porcentajeCreenciaDespues": null },
  "grupoEmociones5": { "<emociones del grupo>": false, "porcentajeCreenciaAntes": 0, "porcentajeCreenciaDespues": null },
  "grupoEmociones6": { "<emociones del grupo>": false, "porcentajeCreenciaAntes": 0, "porcentajeCreenciaDespues": null },
  "grupoEmociones7": { "<emociones del grupo>": false, "porcentajeCreenciaAntes": 0, "porcentajeCreenciaDespues": null },
  "grupoEmociones8": { "<emociones del grupo>": false, "porcentajeCreenciaAntes": 0, "porcentajeCreenciaDespues": null },
  "grupoEmociones9": { "<emociones del grupo>": false, "porcentajeCreenciaAntes": 0, "porcentajeCreenciaDespues": null },
  "grupoEmocionesPersonalizadas": {
    "listaEmociones": ["otra emoción"],
    "porcentajeCreenciaAntes": 50,
    "porcentajeCreenciaDespues": null
  },
  "pensamientos": [
    {
      "pensamientoNegativo": "Texto no vacío",
      "porcentajeCreenciaAntes": 90,
      "porcentajeCreenciaDespues": null,
      "pensamientoPositivo": null,
      "porcentajeCreenciaPositivo": null,
      "distorsion": [true, false, false, false, false, false, false, false, false, false]
    }
  ]
}
```

Catálogo exacto de emociones por grupo:

| Grupo | Campos booleanos en orden conceptual |
|---|---|
| 1 | `triste`, `melancolico`, `deprimido`, `decaido`, `infeliz` |
| 2 | `angustiado`, `preocupado`, `conPanico`, `nervioso`, `asustado` |
| 3 | `culpable`, `conRemordimiento`, `malo`, `avergonzado` |
| 4 | `inferior`, `sinValor`, `inadecuado`, `deficiente`, `incompetente` |
| 5 | `solitario`, `noQuerido`, `noDeseado`, `rechazado`, `solo`, `abandonado` |
| 6 | `turbado`, `tonto`, `humillado`, `apurado` |
| 7 | `desesperanzado`, `desanimado`, `pesimista`, `descorazonado` |
| 8 | `frustrado`, `atascado`, `chasqueado`, `derrotado` |
| 9 | `airado`, `enfadado`, `resentido`, `molesto`, `irritado`, `trastornado`, `furioso` |

Cada grupo agrega `porcentajeCreenciaAntes` obligatorio y `porcentajeCreenciaDespues` obligatorio pero anulable.

El array `distorsion` debe contener exactamente diez booleanos. La posición define la clase persistida:

| Índice | Distorsión |
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

`idUsuario` es incorporado desde el JWT. `fecha` sólo exige ser string, sin validación semántica de fecha. `pensamientos` puede ser un array vacío.

### 11.3 Transformación de entrada y salida

`RegistroEstadoDeAnimoDTO` valida el body ya expandido y crea `RegistroEstadoAnimo`. Éste contiene objetos `GrupoEmociones1..9`, `GrupoEmocionesPersonalizadas` y `Pensamiento[]`; cada `Pensamiento` transforma el array posicional en una entidad `Distorsion` de diez atributos.

Al leer desde Prisma, `RegistroEstadoAnimoMapper` de infraestructura reconstruye las entidades. `toJson()` devuelve una forma casi idéntica al body canónico:

- `fecha` se serializa como ISO;
- cada grupo se devuelve como objeto con booleanos y porcentajes;
- emociones personalizadas se devuelven como `listaEmociones: string[]`;
- cada distorsión vuelve a representarse como `boolean[10]` en el orden anterior;
- no se exponen los IDs internos de grupos, pensamientos, distorsiones ni emociones personalizadas.

### 11.4 REA-01 — Crear registro

**Endpoint:** `POST /api/registro-estado-de-animo/`

**Clases:** `RegistroEstadoDeAnimoController.save... -> DTO -> CreateRegistroEstadoDeAnimoUseCase -> RepositoryImpl -> DatasourceImpl`.

1. Valida el contrato completo e impone el usuario del JWT.
2. Comprueba que el usuario exista.
3. Crea en una escritura anidada el registro, nueve grupos, grupo personalizado con su lista, pensamientos y una distorsión por pensamiento.
4. Devuelve el UUID generado.

**Respuesta:** `201`:

```json
{
  "status": "success",
  "id": "uuid-del-registro"
}
```

Si el usuario físico no existe, el datasource devuelve `""` y el controlador responde `201` con ID vacío.

### 11.5 Estado pendiente y completo

La clasificación no inspecciona todos los campos posteriores. Usa exclusivamente:

```text
grupoEmociones1.porcentajeCreenciaDespues == null  -> pendiente
grupoEmociones1.porcentajeCreenciaDespues != null  -> completo
```

Por tanto, un registro puede clasificarse como completo aunque otros grupos o pensamientos mantengan valores posteriores en `null`, y viceversa.

### 11.6 REA-02 — Listar pendientes

**Endpoint:** `GET /api/registro-estado-de-animo/pendientes?page=1&limit=10`.

- `page` y `limit` se convierten con operador `+` y deben ser números mayores que cero.
- No hay máximo para `limit`.
- Filtra por `idUsuario` del JWT y por la regla de pendiente.
- Ordena `fecha desc`.
- Carga todas las relaciones y mapea a entidades.

### 11.7 REA-03 — Listar completos

**Endpoint:** `GET /api/registro-estado-de-animo/completos?page=1&limit=10`.

Es idéntico a REA-02 salvo que exige `grupoEmociones1.porcentajeCreenciaDespues != null`.

Ambos listados responden:

```json
{
  "results": ["<registros expandidos>"],
  "page": 1,
  "limit": 10
}
```

No incluyen total de registros ni total de páginas. Cuando query params fueron enviados explícitamente, `page` y `limit` se devuelven desde `req.query` y pueden aparecer como strings (`"1"`, `"10"`), aunque internamente la paginación usó números.

### 11.8 REA-04 — Obtener registro por ID

**Endpoint:** `GET /api/registro-estado-de-animo/:idRegistro`.

Valida UUID y consulta simultáneamente por ID y propietario. Si existe, devuelve `200` con el registro expandido. Si no existe o pertenece a otro usuario, el caso de uso retorna `null`; el controlador ejecuta `res.json(undefined)`, que produce una respuesta 200 sin representación JSON útil, en vez de 404.

### 11.9 REA-05 — Editar/reemplazar registro

**Endpoint:** `PUT /api/registro-estado-de-animo/`.

El body debe cumplir todo el schema de creación y además `body.id` debe ser UUID. La operación no actualiza relaciones individuales:

1. intenta eliminar el registro con coincidencia `id + idUsuario`;
2. vuelve a crear el agregado completo usando el mismo UUID y los nuevos datos.

La eliminación y recreación forman una sola transacción interactiva Prisma. Consecuencias del comportamiento actual:

- si la recreación falla, Prisma revierte el borrado y conserva el agregado anterior;
- si `deleteMany` no elimina un registro propio, la recreación no se ejecuta y responde `404 {"error":"Registro de estado de ánimo no encontrado"}`; esto cubre tanto un ID inexistente como uno perteneciente a otra persona sin revelar cuál de los dos casos ocurrió;
- el cambio puede mover al registro entre pendiente y completo según el valor posterior del grupo 1.

**Respuesta exitosa:** `200 {"status":"success"}`.

### 11.10 REA-06 — Eliminar registro

**Endpoint:** `DELETE /api/registro-estado-de-animo/:idRegistro`.

El controlador sólo exige que el parámetro no esté vacío; no aplica el validador UUID usado por GET. El datasource verifica ID y propietario, y borra el registro dentro de una transacción Prisma que contiene una única operación `deleteMany`. Todos los componentes se eliminan por cascada.

Si el registro no existe o pertenece a otra persona, no se borra nada y se responde igualmente `200 {"status":"success"}`.

## 12. Chat con IA y archivos adjuntos

### 12.1 Modelo funcional

Un `Chat` pertenece a un usuario y tiene título. Contiene mensajes con rol `user` o `model`; el enum de base también define `system`, pero el datasource no permite guardar ese rol como mensaje. Un mensaje puede contener metadatos de varios archivos:

```json
{
  "id": "uuid-mensaje",
  "text": "contenido",
  "role": "user | model",
  "createdAt": "2026-08-25T15:00:00.000Z",
  "archivos": [
    {
      "fileUri": "URI interna de Gemini",
      "mimeType": "application/pdf",
      "fileUrl": "URL pública de Cloudinary"
    }
  ]
}
```

Los roles `user`, `model` y `system`, igual que los roles de cuenta, deben existir previamente. `inicializacion.pgsql` los inserta manualmente y no es idempotente.

### 12.2 CHAT-01 — Crear chat

**Endpoint:** `POST /api/chat-ia/new-chat`

**Body:** `{ "title": "Título" }`.

**Clases:** `ChatIAController.createNewChat -> CreateChatIAUseCase -> ChatIARepositoryImpl -> ChatIADatasourceImpl`.

El título debe existir, ser string y no ser exactamente `""`; un string de espacios pasa la validación. El datasource:

1. comprueba que el usuario del JWT exista;
2. busca un chat del mismo usuario con el mismo título como comprobación anticipada;
3. si no existe, crea el chat sin mensajes;
4. si una creación concurrente gana la carrera, transforma el `P2002` de Prisma en el mismo error de negocio.

**Respuesta:** `201 {"result":"uuid-del-chat"}`. Un título duplicado exacto produce `400 Chat already exists`; usuario inexistente produce `400 User not found`. Un índice único compuesto `(idUsuario, title)` impide duplicados incluso ante peticiones simultáneas; usuarios distintos pueden reutilizar el mismo título.

### 12.3 CHAT-02 — Listar chats del usuario

**Endpoint:** `GET /api/chat-ia/get-chats-by-user`.

Consulta todos los chats propios. Por cada chat carga como máximo el mensaje más reciente (`createdAt desc`, `take: 1`) con rol y archivos. No define orden para la lista de chats.

**Respuesta:**

```json
{
  "results": [
    {
      "id": "uuid-chat",
      "idUsuario": "uuid-del-token",
      "title": "Título",
      "mensajes": ["<cero o un último mensaje>"]
    }
  ]
}
```

### 12.4 CHAT-03 — Obtener historial de un chat

**Endpoint:** `GET /api/chat-ia/get-messages-from-chat/:idChat`.

Valida UUID y busca por `chat.id + chat.idUsuario`. Devuelve todos los mensajes con archivos y roles, ordenados del más reciente al más antiguo:

```json
{
  "result": {
    "id": "uuid-chat",
    "idUsuario": "uuid-del-token",
    "title": "Título",
    "mensajes": ["<mensajes en orden descendente>"]
  }
}
```

UUID inválido o chat inexistente/ajeno se reportan como 400; el segundo caso usa `Chat not found`.

### 12.5 CHAT-04 — Enviar mensaje y recibir streaming

**Endpoint:** `POST /api/chat-ia/send-message-to-chat/:idChat`

**Content-Type:** `multipart/form-data`.

**Campos:** `prompt` obligatorio y uno o más campos `files` opcionales.

**Respuesta:** `200 text/plain`, escrita incrementalmente.

`prompt` debe ser string de al menos un carácter; un string compuesto sólo por espacios es aceptado. El UUID del chat y el ID de usuario se validan/construyen desde path y JWT.

#### Política de upload

- campo multipart: `files`;
- máximo: 5 archivos;
- máximo por archivo: 5 MiB;
- almacenamiento local temporal: `uploads/`;
- MIME admitidos:
  - imágenes: `image/jpeg`, `image/png`, `image/gif`, `image/webp`, `image/svg+xml`;
  - documentos: PDF, Word/Word Open XML, Excel/Excel Open XML, PowerPoint/PowerPoint Open XML, `text/plain` y `text/csv`.

Multer devuelve 400 para MIME no permitido, tamaño superior a 5 MiB, más de cinco archivos u otros errores de parsing. La autenticación se ejecuta antes de Multer, por lo que una petición sin token no llega a guardar archivos temporales.

#### Flujo principal completo

1. `HandleFileMiddleware` guarda y valida temporales.
2. `PromptChatDTO` valida prompt, UUID de chat, UUID de usuario y estructura Multer.
3. `SendMessageToChatUseCase.prepareAuthorizedUserMessage` recupera hasta los últimos 20 mensajes mediante `chat.id + chat.idUsuario`; esta consulta valida la pertenencia antes de contactar proveedores externos.
4. Invierte el historial a orden cronológico y lo transforma al formato `Content[]` de Gemini.
5. Sólo después de autorizar el chat, sube los adjuntos a Cloudinary.
6. Después sube los mismos temporales a Gemini Files.
7. Combina por índice `secure_url` de Cloudinary con `uri` y `mimeType` de Gemini para crear `ArchivoChatIA[]`.
8. Crea un chat Gemini con la instrucción de sistema y envía el prompt actual más sus `fileData`.
9. Itera el `AsyncGenerator`; por cada fragmento concatena `chunk.text` y lo escribe inmediatamente al response.
10. Crea la entidad del mensaje `model` con el texto completo.
11. Persiste los mensajes `user` —con archivos— y `model` mediante una única creación anidada dentro de una transacción Prisma, después de verificar usuario, pertenencia del chat y roles.
12. Sólo después de persistir ambos mensajes finaliza normalmente el response HTTP.
13. En `finally`, elimina todos los archivos temporales locales.

#### Fallos y consistencia

- Si el stream falla después de haber escrito texto, el cliente conserva el status 200 y el texto parcial ya transmitido, pero el middleware registra el error y aborta la conexión para señalar que el stream no terminó normalmente.
- Si la persistencia falla después de haber escrito texto, no se ejecuta el cierre exitoso del controlador: el error se delega al middleware, que lo registra y aborta el stream sin intentar cambiar el status ni enviar JSON.
- La creación conjunta es atómica: si falla cualquiera de los mensajes, sus archivos anidados o una validación previa, Prisma revierte el turno completo y no queda un mensaje aislado.
- Si el stream falla antes de terminar, normalmente no se guarda ninguno de los dos mensajes.
- Cloudinary y Gemini capturan sus errores de upload y devuelven arrays vacíos. Esto puede degradar silenciosamente los adjuntos o dejar copias remotas sin metadatos persistidos.
- Un chat inexistente o ajeno se rechaza con `Chat not found` antes de invocar Cloudinary, Gemini Files o la generación. Multer ya pudo crear temporales locales, que se eliminan en `finally`.
- La limpieza `finally` elimina temporales tanto en éxito como en validación o fallo del proveedor; los errores Multer también tienen su propia limpieza.

### 12.6 Instrucción de sistema de Gemini

El modelo `gemini-3-flash-preview` recibe una instrucción enfocada en «Externalización de Voces» de TCC:

- fase inicial de saludo y explicación opcional;
- por defecto, usuario como voz negativa e IA como voz positiva/racional;
- réplica racional en primera persona, concisa y sin falso positivismo;
- inversión de roles si la persona lo solicita o se siente atascada;
- suspensión del ejercicio ante ideación suicida, autolesión o violencia explícita, sugiriendo contacto profesional o línea de emergencia;
- salida sólo en texto plano, sin Markdown.

Estas reglas son una instrucción al modelo, no una máquina de estados persistida por la aplicación. El backend no guarda un campo de fase ni valida programáticamente que la respuesta cumpla el formato o los guardrails.

### 12.7 CHAT-05 — Eliminar chat

**Endpoint:** `DELETE /api/chat-ia/delete-chat/:idChat`.

Valida UUID y ejecuta `deleteMany` filtrado por chat y propietario. La eliminación del chat borra en cascada mensajes y filas `Archivo`. Si el chat no existe o es ajeno, devuelve igualmente `200 {"result":"success"}`.

No se invoca la API de Cloudinary ni Gemini para eliminar los objetos remotos; el borrado sólo elimina el chat y sus metadatos de PostgreSQL.

## 13. Health check, documentación y operación

### 13.1 SYS-01 — Health check

**Endpoint:** `GET /health`, público.

`HealthController` inicia en paralelo con `Promise.allSettled`:

1. `SELECT 1` mediante Prisma;
2. obtención de metadatos del modelo Gemini;
3. `cloudinary.api.ping()`;
4. `transporter.verify()` de Nodemailer.

Respuesta:

```json
{
  "status": "ok | degraded | error",
  "timestamp": "ISO-8601",
  "uptime": 123.45,
  "services": {
    "database": "connected | disconnected",
    "gemini": "connected | disconnected",
    "cloudinary": "connected | disconnected",
    "mailer": "connected | disconnected"
  }
}
```

Reglas de status:

| Estado | HTTP | Condición |
|---|---:|---|
| `ok` | 200 | Los cuatro checks responden `true`/fulfilled. |
| `degraded` | 200 | PostgreSQL responde, pero al menos un servicio externo falla. |
| `error` | 503 | PostgreSQL falla, independientemente del resto. |

No se configuran timeouts propios; la latencia del endpoint depende de que terminen los cuatro checks.

### 13.2 DOC-01 y DOC-02 — OpenAPI/Swagger

- `GET /api-docs.json` devuelve `swaggerDocument` OpenAPI 3.0.3.
- `/api-docs` monta Swagger UI y sus recursos estáticos; la navegación puede implicar redirect.

Estos endpoints son públicos. La especificación declara `bearerAuth`, pero no refleja con fidelidad completa el router actual; véase la sección 16.

### 13.3 Logging

Winston crea archivos por nivel en `logs/info.log`, `logs/warn.log`, `logs/error.log` y un archivo combinado. Los timestamps se formatean con `America/Santiago`. Fuera de producción también se añaden transportes de consola; `Logger.error` además ejecuta `console.log` directamente.

Se registran principalmente errores inesperados, fallos de health, fallos de proveedores, limpieza de temporales y señales de cierre. No existe correlación por request, métricas, trazas distribuidas ni auditoría administrativa explícita.

## 14. Modelo de persistencia

### 14.1 Identificadores, enums y fechas

- Agregados principales (`User`, `TestBreveEstadoDeAnimo`, `RegistroEstadoAnimo`, `Chat`, `Mensaje`, `Archivo`) usan UUID string.
- Catálogos y componentes internos usan enteros autoincrementales.
- `TipoRol`: `PROFESIONAL_ROL`, `USER_ROL`.
- `TipoChatRol`: `model`, `user`, `system`.
- Las fechas de eventos se persisten como `DateTime` y las migraciones usan `TIMESTAMP(3)`. El test breve añade `fechaDia`, un `DATE` derivado del calendario local, para aplicar la unicidad diaria sin depender de rangos de timestamps.

### 14.2 Modelos de identidad

| Modelo | Atributos relevantes | Reglas |
|---|---|---|
| `Role` (`role`) | `id`, `description` única | Catálogo de rol de cuenta. |
| `User` (`user`) | UUID, email único, name, password hash, `emailVerified`, `roleId`, `isActive`, timestamps, reset token/expiration | Propietario de tests, registros y chats. `isActive` implementa baja lógica. |

### 14.3 Modelos del test breve

| Modelo | Atributos | Relación |
|---|---|---|
| `TestBreveEstadoDeAnimo` | UUID, `idUsuario`, `fecha`, `fechaDia`, `notas` | Agregado raíz; `(idUsuario, fechaDia)` es único. |
| `Depresion` | cinco puntuaciones 0..4 | Uno-a-uno mediante `testBreveId` único. |
| `ImpulsoSuicida` | dos puntuaciones 0..4 | Uno-a-uno mediante `testBreveId` único. |
| `SentimientosAnsiedadFisica` | diez puntuaciones 0..4 | Uno-a-uno mediante `testBreveId` único. |
| `SentimientosAnsiedadEmocional` | cinco puntuaciones 0..4 | Uno-a-uno mediante `testBreveId` único. |

El schema declara unicidad compuesta `(idUsuario, fechaDia)`. La migración bloquea escrituras durante el cambio, comprueba que no existan duplicados históricos y aborta explícitamente si los encuentra, para no descartar datos clínicos de forma automática.

### 14.4 Modelos del registro cognitivo

| Modelo | Atributos principales | Relación |
|---|---|---|
| `RegistroEstadoAnimo` | UUID, `idUsuario`, fecha, suceso | Agregado raíz. |
| `GrupoEmociones1..9` | booleanos del grupo, porcentaje antes y después | Cada tabla tiene `registroEstadoAnimoId` único: uno-a-uno. |
| `GrupoEmocionesPersonalizadas` | porcentajes antes/después | Uno-a-uno con registro. |
| `EmocionPersonalizada` | descripción | Muchas por grupo personalizado. |
| `Pensamiento` | texto negativo, porcentajes, texto positivo nullable | Muchos por registro. |
| `Distorsion` | diez booleanos | Cero/una por pensamiento, FK única. La aplicación crea una para cada pensamiento. |

### 14.5 Modelos de chat

| Modelo | Atributos principales | Relación |
|---|---|---|
| `Chat` | UUID, title, `idUsuario` | Agregado raíz; `(idUsuario, title)` es único. |
| `ChatRole` | ID, descripción única | Catálogo de roles de mensaje. |
| `Mensaje` | UUID, text, `createdAt`, `roleId`, `chatId` | Muchos por chat. |
| `Archivo` | UUID, `fileUri`, `mimeType`, `fileUrl`, `mensajeId` | Muchos por mensaje. |

### 14.6 Cardinalidades y cascadas para UML/ERD

| Origen | Cardinalidad | Destino | Borrado actual |
|---|---:|---|---|
| `Role` | 1 — 0..* | `User` | Rol referenciado no se puede borrar normalmente (`Restrict`). |
| `User` | 1 — 0..* | `TestBreveEstadoDeAnimo` | Borrado físico de usuario elimina tests en cascada. |
| `User` | 1 — 0..* | `RegistroEstadoAnimo` | Cascada. |
| `User` | 1 — 0..* | `Chat` | Cascada. |
| `TestBreveEstadoDeAnimo` | 1 — 0..1 | Cada una de sus cuatro subescalas | Cascada desde test a componente. |
| `RegistroEstadoAnimo` | 1 — 0..1 | Cada grupo de emociones | Cascada desde registro a grupo. |
| `RegistroEstadoAnimo` | 1 — 0..* | `Pensamiento` | Cascada. |
| `GrupoEmocionesPersonalizadas` | 1 — 0..* | `EmocionPersonalizada` | Cascada. |
| `Pensamiento` | 1 — 0..1 | `Distorsion` | Cascada. |
| `Chat` | 1 — 0..* | `Mensaje` | Cascada. |
| `ChatRole` | 1 — 0..* | `Mensaje` | Restricción mientras haya mensajes. |
| `Mensaje` | 1 — 0..* | `Archivo` | Cascada. |

La API administrativa nunca borra físicamente `User`: sólo cambia `isActive`, por lo que esas cascadas no se ejecutan durante la baja lógica.

### 14.7 Restricciones e invariantes efectivas

- Únicas en base de datos: email de usuario, descripción de roles, FK uno-a-uno de componentes, claves primarias, `(idUsuario, fechaDia)` del test breve y `(idUsuario, title)` del chat.
- Toda lectura/escritura privada de test, registro o chat incorpora el propietario derivado del JWT.
- Los endpoints de eliminación privada prefieren no revelar existencia: recurso inexistente o ajeno suele terminar como éxito sin efecto.
- Las creaciones anidadas de Prisma son atómicas dentro de una sola operación; los reemplazos de test breve y registro cognitivo envuelven delete y create en una transacción interactiva común.

## 15. Material de modelado para casos de uso y UML

### 15.1 Catálogo de casos de uso de negocio

| Caso de uso | Actor primario | Precondición principal | Postcondición exitosa |
|---|---|---|---|
| CU-01 Registrar cuenta de usuario | Visitante | Email no registrado; rol semilla existente. | Usuario activo, no verificado, con password cifrada; correo de validación solicitado. |
| CU-02 Validar email | Titular del enlace | JWT de validación vigente; email existente. | `emailVerified=true`. |
| CU-03 Iniciar sesión de usuario | Usuario | Cuenta existente, activa, verificada, password correcta, rol usuario. | JWT de 2 horas emitido. |
| CU-04 Renovar sesión de usuario | Usuario | JWT de sesión `USER_ROL` vigente y cuenta activa. | Nuevo JWT emitido con identidad revalidada. |
| CU-05 Solicitar recuperación | Visitante | Email sintácticamente válido. | Si la cuenta existe: token persistido y correo solicitado; respuesta no revela existencia. |
| CU-06 Restablecer contraseña | Titular del enlace | JWT y token almacenado vigentes. | Nuevo hash persistido; token consumido/anulado. |
| CU-07 Registrar profesional | Visitante en el sistema actual | Email no registrado; rol profesional semilla. | Profesional verificado y activo creado. |
| CU-08 Iniciar/renovar sesión profesional | Profesional | Credenciales y rol válidos; o JWT profesional vigente. | JWT profesional emitido. |
| CU-09 Administrar usuarios | Profesional | JWT profesional. | Crear, listar, consultar, editar, desactivar o reactivar cuenta. |
| CU-10 Registrar test breve | Usuario | JWT usuario; body válido. | Agregado del día creado o reemplazado. |
| CU-11 Consultar test breve | Usuario | JWT usuario; año/fecha válida. | Historial anual o test propio devuelto. |
| CU-12 Editar/eliminar test breve | Usuario | JWT usuario; body/fecha válida; para editar debe existir un test propio. | Test propio reemplazado atómicamente o eliminado; una edición inexistente responde 404. |
| CU-13 Crear registro cognitivo | Usuario | JWT usuario; agregado completo válido. | Registro y componentes creados; UUID devuelto. |
| CU-14 Consultar registros cognitivos | Usuario | JWT usuario; paginación/UUID válida. | Pendientes, completos o detalle propio devueltos. |
| CU-15 Editar/eliminar registro cognitivo | Usuario | JWT usuario; body completo o ID; para editar debe existir un registro propio. | Agregado reemplazado o eliminado atómicamente; una edición inexistente responde 404. |
| CU-16 Crear/listar chat | Usuario | JWT usuario; título válido. | Chat creado o lista propia con último mensaje devuelta. |
| CU-17 Consultar historial | Usuario | JWT usuario; UUID de chat propio. | Historial descendente devuelto. |
| CU-18 Conversar con IA | Usuario | JWT usuario; chat propio; prompt válido. | Stream entregado; en flujo completo, mensajes y archivos persistidos. |
| CU-19 Eliminar chat | Usuario | JWT usuario; UUID válido. | Chat propio y metadatos locales eliminados en cascada. |
| CU-20 Consultar salud | Operación/monitor | Ninguna. | Estado agregado de cuatro dependencias devuelto. |

### 15.2 Relaciones `include`/`extend` sugeridas desde el código

- **Registrar cuenta de usuario** incluye «validar datos», «cifrar contraseña», «asignar rol», «generar token» y «enviar email».
- **Validar email** incluye «validar JWT» y «actualizar cuenta».
- **Iniciar sesión** incluye «validar credenciales», «validar estado/rol» y «emitir JWT».
- **Recuperar contraseña** se descompone en «solicitar recuperación», «validar enlace» y «establecer nueva contraseña».
- **Administrar usuarios** generaliza crear, listar/filtrar, consultar detalle, actualizar, dar de baja y restaurar.
- **Gestionar test breve** generaliza registrar/reemplazar, listar por año, consultar por fecha y eliminar.
- **Gestionar registro cognitivo** generaliza crear, listar por estado, consultar, reemplazar y eliminar.
- **Enviar mensaje a IA** incluye «procesar adjuntos», «obtener historial», «generar respuesta en streaming», «persistir intercambio» y «limpiar temporales»; «procesar adjuntos» es condicional si `files.length>0`.
- **Eliminar chat** incluye cascada de mensajes/metadatos en PostgreSQL, pero no incluye eliminación en proveedores externos.

### 15.3 Estados relevantes para diagramas de estados

#### Cuenta

Hay dos dimensiones independientes:

```text
Verificación: no_verificada -> verificada
Actividad:    activa <-> inactiva
```

- Registro público de usuario inicia `no_verificada + activa`.
- Registro profesional inicia `verificada + activa`.
- Creación administrativa usa el `emailVerified` recibido y siempre inicia activa por default Prisma.
- Validación o, debido al defecto descrito, solicitud de recuperación puede pasar a `verificada`.
- Baja/restauración cambia sólo actividad.
- No existe transición inversa de `verificada` a `no_verificada` salvo edición administrativa explícita.

#### Token de recuperación

```text
ausente -> vigente -> consumido
                 \-> expirado
```

- Crear una nueva solicitud sobrescribe token y expiración anteriores.
- Consumirlo pone ambos campos en `null`.
- Un token expirado permanece almacenado hasta otra solicitud o un cambio exitoso.

#### Registro cognitivo

```text
pendiente  <->  completo
```

La transición depende sólo de que `grupoEmociones1.porcentajeCreenciaDespues` cambie entre `null` y un número. Como PUT reemplaza el agregado, puede transitar en cualquier dirección.

#### Chat

```text
inexistente -> creado -> con_mensajes -> eliminado_en_BD
```

No existe estado persistido de «generando», «fallido» o fase TCC. El stream y sus fallos son transitorios.

### 15.4 Participantes recomendados para diagramas de secuencia

| Escenario | Lifelines mínimas |
|---|---|
| Registro/validación | Cliente, `AuthRouter`, `AuthController`, `RegisterUser`/`ValidateEmail`, `JwtAdapter`, `EmailService`, `UserRepositoryImpl`, `UserDatasourceImpl`, Prisma/PostgreSQL. |
| Login | Cliente, middleware/controller, DTO, repository, datasource, bcrypt, JWT, PostgreSQL. |
| Test breve | Cliente, `AuthMiddleware`, controller, DTO, use case, repository, datasource, Prisma y tablas del agregado. |
| Registro cognitivo | Cliente, auth, controller, DTO/entidades, use case, repository, datasource, Prisma, mapper en lecturas. |
| Mensaje IA | Cliente, auth, Multer, controller, `SendMessageToChatUseCase`, Cloudinary, Gemini Files, repository/datasource, PostgreSQL, Gemini Chat, response stream, limpieza local. |
| Health | Monitor, `HealthController`, Prisma, Gemini, Cloudinary, Nodemailer; las cuatro llamadas ocurren en paralelo. |

### 15.5 Clases recomendadas para diagramas

Estereotipos útiles:

- `<<boundary>>`: routers, controllers, middleware, schemas, DTO y páginas HTML;
- `<<control>>`: clases `*UseCase`;
- `<<entity>>`: `UserEntity`, `TestBreveEstadoDeAnimo`, subescalas, `RegistroEstadoAnimo`, grupos, `Pensamiento`, `Distorsion`, `ChatChatIA`, `MensajeChatIA`, `ArchivoChatIA`;
- `<<repository interface>>`: contratos en `src/domain/repository`;
- `<<repository>>`: implementaciones `*RepositoryImpl`;
- `<<datasource interface>>` y `<<datasource>>`: contratos e implementaciones Prisma;
- `<<external service>>`: `GeminiService`, `FilesRepositoryService`, `EmailService`, `JwtAdapter`, `bcryptAdapter`;
- `<<database>>`: Prisma/PostgreSQL.

Para un diagrama de clases de dominio, conviene omitir routers y Prisma y usar las cardinalidades de 14.6. Para un diagrama de clases de diseño, agregar controller, caso de uso, interfaz de repositorio, implementación e interfaz/implementación de datasource por módulo.

### 15.6 Operaciones públicas relevantes para diagramas de clases

| Clase/contrato | Operaciones principales |
|---|---|
| `UserEntity` | `fromJson(object)`, `toJson()` |
| `UserRepository` / `UserDatasource` | `register`, `login`, `findActiveUserById`, `validateEmail`, `verifyUserByEmail`, `verifyUserByEmailAndToken`, `createResetPasswordToken`, `resetPassword` |
| `AdminAuthRepository` / datasource | `register`, `login` |
| `AdminUserRepository` / datasource | `createUser`, `getUsers`, `getUserById`, `updateUser`, `deleteUser`, `restoreUser` |
| `RegisterUser` | `execute(user)`; internamente envía validación. |
| `ValidateEmail` | `execute(token)` |
| `ResetPasswordUseCase` | `sendResetPasswordEmail`, `validateResetPasswordToken`, `setNewPassword` |
| `RegisterAdmin`, `CreateUserAdmin` | `execute(user)` |
| Entidades de test breve | `fromJson`; subescalas además `toJson` |
| `TestBreveEstadoDeAnimoRepository` / datasource | `saveTestBreveEstadoDeAnimo`, `getTestBreveEstadoDeAnimoByYear`, `getTodayTestBreveEstadoDeAnimo`, `editarTestBreveEstadoDeAnimoDeHoy`, `eliminarTestBreveEstadoDeAnimoDeHoy` |
| Casos de uso de test | Una clase por operación, cada una con `execute(...)`. |
| `RegistroEstadoAnimo` y componentes | `fromJson`, `toJson`; `Distorsion` convierte entre diez atributos y `boolean[10]`. |
| `RegistroEstadoAnimoRepository` / datasource | `saveRegistroEstadoDeAnimo`, `getRegistroEstadoDeAnimoPendientes`, `getRegistroEstadoDeAnimoCompletos`, `getRegistroEstadoDeAnimoById`, `editarRegistroEstadoDeAnimo`, `eliminarRegistroEstadoDeAnimo` |
| Casos de uso de registro | Una clase por operación, cada una con `execute(...)`. |
| `ChatChatIA`, `MensajeChatIA`, `ArchivoChatIA` | `fromJson`, `toJson` |
| `ChatIARepository` / datasource | `createNewChat`, `getChatsByUser`, `getMessagesFromChat`, `sendMessagesToChat`, `deleteChat` |
| `SendMessageToChatUseCase` | `createUserMessage`, `createGeminiMessage`, `saveMessages`, `streamResponse`; historial/upload son privados. |
| `GeminiService` | `checkHealth`, `uploadFiles`, `chatPromptUseCase` |
| `FilesRepositoryService` | `checkHealth`, `uploadImages` |
| `EmailService` | `checkHealth`, `sendEmail` |
| `JwtAdapter` | `generateToken`, `validateToken` |
| `AuthMiddleware` | `validateJWTUser`, `validateJWTAdmin`, `validateJWT` |
| `HandleFileMiddleware` | `handleUploadFiles` |
| `Server` | `start`, `close`; cierre por señales es privado. |

Los repositorios concretos mantienen las mismas operaciones y delegan uno-a-uno al datasource correspondiente; no agregan estado de dominio.

### 15.7 Vista de despliegue lógica

```text
Cliente Flutter/Web/HTTP
        |
        | HTTPS/HTTP + JWT + JSON/multipart
        v
Proceso Node.js / Express
  |       |         |          |             |
  |       |         |          |             +--> filesystem local: uploads temporales
  |       |         |          +----------------> filesystem local: logs Winston
  |       |         +---------------------------> proveedor SMTP (Nodemailer)
  |       +-------------------------------------> Cloudinary
  +---------------------------------------------> Gemini API / Files
        |
        +---------------------------------------> PostgreSQL mediante Prisma/pg
```

El repositorio incluye `compose.yaml` sólo para PostgreSQL local, expuesto en 5432 y persistido en `./postgres`. Node.js y los proveedores externos no se declaran como servicios del compose.

### 15.8 Flujo de datos y privacidad

| Dato | Destinos efectivos |
|---|---|
| Cuenta/password | PostgreSQL; password sólo como hash bcrypt. Email y nombre se incluyen en JWT de sesión. |
| Email de validación/recuperación | Proveedor configurado en Nodemailer; token aparece en el enlace. |
| Test breve y registro cognitivo | PostgreSQL. No se envían automáticamente a Gemini ni a profesionales. |
| Prompt e historial de chat | PostgreSQL y Gemini para generación. |
| Adjunto de chat | Temporal local, Cloudinary, Gemini Files y metadatos en PostgreSQL. |
| Respuesta IA | Se transmite al cliente, se persiste en PostgreSQL al terminar la generación y sólo entonces se cierra normalmente el stream HTTP. |
| Errores operacionales | Archivos de log; el diseño pretende no registrar passwords, JWT ni contenido clínico, aunque no hay una capa automática de redacción. |

Para una vista de arquitectura de seguridad, los límites de confianza principales son cliente/API, API/PostgreSQL y API/cada proveedor externo. Los tests unitarios simulan esos proveedores en los escenarios cubiertos.

## 16. Diferencias entre OpenAPI y la implementación

| Tema | OpenAPI actual | Express/código actual |
|---|---|---|
| Restaurar usuario | `PUT /admin/user/restore/{idUsuario}` | `PUT /admin/user/restore-user/:idUsuario` |
| Crear usuario administrativo | No está documentado | `POST /admin/user/` existe. |
| Filtros administrativos | Sólo `page`, `limit` | También `query`, `emailVerify`, `rol`, `state`; límite máximo 999. |
| Test anual | `/api/test-breve-estado-de-animo/{year}` | `/api/test-breve-estado-de-animo/by-year/:year` |
| Test por fecha (GET) | `/api/test-breve-estado-de-animo/{year}/{month}/{day}` | `/api/test-breve-estado-de-animo/by-date/:year/:month/:day` |
| Test DTO | `year`, `month`, `day`, `animo` 1..5 | Objeto de 22 puntuaciones 0..4, `fecha` y `notas`. |
| Registro DTO | `animo`, `emociones`, `pensamiento`, `situacion` | Agregado expandido de diez grupos, pensamientos, porcentajes y distorsiones. |
| Listar chats | `/api/chat-ia/chats` | `/api/chat-ia/get-chats-by-user` |
| Historial de chat | `/api/chat-ia/messages/{idChat}` | `/api/chat-ia/get-messages-from-chat/:idChat` |
| Health values | Ejemplos externos `ready` | Código devuelve `connected`/`disconnected`. |
| Reset POST | Describe 400 por token/password inválidos | Token no válido normalmente devuelve HTML de fallo con 200; password no tiene validación de servidor. |
| Rutas de auth profesional | Registro aparece como operación normal | No declara que el registro profesional está públicamente accesible y crea rol privilegiado verificado. |

La especificación OpenAPI no debe usarse como entrada única para generar clientes, pruebas contractuales o casos de uso hasta resolver estas divergencias.

## 17. Hallazgos y limitaciones del sistema actual

Estos puntos no cambian la descripción funcional anterior; indican dónde el comportamiento observado puede no coincidir con el comportamiento deseado.

### 17.1 Autenticación y autorización

1. `POST /admin/auth/register` permite crear profesionales sin autenticación.
2. La solicitud de recuperación llama por error a `validateEmail`, activando la verificación del email existente.
3. El login profesional no comprueba `isActive`.
4. El cambio de contraseña no valida tipo ni longitud en servidor.
5. Los campos de creación administrativa son opcionales en Zod, aunque Prisma/bcrypt necesitan varios de ellos.

### 17.2 Consistencia y semántica HTTP

1. Varias eliminaciones responden éxito si el recurso no existe o es ajeno; GET de registro no encontrado responde 200 sin cuerpo útil.
2. Las páginas de token inválido usan 200; el estado se expresa en HTML.
3. La creación de usuario responde una entidad provisional sin UUID/rol reales.
4. Fechas del body sólo se validan como string y la derivación de `fechaDia` depende de la zona local del proceso.
5. El estado pendiente/completo depende únicamente del porcentaje posterior del grupo 1.

### 17.3 Integraciones y archivos

1. `EmailService.sendEmail` llama `transporter.sendMail()` sin `await`; retorna `true` antes de conocer el resultado asíncrono y su `catch` no captura rechazos posteriores.
2. Eliminar un chat no elimina archivos remotos; fallos de upload también pueden dejar objetos huérfanos.
3. Cloudinary/Gemini convierten fallos de upload en arrays vacíos, con degradación silenciosa.
4. No hay timeout o circuit breaker propio para health, email, uploads ni generación.

### 17.4 Arquitectura y mantenibilidad

1. Algunos casos de uso de dominio dependen de DTO/adaptadores de presentación/configuración; las capas no son completamente independientes.
2. `src/presentation/registro_estado_de_animo/mapper/registroEstadoDeAnimoMapper.ts` no tiene consumidores. Además describe una forma alternativa (`grupoEmociones`, `listaPensamientos`) distinta del body que el controller valida realmente.
3. La especificación OpenAPI está desalineada con varias rutas y contratos.
4. CORS está fijado a un único origen de desarrollo.
5. La carga inmediata de todas las variables obliga a configurar también servicios externos para importar/componer gran parte de la aplicación.

## 18. Pruebas y verificabilidad existente

La configuración Jest ejecuta TypeScript ESM, limpia mocks y recolecta cobertura V8 en todas las corridas. Hay 5 archivos y 16 casos de prueba según la ejecución de esta revisión.

Cobertura funcional observable en pruebas:

- reemplazo transaccional de test breve y registro cognitivo, incluido el caso inexistente que no debe crear;
- respuestas `404` y documentación OpenAPI de ambos `PUT` estrictos;
- autorización del chat antes de uploads externos, persistencia del turno antes de finalizar el stream y propagación del fallo;
- escritura atómica de los mensajes de usuario y modelo;
- schema y migración de unicidad, normalización de `fechaDia` y manejo de colisiones `P2002` para test y chat;
- una prueba básica de funcionamiento de Jest.

Áreas sin pruebas de comportamiento suficientes en la suite actual:

- CRUD completo de administración de usuarios;
- registro/login/validación contra datasource;
- persistencia, pertenencia y límites de día del test breve;
- agregado y clasificación del registro cognitivo;
- CRUD de chat y orden del historial contra datasource;
- integración real con PostgreSQL del rollback, los índices únicos y la persistencia transaccional del stream;
- coherencia entre todas las rutas Express y OpenAPI.

Resultado observado durante esta revisión:

- `npx prisma validate`: exitoso;
- `npx prisma generate`: exitoso con Prisma Client 7.9.1;
- `npm run build`: exitoso;
- `npm test -- --runInBand`: 5 suites y 16 tests exitosos.

Comandos definidos por el proyecto:

```text
npm run build
npm test -- --runInBand
npm run test:coverage
npx prisma validate
npx prisma generate
```

## 19. Mapa de fuentes para continuar el análisis

| Tema | Fuente canónica |
|---|---|
| Montaje de endpoints | `src/presentation/routes.ts` y `src/presentation/**/routes.ts` |
| Contratos y respuestas | Controllers, schemas y DTO de `src/presentation` |
| Reglas/orquestación | `src/domain/use-cases` |
| Entidades para UML | `src/domain/entities` |
| Interfaces/dependencias | `src/domain/repository` y `src/domain/datasources` |
| Consultas, filtros, pertenencia y escrituras | `src/infrastructure/datasources` |
| Mapeo DB-dominio | `src/infrastructure/mappers` y `src/infrastructure/models` |
| Modelo ER y cascadas | `prisma/schema.prisma`; historial en `prisma/migrations` |
| JWT/bcrypt/email/IA/archivos | `src/config` |
| Middleware transversal | `src/presentation/middlewares` |
| Arranque/CORS/cierre | `src/app.ts`, `src/presentation/server.ts` |
| Contrato publicado | `src/config/swagger.config.ts` |
| Comportamiento verificado | `tests/*.test.ts` |

## 20. Resumen de límites del producto actual

El backend implementa identidad, auto-registro clínico y conversación guiada con IA con aislamiento por propietario. La frontera profesional se limita a administrar cuentas. La base conserva datos clínicos estructurados y conversaciones, pero no interpreta puntuaciones, no correlaciona módulos, no asigna pacientes, no emite alertas ni expone analítica clínica. Gemini aporta la dinámica terapéutica conversacional mediante prompt; el backend sólo orquesta contexto, streaming y persistencia.

Para documentos posteriores, debe conservarse la distinción entre:

- **reglas efectivamente codificadas**, descritas en los endpoints y datasources;
- **intención sugerida por nombres o Swagger**, que puede estar desactualizada;
- **comportamiento deseado futuro**, que requiere decisiones de producto y correcciones explícitas.
