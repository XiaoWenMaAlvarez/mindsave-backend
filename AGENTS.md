# AGENTS.md

## Alcance y fuentes de verdad

Estas instrucciones aplican a todo el repositorio. Si en el futuro aparece un
`AGENTS.md` dentro de un subdirectorio, sus reglas prevalecen para los archivos
de ese árbol.

- Lee `README.md`, `package.json`, `tsconfig.json`, `prisma.config.ts` y los
  archivos cercanos al cambio antes de modificar código.
- Cuando la documentación y el código difieran, usa la configuración ejecutable
  como fuente de verdad y corrige la documentación si el cambio lo amerita.
- Mantén los cambios pequeños y dentro del alcance solicitado. No reformatees ni
  refactorices módulos no relacionados.
- Conserva los cambios preexistentes del usuario y revisa `git status` y
  `git diff` antes de finalizar.

## Descripción del proyecto

MindSave Backend es una API de salud mental construida con Node.js, TypeScript
estricto, Express 5 y módulos ESM. Persiste datos con Prisma 7 sobre PostgreSQL y
expone módulos de autenticación, test breve de estado de ánimo, registro de
estado de ánimo y chat con Gemini.

La descripción de `package.json` que menciona MongoDB está desactualizada: la
base de datos real es PostgreSQL.

Integraciones relevantes:

- Zod para validación de entrada.
- JWT y bcrypt para autenticación y contraseñas.
- Nodemailer para correos de validación y recuperación.
- Gemini y Cloudinary para el chat con archivos.
- Winston para logs en `logs/`.

## Mapa del repositorio

- `src/app.ts`: punto de entrada de la aplicación.
- `src/presentation/`: servidor Express, rutas, controladores, middleware,
  DTOs y esquemas de validación.
- `src/domain/`: entidades, casos de uso, contratos de repositorios y
  datasources, y `CustomError`.
- `src/infrastructure/`: implementaciones de persistencia, repositorios,
  mappers y tipos de modelos de base de datos.
- `src/data/`: creación y exportación del cliente Prisma.
- `src/config/`: variables de entorno y adaptadores de servicios externos.
- `prisma/schema.prisma`: modelo de datos.
- `prisma/migrations/`: historial de migraciones; no reescribas migraciones ya
  existentes salvo petición explícita.
- `src/generated/prisma/`: cliente generado e ignorado por Git; no lo edites a
  mano.
- `tests/`: pruebas Jest. La cobertura actual es mínima, por lo que todo cambio
  de comportamiento debe incorporar pruebas útiles.
- `inicializacion.pgsql`: roles iniciales de usuario y chat. Es manual y no es
  idempotente.

El flujo habitual es:

`route -> middleware/DTO -> controller -> use case -> repository -> datasource -> Prisma`

Las rutas ensamblan las dependencias. Al crear una funcionalidad, actualiza los
`init.ts` (barrel exports) correspondientes y registra el router en
`src/presentation/routes.ts` cuando sea necesario.

## Preparación local

1. Instala dependencias con `npm install`. En instalaciones limpias y
   reproducibles puede usarse `npm ci`; conserva `package-lock.json`.
2. Copia `.env.example` a `.env` y completa los valores localmente. Nunca
   publiques `.env`, tokens, contraseñas ni claves de servicios.
3. Inicia PostgreSQL con `docker compose up -d`.
4. Aplica las migraciones existentes con `npx prisma migrate dev` y genera el
   cliente con `npx prisma generate`.
5. En una base nueva, carga `inicializacion.pgsql` una sola vez para crear los
   roles requeridos.
6. Inicia el servidor con `npm run dev`; el health check es `GET /health`.

`POSTGRES_URL` es la URL utilizada tanto por `prisma.config.ts` como por el
adaptador de la aplicación. `DATABASE_URL` aparece en `.env.example`, pero el
código actual no la consume.

No ejecutes migraciones ni el script de inicialización contra una base remota o
compartida sin autorización explícita.

En PowerShell con ejecución de scripts restringida, usa `npm.cmd` y `npx.cmd`
en lugar de los wrappers `.ps1`.

## Comandos de trabajo

