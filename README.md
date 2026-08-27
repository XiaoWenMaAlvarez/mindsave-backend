
# Base de datos en Neon

El proyecto usa dos conexiones de la misma rama de Neon:

- `DATABASE_URL`: conexión pooled para la API.
- `DATABASE_URL_UNPOOLED`: conexión directa para Prisma CLI, migraciones y seed.

Después de autenticar el CLI de Neon, enlaza el workspace y descarga las variables:

```powershell
neon link --org-id org-rapid-credit-75699775 --project-id billowing-dew-21364642 --branch production --yes
neon env pull --service postgres --file .env
npx.cmd prisma migrate deploy
npx.cmd prisma generate
npx.cmd prisma db seed
```

No ejecutes migraciones ni seed contra otra rama o proyecto sin verificar antes el contexto con `neon status`.

# Base de datos local

- Abrir la terminal y dirigirse a la ruta del backend.

- Abrir Docker.

- Iniciar el contenedor con la base de datos PostgreSQL:

```powershell
docker compose up -d
```

# Backend
- Instalar las dependencias reproducibles de Node.js:

```powershell
npm.cmd ci
```

- Aplicar las migraciones existentes y generar el cliente:

```powershell
npx.cmd prisma migrate dev
npx.cmd prisma generate
```

- Insertar los registros por defecto con `npx.cmd prisma db seed`.

- Ejecutar el servidor:

```powershell
npm.cmd run dev
```

- Probar los endpoints con Postman

# Frontend con Flutter
- Levantar url pública 
  > ngrok http 3000

- Pegar la url pública en el .env de Flutter

- Compilar Flutter

- Abrir la app
