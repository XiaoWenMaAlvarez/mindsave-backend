
# Base de datos
- Abrir la terminal y dirigirse a la ruta del backend

- Abrir Docker

- Iniciar el contenedor con la base de datos PostgreSQL
> docker compose up -d

# Backend
- Instalar las dependencias de Node.js
> npm i

- Crear tablas en la base de datos
  > npx prisma migrate dev --name init
  > npx prisma generate

- Insertar los registros por defecto (inicializacion.pgsql)

- Ejecutar el servidor 
  > npm run dev

- Probar los endpoints con Postman

# Frontend con Flutter
- Levantar url pública 
  > ngrok http 3000

- Pegar la url pública en el .env de Flutter

- Compilar Flutter

- Abrir la app