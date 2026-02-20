/*
  Warnings:

  - You are about to drop the column `ansiedadEmocionalId` on the `test_breve_estado_de_animo` table. All the data in the column will be lost.
  - You are about to drop the column `ansiedadFisicaId` on the `test_breve_estado_de_animo` table. All the data in the column will be lost.
  - You are about to drop the column `depresionId` on the `test_breve_estado_de_animo` table. All the data in the column will be lost.
  - You are about to drop the column `impulsoSuicidaId` on the `test_breve_estado_de_animo` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[testBreveId]` on the table `depresion` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[testBreveId]` on the table `impulso_suicida` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[testBreveId]` on the table `sentimientos_ansiedad_emocional` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[testBreveId]` on the table `sentimientos_ansiedad_fisica` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `testBreveId` to the `depresion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `testBreveId` to the `impulso_suicida` table without a default value. This is not possible if the table is not empty.
  - Added the required column `testBreveId` to the `sentimientos_ansiedad_emocional` table without a default value. This is not possible if the table is not empty.
  - Added the required column `testBreveId` to the `sentimientos_ansiedad_fisica` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "test_breve_estado_de_animo" DROP CONSTRAINT "test_breve_estado_de_animo_ansiedadEmocionalId_fkey";

-- DropForeignKey
ALTER TABLE "test_breve_estado_de_animo" DROP CONSTRAINT "test_breve_estado_de_animo_ansiedadFisicaId_fkey";

-- DropForeignKey
ALTER TABLE "test_breve_estado_de_animo" DROP CONSTRAINT "test_breve_estado_de_animo_depresionId_fkey";

-- DropForeignKey
ALTER TABLE "test_breve_estado_de_animo" DROP CONSTRAINT "test_breve_estado_de_animo_idUsuario_fkey";

-- DropForeignKey
ALTER TABLE "test_breve_estado_de_animo" DROP CONSTRAINT "test_breve_estado_de_animo_impulsoSuicidaId_fkey";

-- DropIndex
DROP INDEX "test_breve_estado_de_animo_ansiedadEmocionalId_key";

-- DropIndex
DROP INDEX "test_breve_estado_de_animo_ansiedadFisicaId_key";

-- DropIndex
DROP INDEX "test_breve_estado_de_animo_depresionId_key";

-- DropIndex
DROP INDEX "test_breve_estado_de_animo_impulsoSuicidaId_key";

-- AlterTable
ALTER TABLE "depresion" ADD COLUMN     "testBreveId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "impulso_suicida" ADD COLUMN     "testBreveId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "sentimientos_ansiedad_emocional" ADD COLUMN     "testBreveId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "sentimientos_ansiedad_fisica" ADD COLUMN     "testBreveId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "test_breve_estado_de_animo" DROP COLUMN "ansiedadEmocionalId",
DROP COLUMN "ansiedadFisicaId",
DROP COLUMN "depresionId",
DROP COLUMN "impulsoSuicidaId";

-- CreateIndex
CREATE UNIQUE INDEX "depresion_testBreveId_key" ON "depresion"("testBreveId");

-- CreateIndex
CREATE UNIQUE INDEX "impulso_suicida_testBreveId_key" ON "impulso_suicida"("testBreveId");

-- CreateIndex
CREATE UNIQUE INDEX "sentimientos_ansiedad_emocional_testBreveId_key" ON "sentimientos_ansiedad_emocional"("testBreveId");

-- CreateIndex
CREATE UNIQUE INDEX "sentimientos_ansiedad_fisica_testBreveId_key" ON "sentimientos_ansiedad_fisica"("testBreveId");

-- AddForeignKey
ALTER TABLE "depresion" ADD CONSTRAINT "depresion_testBreveId_fkey" FOREIGN KEY ("testBreveId") REFERENCES "test_breve_estado_de_animo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "impulso_suicida" ADD CONSTRAINT "impulso_suicida_testBreveId_fkey" FOREIGN KEY ("testBreveId") REFERENCES "test_breve_estado_de_animo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sentimientos_ansiedad_fisica" ADD CONSTRAINT "sentimientos_ansiedad_fisica_testBreveId_fkey" FOREIGN KEY ("testBreveId") REFERENCES "test_breve_estado_de_animo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sentimientos_ansiedad_emocional" ADD CONSTRAINT "sentimientos_ansiedad_emocional_testBreveId_fkey" FOREIGN KEY ("testBreveId") REFERENCES "test_breve_estado_de_animo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_breve_estado_de_animo" ADD CONSTRAINT "test_breve_estado_de_animo_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