- Desarrollo: `npm run dev`
- Compilación y type-check: `npm run build`
- Producción local: `npm start`
- Pruebas: `npm test -- --runInBand`
- Pruebas en watch: `npm run test:watch`
- Cobertura: `npm run test:coverage`
- Validar Prisma: `npx prisma validate`
- Regenerar cliente Prisma: `npx prisma generate`

No existe un script de lint o format configurado. No afirmes que `npm run lint`
es parte de la validación y no introduzcas una herramienta de estilo sólo para
resolver una tarea no relacionada.

## Convenciones de código

- Mantén TypeScript en modo `strict` y evita `any` nuevo cuando pueda expresarse
  un tipo concreto.
- El proyecto usa ESM con resolución `NodeNext`: las importaciones relativas de
  archivos TypeScript deben conservar la extensión de runtime `.js`.
- Usa `import type` cuando el símbolo sólo exista a nivel de tipos.
- Sigue el estilo del archivo vecino. El repositorio no aplica automáticamente
  una convención única de comillas o formato; evita cambios cosméticos masivos.
- Respeta los nombres de dominio y contratos públicos en español. No traduzcas
  rutas, campos o clases existentes como parte de un cambio incidental.
- Valida entrada no confiable en schemas/DTOs antes de ejecutar lógica de
  negocio. Devuelve errores esperados mediante `CustomError` y registra errores
  inesperados con `Logger` sin exponer detalles internos al cliente.
- Conserva la separación de responsabilidades: HTTP en `presentation`, reglas
  de negocio y contratos en `domain`, y Prisma/servicios concretos en
  `infrastructure` o `config`. No hagas una refactorización transversal de capas
  salvo que sea el objetivo de la tarea.
- Para rutas protegidas, toma la identidad desde el payload validado por
  `AuthMiddleware`; no confíes en un `idUsuario` enviado por el cliente. Toda
  consulta de recursos privados debe filtrar también por usuario propietario.

## Prisma y cambios de datos

- Modifica primero `prisma/schema.prisma` y valida con `npx prisma validate`.
- Crea una migración nueva y descriptiva para cambios de esquema, por ejemplo
  `npx prisma migrate dev --name agrega_campo_x`; no reutilices `--name init`.
- Después de cambiar el schema, ejecuta `npx prisma generate` y `npm run build`.
- Incluye el schema y la migración en el mismo cambio. No incluyas
  `src/generated/prisma/`.
- Preserva relaciones, reglas `onDelete` y nombres `@@map` salvo que el cambio
  solicite explícitamente alterar el contrato de datos.

## Pruebas y validación

- Usa Jest con `@jest/globals`; las pruebas viven en `tests/` o usan el sufijo
  `.test.ts`.
- Agrega pruebas enfocadas para caminos exitosos, validaciones, autorización y
  errores relevantes del comportamiento modificado.
- Evita llamadas reales a PostgreSQL, Gemini, Cloudinary y Nodemailer en pruebas
  unitarias; inyecta o simula sus contratos.
- Si modificas uploads, asegura la eliminación de archivos temporales de
  `uploads/` tanto en éxito como en error.
- Validación mínima antes de entregar: `npm run build` y
  `npm test -- --runInBand`.
- Si cambia Prisma, añade `npx prisma validate` y `npx prisma generate` a la
  validación. Si cambia una ruta, verifica también su status code, cuerpo y
  requisitos de autenticación.
- Informa claramente cualquier comando no ejecutado y la razón; no presentes
  una validación parcial como completa.

## Seguridad y datos sensibles

- Nunca leas, imprimas, registres ni confirmes valores concretos de `.env`.
- No registres passwords, JWT, reset tokens, contenido clínico privado ni claves
  de proveedores.
- No debilites hashing, expiración de tokens, validación JWT, comprobaciones de
  propiedad ni la instrucción clínica de `src/config/system_instruction.ts` sin
  una petición explícita y pruebas acordes al riesgo.
- No versionar artefactos locales: `dist/`, `coverage/`, `logs/`, `uploads/`,
  `postgres/`, `.env` ni `src/generated/prisma/`.

## Commits y entrega

- No crees commits, branches ni pull requests a menos que el usuario lo pida.
- Si se solicita un commit, usa un mensaje breve y descriptivo coherente con el
  historial del repositorio; no hay una convención de Conventional Commits
  configurada.
- Resume los archivos cambiados, las decisiones relevantes y los comandos de
  validación ejecutados.
