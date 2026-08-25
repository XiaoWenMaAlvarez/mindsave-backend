# AGENTS.md

## Alcance y fuentes de verdad

Estas instrucciones aplican a todo el repositorio. Un `AGENTS.md` ubicado en un
subdirectorio puede añadir o reemplazar reglas para ese árbol.

- Antes de cambiar código, lee `README.md`, `package.json`, `tsconfig.json`,
  `prisma.config.ts` y los archivos vecinos al cambio.
- Toma el código y la configuración ejecutable como fuente de verdad cuando la
  documentación esté desactualizada. Actualiza también la documentación si el
  cambio modifica el uso público del proyecto.
- Mantén los cambios pequeños y relacionados con la tarea. No reformatees ni
  refactorices módulos ajenos como efecto secundario.
- Conserva los cambios preexistentes del usuario. Revisa `git status` y
  `git diff` antes de editar y antes de entregar.
- No crees commits, ramas ni pull requests salvo petición explícita.

## Descripción del proyecto

MindSave Backend es una API de salud mental escrita en TypeScript estricto y
ESM. Usa Node.js, Express 5, Prisma 7 con el adaptador `pg` y PostgreSQL.

Módulos funcionales:

- autenticación de usuarios, validación de email y recuperación de contraseña;
- autenticación profesional y administración de usuarios con baja lógica;
- test breve diario de depresión, ansiedad e impulso suicida;
- registro cognitivo detallado de emociones, pensamientos y distorsiones;
- chats con Gemini, respuestas por streaming y adjuntos almacenados en
  Cloudinary;
- health check de PostgreSQL, Gemini, Cloudinary y Nodemailer;
- especificación OpenAPI manual y Swagger UI.

Integraciones principales:

- Zod y `zod-validation-error` para validar entradas;
- JWT y bcrypt para sesión y contraseñas;
- Nodemailer para validación de cuenta y recuperación de contraseña;
- `@google/genai` y Cloudinary para el chat multimodal;
- Multer para archivos temporales en `uploads/`;
- Winston para logs en `logs/`;
- Jest, ts-jest y Supertest para pruebas.

## Mapa del repositorio

- `src/app.ts`: punto de entrada y arranque del servidor.
- `src/presentation/server.ts`: configuración de Express, CORS, parsers,
  middleware de errores y cierre ordenado.
- `src/presentation/routes.ts`: composition root de rutas y servicios.
- `src/presentation/`: rutas, controladores, middlewares, DTOs, schemas Zod y
  páginas HTML de autenticación.
- `src/domain/`: entidades, casos de uso y contratos abstractos de repositories
  y datasources.
- `src/infrastructure/`: implementaciones con Prisma, repositorios, mappers y
  tipos de persistencia.
- `src/data/postgres/index.ts`: instancia compartida de `PrismaClient`.
- `src/config/`: variables de entorno, adaptadores externos, logger,
  instrucción de sistema de Gemini y OpenAPI.
- `prisma/schema.prisma`: modelo de datos canónico.
- `prisma/migrations/`: historial inmutable de migraciones.
- `src/generated/prisma/`: cliente generado e ignorado por Git; nunca editar a
  mano ni versionar.
- `tests/`: pruebas Jest en TypeScript.
- `inicializacion.pgsql`: carga manual de `role` y `chat_role`; no es
  idempotente y referencia la base `mindsave` de forma explícita.
- `.env.example`: inventario de variables, nunca credenciales reales.

El flujo normal de una petición es:

`route -> middleware/schema/DTO -> controller -> use case -> repository -> datasource -> Prisma`

Las rutas construyen las dependencias concretas. Al añadir una funcionalidad,
actualiza los contratos abstractos, implementaciones y `init.ts` pertinentes,
registra el router en `src/presentation/routes.ts`, actualiza OpenAPI y añade
pruebas. El health check es una excepción deliberada que consulta Prisma desde
el controlador.

## Preparación local

1. Instala las dependencias reproducibles con `npm ci`. Usa `npm install` sólo
   cuando necesites actualizar `package-lock.json`.
2. Copia `.env.example` a `.env` y completa los valores localmente. No leas,
   imprimas ni publiques los valores de `.env`.
3. Inicia PostgreSQL con `docker compose up -d`.
4. Aplica las migraciones existentes en una base local con
   `npx prisma migrate dev` y genera el cliente con `npx prisma generate`.
