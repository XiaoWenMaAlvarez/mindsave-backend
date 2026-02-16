-- CreateEnum
CREATE TYPE "TipoRol" AS ENUM ('PROFESIONAL_ROL', 'USER_ROL');

-- CreateTable
CREATE TABLE "role" (
    "id" SERIAL NOT NULL,
    "description" "TipoRol" NOT NULL,

    CONSTRAINT "role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "password" TEXT NOT NULL,
    "roleId" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "resetToken" TEXT,
    "resetTokenExpiration" TIMESTAMP(3),

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grupoEmociones1" (
    "id" SERIAL NOT NULL,
    "triste" BOOLEAN NOT NULL DEFAULT false,
    "melancolico" BOOLEAN NOT NULL DEFAULT false,
    "deprimido" BOOLEAN NOT NULL DEFAULT false,
    "decaido" BOOLEAN NOT NULL DEFAULT false,
    "infeliz" BOOLEAN NOT NULL DEFAULT false,
    "porcentajeCreenciaAntes" INTEGER NOT NULL,
    "porcentajeCreenciaDespues" INTEGER,

    CONSTRAINT "grupoEmociones1_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grupoEmociones2" (
    "id" SERIAL NOT NULL,
    "angustiado" BOOLEAN NOT NULL DEFAULT false,
    "preocupado" BOOLEAN NOT NULL DEFAULT false,
    "conPanico" BOOLEAN NOT NULL DEFAULT false,
    "nervioso" BOOLEAN NOT NULL DEFAULT false,
    "asustado" BOOLEAN NOT NULL DEFAULT false,
    "porcentajeCreenciaAntes" INTEGER NOT NULL,
    "porcentajeCreenciaDespues" INTEGER,

    CONSTRAINT "grupoEmociones2_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grupoEmociones3" (
    "id" SERIAL NOT NULL,
    "culpable" BOOLEAN NOT NULL DEFAULT false,
    "conRemordimiento" BOOLEAN NOT NULL DEFAULT false,
    "malo" BOOLEAN NOT NULL DEFAULT false,
    "avergonzado" BOOLEAN NOT NULL DEFAULT false,
    "porcentajeCreenciaAntes" INTEGER NOT NULL,
    "porcentajeCreenciaDespues" INTEGER,

    CONSTRAINT "grupoEmociones3_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grupoEmociones4" (
    "id" SERIAL NOT NULL,
    "inferior" BOOLEAN NOT NULL DEFAULT false,
    "sinValor" BOOLEAN NOT NULL DEFAULT false,
    "inadecuado" BOOLEAN NOT NULL DEFAULT false,
    "deficiente" BOOLEAN NOT NULL DEFAULT false,
    "incompetente" BOOLEAN NOT NULL DEFAULT false,
    "porcentajeCreenciaAntes" INTEGER NOT NULL,
    "porcentajeCreenciaDespues" INTEGER,

    CONSTRAINT "grupoEmociones4_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grupoEmociones5" (
    "id" SERIAL NOT NULL,
    "solitario" BOOLEAN NOT NULL DEFAULT false,
    "noQuerido" BOOLEAN NOT NULL DEFAULT false,
    "noDeseado" BOOLEAN NOT NULL DEFAULT false,
    "rechazado" BOOLEAN NOT NULL DEFAULT false,
    "solo" BOOLEAN NOT NULL DEFAULT false,
    "abandonado" BOOLEAN NOT NULL DEFAULT false,
    "porcentajeCreenciaAntes" INTEGER NOT NULL,
    "porcentajeCreenciaDespues" INTEGER,

    CONSTRAINT "grupoEmociones5_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grupoEmociones6" (
    "id" SERIAL NOT NULL,
    "turbado" BOOLEAN NOT NULL DEFAULT false,
    "tonto" BOOLEAN NOT NULL DEFAULT false,
    "humillado" BOOLEAN NOT NULL DEFAULT false,
    "apurado" BOOLEAN NOT NULL DEFAULT false,
    "porcentajeCreenciaAntes" INTEGER NOT NULL,
    "porcentajeCreenciaDespues" INTEGER,

    CONSTRAINT "grupoEmociones6_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grupoEmociones7" (
    "id" SERIAL NOT NULL,
    "desesperanzado" BOOLEAN NOT NULL DEFAULT false,
    "desanimado" BOOLEAN NOT NULL DEFAULT false,
    "pesimista" BOOLEAN NOT NULL DEFAULT false,
    "descorazonado" BOOLEAN NOT NULL DEFAULT false,
    "porcentajeCreenciaAntes" INTEGER NOT NULL,
    "porcentajeCreenciaDespues" INTEGER,

    CONSTRAINT "grupoEmociones7_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grupoEmociones8" (
    "id" SERIAL NOT NULL,
    "frustrado" BOOLEAN NOT NULL DEFAULT false,
    "atascado" BOOLEAN NOT NULL DEFAULT false,
    "chasqueado" BOOLEAN NOT NULL DEFAULT false,
    "derrotado" BOOLEAN NOT NULL DEFAULT false,
    "porcentajeCreenciaAntes" INTEGER NOT NULL,
    "porcentajeCreenciaDespues" INTEGER,

    CONSTRAINT "grupoEmociones8_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grupoEmociones9" (
    "id" SERIAL NOT NULL,
    "airado" BOOLEAN NOT NULL DEFAULT false,
    "enfadado" BOOLEAN NOT NULL DEFAULT false,
    "resentido" BOOLEAN NOT NULL DEFAULT false,
    "molesto" BOOLEAN NOT NULL DEFAULT false,
    "irritado" BOOLEAN NOT NULL DEFAULT false,
    "trastornado" BOOLEAN NOT NULL DEFAULT false,
    "furioso" BOOLEAN NOT NULL DEFAULT false,
    "porcentajeCreenciaAntes" INTEGER NOT NULL,
    "porcentajeCreenciaDespues" INTEGER,

    CONSTRAINT "grupoEmociones9_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grupoEmocionesPersonalizadas" (
    "id" SERIAL NOT NULL,
    "porcentajeCreenciaAntes" INTEGER NOT NULL,
    "porcentajeCreenciaDespues" INTEGER,

    CONSTRAINT "grupoEmocionesPersonalizadas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emocionPersonalizada" (
    "id" SERIAL NOT NULL,
    "descripcion" TEXT NOT NULL,
    "grupoEmocionesPersonalizadasId" INTEGER NOT NULL,

    CONSTRAINT "emocionPersonalizada_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "distorsion" (
    "id" SERIAL NOT NULL,
    "pensamientoTodoONada" BOOLEAN NOT NULL DEFAULT false,
    "generalizacionExcesiva" BOOLEAN NOT NULL DEFAULT false,
    "filtroMental" BOOLEAN NOT NULL DEFAULT false,
    "descargarLoPositivo" BOOLEAN NOT NULL DEFAULT false,
    "saltarAConclusiones" BOOLEAN NOT NULL DEFAULT false,
    "magnificacionOMinimizacion" BOOLEAN NOT NULL DEFAULT false,
    "razonamientoEmocional" BOOLEAN NOT NULL DEFAULT false,
    "afirmacionesDelTipoDeberia" BOOLEAN NOT NULL DEFAULT false,
    "ponerEtiquetas" BOOLEAN NOT NULL DEFAULT false,
    "inculpacion" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "distorsion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pensamiento" (
    "id" SERIAL NOT NULL,
    "pensamientoNegativo" TEXT NOT NULL,
    "porcentajeCreenciaAntes" INTEGER NOT NULL,
    "porcentajeCreenciaDespues" INTEGER,
    "pensamientoPositivo" TEXT NOT NULL,
    "porcentajeCreenciaPositivo" INTEGER,
    "distorsionId" INTEGER NOT NULL,
    "registroEstadoAnimoId" TEXT NOT NULL,

    CONSTRAINT "pensamiento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registro_estado_animo" (
    "id" TEXT NOT NULL,
    "idUsuario" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sucesoTrastornador" TEXT NOT NULL,
    "grupoEmociones1Id" INTEGER,
    "grupoEmociones2Id" INTEGER,
    "grupoEmociones3Id" INTEGER,
    "grupoEmociones4Id" INTEGER,
    "grupoEmociones5Id" INTEGER,
    "grupoEmociones6Id" INTEGER,
    "grupoEmociones7Id" INTEGER,
    "grupoEmociones8Id" INTEGER,
    "grupoEmociones9Id" INTEGER,
    "grupoEmocionesPersonalizadasId" INTEGER,

    CONSTRAINT "registro_estado_animo_pkey" PRIMARY KEY ("id")
);

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
CREATE UNIQUE INDEX "role_description_key" ON "role"("description");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "pensamiento_distorsionId_key" ON "pensamiento"("distorsionId");

-- CreateIndex
CREATE UNIQUE INDEX "registro_estado_animo_grupoEmociones1Id_key" ON "registro_estado_animo"("grupoEmociones1Id");

-- CreateIndex
CREATE UNIQUE INDEX "registro_estado_animo_grupoEmociones2Id_key" ON "registro_estado_animo"("grupoEmociones2Id");

-- CreateIndex
CREATE UNIQUE INDEX "registro_estado_animo_grupoEmociones3Id_key" ON "registro_estado_animo"("grupoEmociones3Id");

-- CreateIndex
CREATE UNIQUE INDEX "registro_estado_animo_grupoEmociones4Id_key" ON "registro_estado_animo"("grupoEmociones4Id");

-- CreateIndex
CREATE UNIQUE INDEX "registro_estado_animo_grupoEmociones5Id_key" ON "registro_estado_animo"("grupoEmociones5Id");

-- CreateIndex
CREATE UNIQUE INDEX "registro_estado_animo_grupoEmociones6Id_key" ON "registro_estado_animo"("grupoEmociones6Id");

-- CreateIndex
CREATE UNIQUE INDEX "registro_estado_animo_grupoEmociones7Id_key" ON "registro_estado_animo"("grupoEmociones7Id");

-- CreateIndex
CREATE UNIQUE INDEX "registro_estado_animo_grupoEmociones8Id_key" ON "registro_estado_animo"("grupoEmociones8Id");

-- CreateIndex
CREATE UNIQUE INDEX "registro_estado_animo_grupoEmociones9Id_key" ON "registro_estado_animo"("grupoEmociones9Id");

-- CreateIndex
CREATE UNIQUE INDEX "registro_estado_animo_grupoEmocionesPersonalizadasId_key" ON "registro_estado_animo"("grupoEmocionesPersonalizadasId");

-- CreateIndex
CREATE UNIQUE INDEX "test_breve_estado_de_animo_depresionId_key" ON "test_breve_estado_de_animo"("depresionId");

-- CreateIndex
CREATE UNIQUE INDEX "test_breve_estado_de_animo_impulsoSuicidaId_key" ON "test_breve_estado_de_animo"("impulsoSuicidaId");

-- CreateIndex
CREATE UNIQUE INDEX "test_breve_estado_de_animo_ansiedadFisicaId_key" ON "test_breve_estado_de_animo"("ansiedadFisicaId");

-- CreateIndex
CREATE UNIQUE INDEX "test_breve_estado_de_animo_ansiedadEmocionalId_key" ON "test_breve_estado_de_animo"("ansiedadEmocionalId");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emocionPersonalizada" ADD CONSTRAINT "emocionPersonalizada_grupoEmocionesPersonalizadasId_fkey" FOREIGN KEY ("grupoEmocionesPersonalizadasId") REFERENCES "grupoEmocionesPersonalizadas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pensamiento" ADD CONSTRAINT "pensamiento_distorsionId_fkey" FOREIGN KEY ("distorsionId") REFERENCES "distorsion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pensamiento" ADD CONSTRAINT "pensamiento_registroEstadoAnimoId_fkey" FOREIGN KEY ("registroEstadoAnimoId") REFERENCES "registro_estado_animo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registro_estado_animo" ADD CONSTRAINT "registro_estado_animo_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registro_estado_animo" ADD CONSTRAINT "registro_estado_animo_grupoEmociones1Id_fkey" FOREIGN KEY ("grupoEmociones1Id") REFERENCES "grupoEmociones1"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registro_estado_animo" ADD CONSTRAINT "registro_estado_animo_grupoEmociones2Id_fkey" FOREIGN KEY ("grupoEmociones2Id") REFERENCES "grupoEmociones2"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registro_estado_animo" ADD CONSTRAINT "registro_estado_animo_grupoEmociones3Id_fkey" FOREIGN KEY ("grupoEmociones3Id") REFERENCES "grupoEmociones3"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registro_estado_animo" ADD CONSTRAINT "registro_estado_animo_grupoEmociones4Id_fkey" FOREIGN KEY ("grupoEmociones4Id") REFERENCES "grupoEmociones4"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registro_estado_animo" ADD CONSTRAINT "registro_estado_animo_grupoEmociones5Id_fkey" FOREIGN KEY ("grupoEmociones5Id") REFERENCES "grupoEmociones5"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registro_estado_animo" ADD CONSTRAINT "registro_estado_animo_grupoEmociones6Id_fkey" FOREIGN KEY ("grupoEmociones6Id") REFERENCES "grupoEmociones6"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registro_estado_animo" ADD CONSTRAINT "registro_estado_animo_grupoEmociones7Id_fkey" FOREIGN KEY ("grupoEmociones7Id") REFERENCES "grupoEmociones7"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registro_estado_animo" ADD CONSTRAINT "registro_estado_animo_grupoEmociones8Id_fkey" FOREIGN KEY ("grupoEmociones8Id") REFERENCES "grupoEmociones8"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registro_estado_animo" ADD CONSTRAINT "registro_estado_animo_grupoEmociones9Id_fkey" FOREIGN KEY ("grupoEmociones9Id") REFERENCES "grupoEmociones9"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registro_estado_animo" ADD CONSTRAINT "registro_estado_animo_grupoEmocionesPersonalizadasId_fkey" FOREIGN KEY ("grupoEmocionesPersonalizadasId") REFERENCES "grupoEmocionesPersonalizadas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_breve_estado_de_animo" ADD CONSTRAINT "test_breve_estado_de_animo_depresionId_fkey" FOREIGN KEY ("depresionId") REFERENCES "depresion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_breve_estado_de_animo" ADD CONSTRAINT "test_breve_estado_de_animo_impulsoSuicidaId_fkey" FOREIGN KEY ("impulsoSuicidaId") REFERENCES "impulso_suicida"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_breve_estado_de_animo" ADD CONSTRAINT "test_breve_estado_de_animo_ansiedadFisicaId_fkey" FOREIGN KEY ("ansiedadFisicaId") REFERENCES "sentimientos_ansiedad_fisica"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_breve_estado_de_animo" ADD CONSTRAINT "test_breve_estado_de_animo_ansiedadEmocionalId_fkey" FOREIGN KEY ("ansiedadEmocionalId") REFERENCES "sentimientos_ansiedad_emocional"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_breve_estado_de_animo" ADD CONSTRAINT "test_breve_estado_de_animo_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
