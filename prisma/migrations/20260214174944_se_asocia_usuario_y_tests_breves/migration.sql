-- AddForeignKey
ALTER TABLE "test_breve_estado_de_animo" ADD CONSTRAINT "test_breve_estado_de_animo_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
