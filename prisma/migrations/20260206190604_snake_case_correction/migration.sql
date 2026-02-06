/*
  Warnings:

  - You are about to drop the `Depresion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ImpulsoSuicida` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SentimientosAnsiedadEmocional` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SentimientosAnsiedadFisica` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TestBreveEstadoDeAnimo` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "TestBreveEstadoDeAnimo" DROP CONSTRAINT "TestBreveEstadoDeAnimo_ansiedadEmocionalId_fkey";

-- DropForeignKey
ALTER TABLE "TestBreveEstadoDeAnimo" DROP CONSTRAINT "TestBreveEstadoDeAnimo_ansiedadFisicaId_fkey";

-- DropForeignKey
ALTER TABLE "TestBreveEstadoDeAnimo" DROP CONSTRAINT "TestBreveEstadoDeAnimo_depresionId_fkey";

-- DropForeignKey
ALTER TABLE "TestBreveEstadoDeAnimo" DROP CONSTRAINT "TestBreveEstadoDeAnimo_impulsoSuicidaId_fkey";

-- DropTable
DROP TABLE "Depresion";

-- DropTable
DROP TABLE "ImpulsoSuicida";

-- DropTable
DROP TABLE "SentimientosAnsiedadEmocional";

-- DropTable
DROP TABLE "SentimientosAnsiedadFisica";

-- DropTable
DROP TABLE "TestBreveEstadoDeAnimo";

-- CreateTable
CREATE TABLE "depresion" (
    "id" SERIAL NOT NULL,
    "tristeza" INTEGER NOT NULL,
    "desesperanza" INTEGER NOT NULL,
    "bajaAutoestima" INTEGER NOT NULL,
    "faltaDeValor" INTEGER NOT NULL,
    "perdidaDeSatisfaccion" INTEGER NOT NULL,

    CONSTRAINT "depresion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "impulso_suicida" (
    "id" SERIAL NOT NULL,
    "pensamientosSuicidas" INTEGER NOT NULL,
    "deseosDeMorir" INTEGER NOT NULL,

    CONSTRAINT "impulso_suicida_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sentimientos_ansiedad_fisica" (
    "id" SERIAL NOT NULL,
    "palpitaciones" INTEGER NOT NULL,
    "sudoracion" INTEGER NOT NULL,
    "temblores" INTEGER NOT NULL,
    "dificultadRespirar" INTEGER NOT NULL,
    "ahogo" INTEGER NOT NULL,
    "dolorPecho" INTEGER NOT NULL,
    "nauseas" INTEGER NOT NULL,
    "mareos" INTEGER NOT NULL,
    "sensacionIrrealidad" INTEGER NOT NULL,
    "inestabilidadHormigueos" INTEGER NOT NULL,

    CONSTRAINT "sentimientos_ansiedad_fisica_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sentimientos_ansiedad_emocional" (
    "id" SERIAL NOT NULL,
    "angustiado" INTEGER NOT NULL,
    "nervioso" INTEGER NOT NULL,
    "preocupado" INTEGER NOT NULL,
    "asustado" INTEGER NOT NULL,
    "tenso" INTEGER NOT NULL,

    CONSTRAINT "sentimientos_ansiedad_emocional_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test_breve_estado_de_animo" (
    "id" TEXT NOT NULL,
    "depresionId" INTEGER NOT NULL,
    "impulsoSuicidaId" INTEGER NOT NULL,
    "ansiedadFisicaId" INTEGER NOT NULL,
    "ansiedadEmocionalId" INTEGER NOT NULL,
    "idUsuario" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notas" TEXT,

    CONSTRAINT "test_breve_estado_de_animo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "test_breve_estado_de_animo_depresionId_key" ON "test_breve_estado_de_animo"("depresionId");

-- CreateIndex
CREATE UNIQUE INDEX "test_breve_estado_de_animo_impulsoSuicidaId_key" ON "test_breve_estado_de_animo"("impulsoSuicidaId");

-- CreateIndex
CREATE UNIQUE INDEX "test_breve_estado_de_animo_ansiedadFisicaId_key" ON "test_breve_estado_de_animo"("ansiedadFisicaId");

-- CreateIndex
CREATE UNIQUE INDEX "test_breve_estado_de_animo_ansiedadEmocionalId_key" ON "test_breve_estado_de_animo"("ansiedadEmocionalId");

-- AddForeignKey
ALTER TABLE "test_breve_estado_de_animo" ADD CONSTRAINT "test_breve_estado_de_animo_depresionId_fkey" FOREIGN KEY ("depresionId") REFERENCES "depresion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_breve_estado_de_animo" ADD CONSTRAINT "test_breve_estado_de_animo_impulsoSuicidaId_fkey" FOREIGN KEY ("impulsoSuicidaId") REFERENCES "impulso_suicida"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_breve_estado_de_animo" ADD CONSTRAINT "test_breve_estado_de_animo_ansiedadFisicaId_fkey" FOREIGN KEY ("ansiedadFisicaId") REFERENCES "sentimientos_ansiedad_fisica"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_breve_estado_de_animo" ADD CONSTRAINT "test_breve_estado_de_animo_ansiedadEmocionalId_fkey" FOREIGN KEY ("ansiedadEmocionalId") REFERENCES "sentimientos_ansiedad_emocional"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