5. En una base nueva, ejecuta `inicializacion.pgsql` una sola vez para crear
   `PROFESIONAL_ROL`, `USER_ROL` y los roles `user`, `model` y `system` del chat.
6. Inicia el servidor con `npm run dev`. La API usa el puerto de `PORT` y el
   health check está en `GET /health`.

`POSTGRES_URL` es la conexión que consumen Prisma CLI y la aplicación.
`DATABASE_URL` figura en `.env.example`, pero el código actual no la usa. La
importación de `envs.ts` valida de forma inmediata todas las variables listadas,
por lo que incluso pruebas que importan rutas necesitan un entorno completo.

No ejecutes migraciones, seeds ni scripts de inicialización contra bases
remotas o compartidas sin autorización explícita. En PowerShell con ejecución
de scripts restringida, usa `npm.cmd` y `npx.cmd`.

## Comandos de trabajo

- Desarrollo: `npm run dev`
- Compilación y type-check de `src/`: `npm run build`
- Producción local: `npm start`
- Suite completa: `npm test -- --runInBand`
- Prueba focalizada: `npm test -- --runInBand tests/<archivo>.test.ts`
- Watch: `npm run test:watch`
- Cobertura: `npm run test:coverage`
- Validar schema Prisma: `npx prisma validate`
- Regenerar cliente Prisma: `npx prisma generate`

`jest.config.ts` activa cobertura en todas las ejecuciones. No existe script de
lint ni format; no inventes `npm run lint` ni incorpores una herramienta de
estilo para una tarea no relacionada. `npm run build` no compila `tests/`, por
lo que build y Jest validan superficies diferentes.

## Convenciones de TypeScript y arquitectura

- Conserva `strict`, `noUncheckedIndexedAccess` y
  `exactOptionalPropertyTypes`; evita `any` nuevo cuando pueda expresarse un
  tipo concreto.
- El proyecto usa `type: module` y resolución `NodeNext`. Las importaciones
  relativas desde `.ts` deben terminar en `.js` para funcionar en el runtime
  compilado.
- Usa `import type` cuando el símbolo sólo se necesita para tipos.
- Sigue el estilo del archivo vecino. No hay formatter automático y conviven
  comillas simples y dobles; evita diffs cosméticos masivos.
- Mantén los términos de dominio, nombres de campos y rutas existentes en
  español. No cambies contratos públicos como parte de una limpieza incidental.
- Mantén HTTP, Express y serialización en `presentation`; reglas y contratos en
  `domain`; persistencia y mapeo en `infrastructure`; clientes externos y
  configuración en `config`.
- No introduzcas nuevas dependencias desde `domain` hacia Express, Prisma o
  implementaciones concretas. Si tocas una dependencia transversal ya
  existente, no amplíes el acoplamiento.
- Usa los barrel exports `init.ts` existentes cuando el módulo vecino ya los
  usa, y actualízalos al exponer símbolos nuevos.
- Las entidades se crean mediante constructores o `fromJson()` y se exponen
  mediante `toJson()`. No filtres respuestas de forma distinta sin revisar el
  contrato del endpoint.

## HTTP, validación y errores

- Valida toda entrada no confiable antes de ejecutar lógica de negocio. Sigue el
  patrón local schema Zod -> función `isValid...` -> DTO -> entidad.
- Los controladores deben responder o delegar errores con `next(error)`; no
  dejes promesas rechazadas sin manejar.
- Usa `CustomError` para errores esperados con status HTTP. Deja los errores
  inesperados al `ErrorMiddleware`, que registra el detalle y devuelve un 500
  genérico.
- Mantén `ErrorMiddleware.handleError` después de todas las rutas.
- Si cambian ruta, parámetros, body, status o respuesta, actualiza también
  `src/config/swagger.config.ts` y las pruebas de `/api-docs.json`.
- `GET /health` hace pings reales en paralelo. Mantiene HTTP 200 en estado
  `degraded` si PostgreSQL responde, y usa 503 cuando PostgreSQL falla.
- El endpoint de chat escribe `text/plain` por streaming. Una vez enviados los
  headers no intentes convertir un fallo en JSON ni cambiar el status; finaliza
  el stream de forma segura y registra el error.

## Autenticación, autorización y privacidad

- `validateJWTUser` exige `USER_ROL`; `validateJWTAdmin` exige
  `PROFESIONAL_ROL`. Conserva estas verificaciones exactas salvo cambio de
  requisitos explícito.
- En rutas protegidas, toma siempre `id`, email y rol desde `req.user`, que
  inyecta `AuthMiddleware`. Nunca confíes en `idUsuario`, rol o identidad
  enviados por body, query o params.
