/*
  Warnings:

  - You are about to drop the column `grupoEmociones1Id` on the `registro_estado_animo` table. All the data in the column will be lost.
  - You are about to drop the column `grupoEmociones2Id` on the `registro_estado_animo` table. All the data in the column will be lost.
  - You are about to drop the column `grupoEmociones3Id` on the `registro_estado_animo` table. All the data in the column will be lost.
  - You are about to drop the column `grupoEmociones4Id` on the `registro_estado_animo` table. All the data in the column will be lost.
  - You are about to drop the column `grupoEmociones5Id` on the `registro_estado_animo` table. All the data in the column will be lost.
  - You are about to drop the column `grupoEmociones6Id` on the `registro_estado_animo` table. All the data in the column will be lost.
  - You are about to drop the column `grupoEmociones7Id` on the `registro_estado_animo` table. All the data in the column will be lost.
  - You are about to drop the column `grupoEmociones8Id` on the `registro_estado_animo` table. All the data in the column will be lost.
  - You are about to drop the column `grupoEmociones9Id` on the `registro_estado_animo` table. All the data in the column will be lost.
  - You are about to drop the column `grupoEmocionesPersonalizadasId` on the `registro_estado_animo` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[registroEstadoAnimoId]` on the table `grupoEmociones1` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[registroEstadoAnimoId]` on the table `grupoEmociones2` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[registroEstadoAnimoId]` on the table `grupoEmociones3` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[registroEstadoAnimoId]` on the table `grupoEmociones4` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[registroEstadoAnimoId]` on the table `grupoEmociones5` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[registroEstadoAnimoId]` on the table `grupoEmociones6` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[registroEstadoAnimoId]` on the table `grupoEmociones7` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[registroEstadoAnimoId]` on the table `grupoEmociones8` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[registroEstadoAnimoId]` on the table `grupoEmociones9` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[registroEstadoAnimoId]` on the table `grupoEmocionesPersonalizadas` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `registroEstadoAnimoId` to the `grupoEmociones1` table without a default value. This is not possible if the table is not empty.
  - Added the required column `registroEstadoAnimoId` to the `grupoEmociones2` table without a default value. This is not possible if the table is not empty.
  - Added the required column `registroEstadoAnimoId` to the `grupoEmociones3` table without a default value. This is not possible if the table is not empty.
  - Added the required column `registroEstadoAnimoId` to the `grupoEmociones4` table without a default value. This is not possible if the table is not empty.
  - Added the required column `registroEstadoAnimoId` to the `grupoEmociones5` table without a default value. This is not possible if the table is not empty.
  - Added the required column `registroEstadoAnimoId` to the `grupoEmociones6` table without a default value. This is not possible if the table is not empty.
  - Added the required column `registroEstadoAnimoId` to the `grupoEmociones7` table without a default value. This is not possible if the table is not empty.
  - Added the required column `registroEstadoAnimoId` to the `grupoEmociones8` table without a default value. This is not possible if the table is not empty.
  - Added the required column `registroEstadoAnimoId` to the `grupoEmociones9` table without a default value. This is not possible if the table is not empty.
  - Added the required column `registroEstadoAnimoId` to the `grupoEmocionesPersonalizadas` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "registro_estado_animo" DROP CONSTRAINT "registro_estado_animo_grupoEmociones1Id_fkey";

-- DropForeignKey
ALTER TABLE "registro_estado_animo" DROP CONSTRAINT "registro_estado_animo_grupoEmociones2Id_fkey";

-- DropForeignKey
ALTER TABLE "registro_estado_animo" DROP CONSTRAINT "registro_estado_animo_grupoEmociones3Id_fkey";

-- DropForeignKey
ALTER TABLE "registro_estado_animo" DROP CONSTRAINT "registro_estado_animo_grupoEmociones4Id_fkey";

-- DropForeignKey
ALTER TABLE "registro_estado_animo" DROP CONSTRAINT "registro_estado_animo_grupoEmociones5Id_fkey";

-- DropForeignKey
ALTER TABLE "registro_estado_animo" DROP CONSTRAINT "registro_estado_animo_grupoEmociones6Id_fkey";

-- DropForeignKey
ALTER TABLE "registro_estado_animo" DROP CONSTRAINT "registro_estado_animo_grupoEmociones7Id_fkey";

-- DropForeignKey
ALTER TABLE "registro_estado_animo" DROP CONSTRAINT "registro_estado_animo_grupoEmociones8Id_fkey";

-- DropForeignKey
ALTER TABLE "registro_estado_animo" DROP CONSTRAINT "registro_estado_animo_grupoEmociones9Id_fkey";

-- DropForeignKey
ALTER TABLE "registro_estado_animo" DROP CONSTRAINT "registro_estado_animo_grupoEmocionesPersonalizadasId_fkey";

-- DropIndex
DROP INDEX "registro_estado_animo_grupoEmociones1Id_key";

-- DropIndex
DROP INDEX "registro_estado_animo_grupoEmociones2Id_key";

-- DropIndex
DROP INDEX "registro_estado_animo_grupoEmociones3Id_key";

-- DropIndex
DROP INDEX "registro_estado_animo_grupoEmociones4Id_key";

-- DropIndex
DROP INDEX "registro_estado_animo_grupoEmociones5Id_key";

-- DropIndex
DROP INDEX "registro_estado_animo_grupoEmociones6Id_key";

-- DropIndex
DROP INDEX "registro_estado_animo_grupoEmociones7Id_key";

-- DropIndex
DROP INDEX "registro_estado_animo_grupoEmociones8Id_key";

-- DropIndex
DROP INDEX "registro_estado_animo_grupoEmociones9Id_key";

-- DropIndex
DROP INDEX "registro_estado_animo_grupoEmocionesPersonalizadasId_key";

-- AlterTable
ALTER TABLE "grupoEmociones1" ADD COLUMN     "registroEstadoAnimoId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "grupoEmociones2" ADD COLUMN     "registroEstadoAnimoId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "grupoEmociones3" ADD COLUMN     "registroEstadoAnimoId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "grupoEmociones4" ADD COLUMN     "registroEstadoAnimoId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "grupoEmociones5" ADD COLUMN     "registroEstadoAnimoId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "grupoEmociones6" ADD COLUMN     "registroEstadoAnimoId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "grupoEmociones7" ADD COLUMN     "registroEstadoAnimoId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "grupoEmociones8" ADD COLUMN     "registroEstadoAnimoId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "grupoEmociones9" ADD COLUMN     "registroEstadoAnimoId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "grupoEmocionesPersonalizadas" ADD COLUMN     "registroEstadoAnimoId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "registro_estado_animo" DROP COLUMN "grupoEmociones1Id",
DROP COLUMN "grupoEmociones2Id",
DROP COLUMN "grupoEmociones3Id",
DROP COLUMN "grupoEmociones4Id",
DROP COLUMN "grupoEmociones5Id",
DROP COLUMN "grupoEmociones6Id",
DROP COLUMN "grupoEmociones7Id",
DROP COLUMN "grupoEmociones8Id",
DROP COLUMN "grupoEmociones9Id",
DROP COLUMN "grupoEmocionesPersonalizadasId";

-- CreateIndex
CREATE UNIQUE INDEX "grupoEmociones1_registroEstadoAnimoId_key" ON "grupoEmociones1"("registroEstadoAnimoId");

-- CreateIndex
CREATE UNIQUE INDEX "grupoEmociones2_registroEstadoAnimoId_key" ON "grupoEmociones2"("registroEstadoAnimoId");

-- CreateIndex
CREATE UNIQUE INDEX "grupoEmociones3_registroEstadoAnimoId_key" ON "grupoEmociones3"("registroEstadoAnimoId");

-- CreateIndex
CREATE UNIQUE INDEX "grupoEmociones4_registroEstadoAnimoId_key" ON "grupoEmociones4"("registroEstadoAnimoId");

-- CreateIndex
CREATE UNIQUE INDEX "grupoEmociones5_registroEstadoAnimoId_key" ON "grupoEmociones5"("registroEstadoAnimoId");

-- CreateIndex
CREATE UNIQUE INDEX "grupoEmociones6_registroEstadoAnimoId_key" ON "grupoEmociones6"("registroEstadoAnimoId");

-- CreateIndex
CREATE UNIQUE INDEX "grupoEmociones7_registroEstadoAnimoId_key" ON "grupoEmociones7"("registroEstadoAnimoId");

-- CreateIndex
CREATE UNIQUE INDEX "grupoEmociones8_registroEstadoAnimoId_key" ON "grupoEmociones8"("registroEstadoAnimoId");

-- CreateIndex
CREATE UNIQUE INDEX "grupoEmociones9_registroEstadoAnimoId_key" ON "grupoEmociones9"("registroEstadoAnimoId");

-- CreateIndex
CREATE UNIQUE INDEX "grupoEmocionesPersonalizadas_registroEstadoAnimoId_key" ON "grupoEmocionesPersonalizadas"("registroEstadoAnimoId");

-- AddForeignKey
ALTER TABLE "grupoEmociones1" ADD CONSTRAINT "grupoEmociones1_registroEstadoAnimoId_fkey" FOREIGN KEY ("registroEstadoAnimoId") REFERENCES "registro_estado_animo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grupoEmociones2" ADD CONSTRAINT "grupoEmociones2_registroEstadoAnimoId_fkey" FOREIGN KEY ("registroEstadoAnimoId") REFERENCES "registro_estado_animo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grupoEmociones3" ADD CONSTRAINT "grupoEmociones3_registroEstadoAnimoId_fkey" FOREIGN KEY ("registroEstadoAnimoId") REFERENCES "registro_estado_animo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grupoEmociones4" ADD CONSTRAINT "grupoEmociones4_registroEstadoAnimoId_fkey" FOREIGN KEY ("registroEstadoAnimoId") REFERENCES "registro_estado_animo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grupoEmociones5" ADD CONSTRAINT "grupoEmociones5_registroEstadoAnimoId_fkey" FOREIGN KEY ("registroEstadoAnimoId") REFERENCES "registro_estado_animo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grupoEmociones6" ADD CONSTRAINT "grupoEmociones6_registroEstadoAnimoId_fkey" FOREIGN KEY ("registroEstadoAnimoId") REFERENCES "registro_estado_animo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grupoEmociones7" ADD CONSTRAINT "grupoEmociones7_registroEstadoAnimoId_fkey" FOREIGN KEY ("registroEstadoAnimoId") REFERENCES "registro_estado_animo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grupoEmociones8" ADD CONSTRAINT "grupoEmociones8_registroEstadoAnimoId_fkey" FOREIGN KEY ("registroEstadoAnimoId") REFERENCES "registro_estado_animo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grupoEmociones9" ADD CONSTRAINT "grupoEmociones9_registroEstadoAnimoId_fkey" FOREIGN KEY ("registroEstadoAnimoId") REFERENCES "registro_estado_animo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grupoEmocionesPersonalizadas" ADD CONSTRAINT "grupoEmocionesPersonalizadas_registroEstadoAnimoId_fkey" FOREIGN KEY ("registroEstadoAnimoId") REFERENCES "registro_estado_animo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
