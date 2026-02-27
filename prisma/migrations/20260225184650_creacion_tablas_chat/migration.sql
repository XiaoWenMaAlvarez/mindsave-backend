-- CreateEnum
CREATE TYPE "TipoChatRol" AS ENUM ('model', 'user', 'system');

-- DropForeignKey
ALTER TABLE "registro_estado_animo" DROP CONSTRAINT "registro_estado_animo_idUsuario_fkey";

-- CreateTable
CREATE TABLE "chat" (
    "id" TEXT NOT NULL,
    "idUsuario" TEXT NOT NULL,

    CONSTRAINT "chat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_role" (
    "id" SERIAL NOT NULL,
    "description" "TipoChatRol" NOT NULL,

    CONSTRAINT "chat_role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mensaje" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "roleId" INTEGER NOT NULL,
    "chatId" TEXT NOT NULL,

    CONSTRAINT "mensaje_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "archivo" (
    "id" TEXT NOT NULL,
    "fileUri" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "mensajeId" TEXT NOT NULL,

    CONSTRAINT "archivo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "chat_role_description_key" ON "chat_role"("description");

-- AddForeignKey
ALTER TABLE "registro_estado_animo" ADD CONSTRAINT "registro_estado_animo_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat" ADD CONSTRAINT "chat_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mensaje" ADD CONSTRAINT "mensaje_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "chat_role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mensaje" ADD CONSTRAINT "mensaje_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "archivo" ADD CONSTRAINT "archivo_mensajeId_fkey" FOREIGN KEY ("mensajeId") REFERENCES "mensaje"("id") ON DELETE CASCADE ON UPDATE CASCADE;