- Toda lectura, edición o eliminación de chats, tests y registros privados debe
  filtrar por el identificador del recurso y por su propietario.
- No devuelvas ni registres passwords, hashes, JWT, reset tokens, credenciales,
  contenido clínico o datos de salud mental.
- Mantén el hash bcrypt, la verificación JWT y la expiración de tokens. Cualquier
  cambio en autenticación exige pruebas de éxito, token ausente/inválido, rol
  incorrecto y acceso a recursos ajenos.
- La eliminación administrativa actual es lógica mediante `isActive`; no la
  conviertas en borrado físico accidentalmente.
- No debilites `src/config/system_instruction.ts` ni presentes la respuesta de
  Gemini como diagnóstico o sustituto de atención profesional.

## Archivos y servicios externos

- Los uploads usan el campo multipart `files`, aceptan como máximo 5 archivos y
  5 MiB por archivo, con la lista MIME definida en
  `handleFiles.middlewares.ts`.
- Los archivos locales de `uploads/` son temporales. Elimínalos tanto en éxito
  como en validación fallida, error del proveedor o interrupción del streaming.
- No llames realmente a PostgreSQL, Gemini, Cloudinary ni Nodemailer en pruebas
  unitarias. Inyecta servicios o simula sus métodos antes de enviar la petición.
- Instanciar `AppRoutes.routes` crea los adaptadores externos. Si una prueba
  llama `/health`, debe simular los cuatro checks o construir un controlador con
  dobles de prueba.
- No cambies el modelo Gemini, los límites de upload, la política de archivos ni
  CORS como efecto secundario de otra tarea.

## Prisma y cambios de datos

- Modifica primero `prisma/schema.prisma` y valida con `npx prisma validate`.
- Para un cambio de esquema crea una migración nueva y descriptiva con
  `npx prisma migrate dev --name <descripcion>`; no reescribas migraciones ya
  aplicadas ni vuelvas a usar el nombre genérico `init`.
- Ejecuta `npx prisma generate` después de cambiar el schema y luego
  `npm run build`.
- Entrega schema y migración juntos. Nunca incluyas
  `src/generated/prisma/` en Git.
- Preserva los nombres `@@map`, enums, relaciones uno-a-uno, `onDelete: Cascade`
  y filtros de propietario salvo que la tarea cambie explícitamente el contrato
  de datos.
- Trata cuidadosamente las fechas locales usadas por los módulos diarios; un
  cambio de zona horaria o normalización UTC puede alterar qué registro se
  considera “hoy” y necesita pruebas de límites de día.

## Pruebas y validación

- Escribe pruebas con importaciones desde `@jest/globals`; usa archivos
  `tests/*.test.ts` y Supertest para comportamiento HTTP.
- Agrega casos de éxito, validación, autorización, pertenencia y errores
  relevantes del comportamiento modificado.
- Para email y páginas HTML, conserva escape de contenido no confiable y añade
  pruebas de inyección. Para uploads, prueba MIME, tamaño, cantidad y limpieza.
- Para streams, prueba el contenido parcial y el error después de enviar
  headers. Para cierre del servidor, restaura spies y cierra listeners/Prisma.
- Validación mínima de cambios de código: `npm run build` y
  `npm test -- --runInBand`. Empieza por pruebas focalizadas y ejecuta la suite
  completa antes de entregar.
- Si cambia Prisma, añade `npx prisma validate` y `npx prisma generate`. Si
  cambia una ruta, valida también OpenAPI, status, body y autenticación.
- Si Jest agota el timeout o no termina por handles abiertos, diagnostica con
  una prueba focalizada y `--detectOpenHandles`; no ocultes el problema con
  `--forceExit` ni presentes una suite fallida como validación exitosa.
- Informa cada comando no ejecutado o fallido y su causa exacta.

## Artefactos, secretos y entrega

- No versionar `.env`, `.env.local`, `dist/`, `coverage/`, `logs/`, `uploads/`,
  `postgres/`, `.codex-*` ni `src/generated/prisma/`.
- Conserva `package-lock.json` cuando cambien dependencias y evita actualizar
  paquetes no relacionados.
- Antes de finalizar, revisa `git diff --check`, `git status --short` y el diff
  limitado a los archivos de la tarea.
- Resume los archivos modificados, decisiones relevantes, validaciones
  ejecutadas y cualquier riesgo o fallo pendiente.
