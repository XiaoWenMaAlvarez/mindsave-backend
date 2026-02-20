/*
  Warnings:

  - Made the column `grupoEmociones1Id` on table `registro_estado_animo` required. This step will fail if there are existing NULL values in that column.
  - Made the column `grupoEmociones2Id` on table `registro_estado_animo` required. This step will fail if there are existing NULL values in that column.
  - Made the column `grupoEmociones3Id` on table `registro_estado_animo` required. This step will fail if there are existing NULL values in that column.
  - Made the column `grupoEmociones4Id` on table `registro_estado_animo` required. This step will fail if there are existing NULL values in that column.
  - Made the column `grupoEmociones5Id` on table `registro_estado_animo` required. This step will fail if there are existing NULL values in that column.
  - Made the column `grupoEmociones6Id` on table `registro_estado_animo` required. This step will fail if there are existing NULL values in that column.
  - Made the column `grupoEmociones7Id` on table `registro_estado_animo` required. This step will fail if there are existing NULL values in that column.
  - Made the column `grupoEmociones8Id` on table `registro_estado_animo` required. This step will fail if there are existing NULL values in that column.
  - Made the column `grupoEmociones9Id` on table `registro_estado_animo` required. This step will fail if there are existing NULL values in that column.
  - Made the column `grupoEmocionesPersonalizadasId` on table `registro_estado_animo` required. This step will fail if there are existing NULL values in that column.

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

-- AlterTable
ALTER TABLE "registro_estado_animo" ALTER COLUMN "grupoEmociones1Id" SET NOT NULL,
ALTER COLUMN "grupoEmociones2Id" SET NOT NULL,
ALTER COLUMN "grupoEmociones3Id" SET NOT NULL,
ALTER COLUMN "grupoEmociones4Id" SET NOT NULL,
ALTER COLUMN "grupoEmociones5Id" SET NOT NULL,
ALTER COLUMN "grupoEmociones6Id" SET NOT NULL,
ALTER COLUMN "grupoEmociones7Id" SET NOT NULL,
ALTER COLUMN "grupoEmociones8Id" SET NOT NULL,
ALTER COLUMN "grupoEmociones9Id" SET NOT NULL,
ALTER COLUMN "grupoEmocionesPersonalizadasId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "registro_estado_animo" ADD CONSTRAINT "registro_estado_animo_grupoEmociones1Id_fkey" FOREIGN KEY ("grupoEmociones1Id") REFERENCES "grupoEmociones1"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registro_estado_animo" ADD CONSTRAINT "registro_estado_animo_grupoEmociones2Id_fkey" FOREIGN KEY ("grupoEmociones2Id") REFERENCES "grupoEmociones2"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registro_estado_animo" ADD CONSTRAINT "registro_estado_animo_grupoEmociones3Id_fkey" FOREIGN KEY ("grupoEmociones3Id") REFERENCES "grupoEmociones3"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registro_estado_animo" ADD CONSTRAINT "registro_estado_animo_grupoEmociones4Id_fkey" FOREIGN KEY ("grupoEmociones4Id") REFERENCES "grupoEmociones4"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registro_estado_animo" ADD CONSTRAINT "registro_estado_animo_grupoEmociones5Id_fkey" FOREIGN KEY ("grupoEmociones5Id") REFERENCES "grupoEmociones5"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registro_estado_animo" ADD CONSTRAINT "registro_estado_animo_grupoEmociones6Id_fkey" FOREIGN KEY ("grupoEmociones6Id") REFERENCES "grupoEmociones6"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registro_estado_animo" ADD CONSTRAINT "registro_estado_animo_grupoEmociones7Id_fkey" FOREIGN KEY ("grupoEmociones7Id") REFERENCES "grupoEmociones7"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registro_estado_animo" ADD CONSTRAINT "registro_estado_animo_grupoEmociones8Id_fkey" FOREIGN KEY ("grupoEmociones8Id") REFERENCES "grupoEmociones8"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registro_estado_animo" ADD CONSTRAINT "registro_estado_animo_grupoEmociones9Id_fkey" FOREIGN KEY ("grupoEmociones9Id") REFERENCES "grupoEmociones9"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registro_estado_animo" ADD CONSTRAINT "registro_estado_animo_grupoEmocionesPersonalizadasId_fkey" FOREIGN KEY ("grupoEmocionesPersonalizadasId") REFERENCES "grupoEmocionesPersonalizadas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
