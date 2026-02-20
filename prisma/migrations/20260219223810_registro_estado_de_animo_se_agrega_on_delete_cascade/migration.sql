/*
  Warnings:

  - You are about to drop the column `distorsionId` on the `pensamiento` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[pensamientoId]` on the table `distorsion` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `pensamientoId` to the `distorsion` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "emocionPersonalizada" DROP CONSTRAINT "emocionPersonalizada_grupoEmocionesPersonalizadasId_fkey";

-- DropForeignKey
ALTER TABLE "pensamiento" DROP CONSTRAINT "pensamiento_distorsionId_fkey";

-- DropForeignKey
ALTER TABLE "pensamiento" DROP CONSTRAINT "pensamiento_registroEstadoAnimoId_fkey";

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
DROP INDEX "pensamiento_distorsionId_key";

-- AlterTable
ALTER TABLE "distorsion" ADD COLUMN     "pensamientoId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "pensamiento" DROP COLUMN "distorsionId";

-- CreateIndex
CREATE UNIQUE INDEX "distorsion_pensamientoId_key" ON "distorsion"("pensamientoId");

-- AddForeignKey
ALTER TABLE "emocionPersonalizada" ADD CONSTRAINT "emocionPersonalizada_grupoEmocionesPersonalizadasId_fkey" FOREIGN KEY ("grupoEmocionesPersonalizadasId") REFERENCES "grupoEmocionesPersonalizadas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "distorsion" ADD CONSTRAINT "distorsion_pensamientoId_fkey" FOREIGN KEY ("pensamientoId") REFERENCES "pensamiento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pensamiento" ADD CONSTRAINT "pensamiento_registroEstadoAnimoId_fkey" FOREIGN KEY ("registroEstadoAnimoId") REFERENCES "registro_estado_animo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registro_estado_animo" ADD CONSTRAINT "registro_estado_animo_grupoEmociones1Id_fkey" FOREIGN KEY ("grupoEmociones1Id") REFERENCES "grupoEmociones1"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registro_estado_animo" ADD CONSTRAINT "registro_estado_animo_grupoEmociones2Id_fkey" FOREIGN KEY ("grupoEmociones2Id") REFERENCES "grupoEmociones2"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registro_estado_animo" ADD CONSTRAINT "registro_estado_animo_grupoEmociones3Id_fkey" FOREIGN KEY ("grupoEmociones3Id") REFERENCES "grupoEmociones3"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registro_estado_animo" ADD CONSTRAINT "registro_estado_animo_grupoEmociones4Id_fkey" FOREIGN KEY ("grupoEmociones4Id") REFERENCES "grupoEmociones4"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registro_estado_animo" ADD CONSTRAINT "registro_estado_animo_grupoEmociones5Id_fkey" FOREIGN KEY ("grupoEmociones5Id") REFERENCES "grupoEmociones5"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registro_estado_animo" ADD CONSTRAINT "registro_estado_animo_grupoEmociones6Id_fkey" FOREIGN KEY ("grupoEmociones6Id") REFERENCES "grupoEmociones6"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registro_estado_animo" ADD CONSTRAINT "registro_estado_animo_grupoEmociones7Id_fkey" FOREIGN KEY ("grupoEmociones7Id") REFERENCES "grupoEmociones7"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registro_estado_animo" ADD CONSTRAINT "registro_estado_animo_grupoEmociones8Id_fkey" FOREIGN KEY ("grupoEmociones8Id") REFERENCES "grupoEmociones8"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registro_estado_animo" ADD CONSTRAINT "registro_estado_animo_grupoEmociones9Id_fkey" FOREIGN KEY ("grupoEmociones9Id") REFERENCES "grupoEmociones9"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registro_estado_animo" ADD CONSTRAINT "registro_estado_animo_grupoEmocionesPersonalizadasId_fkey" FOREIGN KEY ("grupoEmocionesPersonalizadasId") REFERENCES "grupoEmocionesPersonalizadas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
