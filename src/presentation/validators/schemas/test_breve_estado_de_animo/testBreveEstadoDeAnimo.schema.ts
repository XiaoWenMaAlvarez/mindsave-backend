import * as z from "zod";
import { fromZodError } from 'zod-validation-error';

const scoreSchema = z.number("La puntuación debe ser un número")
  .int("La puntuación debe ser un número entero")
  .min(0, "La puntuación no puede ser menor a cero")
  .max(4, "La puntuación no puede ser mayor a cuatro");

const testBreveEstadoDeAnimoSchema = z.object({
  depresion: z.object({
    tristeza: scoreSchema,
    desesperanza: scoreSchema,
    bajaAutoestima: scoreSchema,
    faltaDeValor: scoreSchema,
    perdidaDeSatisfaccion: scoreSchema,
  }, "Error con el apartado de depresión"),
  impulsoSuicida: z.object({
    pensamientosSuicidas: scoreSchema,
    deseosDeMorir: scoreSchema,
  }, "Error con el apartado de impulso suicida"),
  ansiedadFisica: z.object({
    palpitaciones: scoreSchema,
    sudoracion: scoreSchema,
    temblores: scoreSchema,
    dificultadRespirar: scoreSchema,
    ahogo: scoreSchema,
    dolorPecho: scoreSchema,
    nauseas: scoreSchema,
    mareos: scoreSchema,
    sensacionIrrealidad: scoreSchema,
    inestabilidadHormigueos: scoreSchema,
  }, "Error con el apartado de ansiedad física"),
  ansiedadEmocional: z.object({
    angustiado: scoreSchema,
    nervioso: scoreSchema,
    preocupado: scoreSchema,
    asustado: scoreSchema,
    tenso: scoreSchema,
  }, "Error con el apartado de ansiedad emocional"),
  idUsuario: z.uuid("El id de usuario debe ser un uuid"),
  fecha: z.string("La fecha debe ser un string"),
  id: z.string().optional(),
  notas: z.string().optional(),
}, "El test breve de estado de ánimo debe ser un objeto");

export const isValidEsquemaTestBreveEstadoDeAnimo = (body: {[key: string]: any}): boolean | string => {
  const result = testBreveEstadoDeAnimoSchema.safeParse(body);

  if (!result.success) {
    const validationError = fromZodError(result.error);
    return validationError.toString();
  }

  return true;
  
}