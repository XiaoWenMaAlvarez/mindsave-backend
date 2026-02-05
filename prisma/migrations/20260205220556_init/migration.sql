-- CreateTable
CREATE TABLE "Depresion" (
    "id" SERIAL NOT NULL,
    "tristeza" INTEGER NOT NULL,
    "desesperanza" INTEGER NOT NULL,
    "bajaAutoestima" INTEGER NOT NULL,
    "faltaDeValor" INTEGER NOT NULL,
    "perdidaDeSatisfaccion" INTEGER NOT NULL,

    CONSTRAINT "Depresion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImpulsoSuicida" (
    "id" SERIAL NOT NULL,
    "pensamientosSuicidas" INTEGER NOT NULL,
    "deseosDeMorir" INTEGER NOT NULL,

    CONSTRAINT "ImpulsoSuicida_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SentimientosAnsiedadFisica" (
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

    CONSTRAINT "SentimientosAnsiedadFisica_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SentimientosAnsiedadEmocional" (
    "id" SERIAL NOT NULL,
    "angustiado" INTEGER NOT NULL,
    "nervioso" INTEGER NOT NULL,
    "preocupado" INTEGER NOT NULL,
    "asustado" INTEGER NOT NULL,
    "tenso" INTEGER NOT NULL,

    CONSTRAINT "SentimientosAnsiedadEmocional_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestBreveEstadoDeAnimo" (
    "id" TEXT NOT NULL,
    "depresionId" INTEGER NOT NULL,
    "impulsoSuicidaId" INTEGER NOT NULL,
    "ansiedadFisicaId" INTEGER NOT NULL,
    "ansiedadEmocionalId" INTEGER NOT NULL,
    "idUsuario" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notas" TEXT,

    CONSTRAINT "TestBreveEstadoDeAnimo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TestBreveEstadoDeAnimo_depresionId_key" ON "TestBreveEstadoDeAnimo"("depresionId");

-- CreateIndex
CREATE UNIQUE INDEX "TestBreveEstadoDeAnimo_impulsoSuicidaId_key" ON "TestBreveEstadoDeAnimo"("impulsoSuicidaId");

-- CreateIndex
CREATE UNIQUE INDEX "TestBreveEstadoDeAnimo_ansiedadFisicaId_key" ON "TestBreveEstadoDeAnimo"("ansiedadFisicaId");

-- CreateIndex
CREATE UNIQUE INDEX "TestBreveEstadoDeAnimo_ansiedadEmocionalId_key" ON "TestBreveEstadoDeAnimo"("ansiedadEmocionalId");

-- AddForeignKey
ALTER TABLE "TestBreveEstadoDeAnimo" ADD CONSTRAINT "TestBreveEstadoDeAnimo_depresionId_fkey" FOREIGN KEY ("depresionId") REFERENCES "Depresion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestBreveEstadoDeAnimo" ADD CONSTRAINT "TestBreveEstadoDeAnimo_impulsoSuicidaId_fkey" FOREIGN KEY ("impulsoSuicidaId") REFERENCES "ImpulsoSuicida"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestBreveEstadoDeAnimo" ADD CONSTRAINT "TestBreveEstadoDeAnimo_ansiedadFisicaId_fkey" FOREIGN KEY ("ansiedadFisicaId") REFERENCES "SentimientosAnsiedadFisica"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestBreveEstadoDeAnimo" ADD CONSTRAINT "TestBreveEstadoDeAnimo_ansiedadEmocionalId_fkey" FOREIGN KEY ("ansiedadEmocionalId") REFERENCES "SentimientosAnsiedadEmocional"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
