BEGIN;

LOCK TABLE "test_breve_estado_de_animo" IN SHARE ROW EXCLUSIVE MODE;
LOCK TABLE "chat" IN SHARE ROW EXCLUSIVE MODE;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "test_breve_estado_de_animo"
    GROUP BY "idUsuario", ("fecha" AT TIME ZONE 'UTC' AT TIME ZONE 'America/Santiago')::date
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION 'No se puede aplicar la unicidad diaria: existen tests duplicados para un mismo usuario y día';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "chat"
    GROUP BY "idUsuario", "title"
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION 'No se puede aplicar la unicidad de chats: existen títulos duplicados para un mismo usuario';
  END IF;
END $$;

ALTER TABLE "test_breve_estado_de_animo"
ADD COLUMN "fechaDia" DATE;

UPDATE "test_breve_estado_de_animo"
SET "fechaDia" = ("fecha" AT TIME ZONE 'UTC' AT TIME ZONE 'America/Santiago')::date;

ALTER TABLE "test_breve_estado_de_animo"
ALTER COLUMN "fechaDia" SET NOT NULL;

CREATE UNIQUE INDEX "test_breve_estado_de_animo_idUsuario_fechaDia_key"
ON "test_breve_estado_de_animo"("idUsuario", "fechaDia");

CREATE UNIQUE INDEX "chat_idUsuario_title_key"
ON "chat"("idUsuario", "title");

COMMIT;
