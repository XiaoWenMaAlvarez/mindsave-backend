/*
  Warnings:

  - You are about to drop the `depresion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `impulso_suicida` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `role` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `sentimientos_ansiedad_emocional` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `sentimientos_ansiedad_fisica` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `test_breve_estado_de_animo` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user` table. If the table is not empty, all the data it contains will be lost.

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

-- DropForeignKey
ALTER TABLE "user" DROP CONSTRAINT "user_roleId_fkey";

-- DropTable
DROP TABLE "depresion";

-- DropTable
DROP TABLE "impulso_suicida";

-- DropTable
DROP TABLE "role";

-- DropTable
DROP TABLE "sentimientos_ansiedad_emocional";

-- DropTable
DROP TABLE "sentimientos_ansiedad_fisica";

-- DropTable
DROP TABLE "test_breve_estado_de_animo";

-- DropTable
DROP TABLE "user";

-- DropEnum
DROP TYPE "TipoRol";
