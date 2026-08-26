import * as z from "zod";
import { fromZodError } from 'zod-validation-error';

const percentageSchema = z.number("El porcentaje de creencia debe ser un número")
  .int("El porcentaje de creencia debe ser un entero")
  .min(0, "El porcentaje de creencia no puede ser menor a 0")
  .max(100, "El porcentaje de creencia no puede ser mayor a 100");


const registroEstadoDeAnimoSchema = z.object({
  id: z.string().optional(),
  idUsuario: z.uuid("El id de usuario debe ser un uuid"),
  fecha: z.string({ message: "La fecha debe ser un string" })
    .refine((val) => {
      if (typeof val !== "string" || val.trim() === "") return false;
      const timestamp = Date.parse(val);
      if (isNaN(timestamp)) return false;
      const date = new Date(val);
      return !isNaN(date.getTime());
    }, { message: "La fecha debe ser una fecha válida" }),
  sucesoTrastornador: z.string("El suceso trastornador debe ser un string").min(1, "El suceso trastornador debe tener al menos un carácter"),
  
  grupoEmociones1: z.object({
    triste: z.boolean("La emoción triste debe ser un booleano"),
    melancolico: z.boolean("La emoción melancólico debe ser un booleano"),
    deprimido: z.boolean("La emoción deprimido debe ser un booleano"),
    decaido: z.boolean("La emoción decaído debe ser un booleano"),
    infeliz: z.boolean("La emoción infeliz debe ser un booleano"),
    porcentajeCreenciaAntes: percentageSchema,
    porcentajeCreenciaDespues: percentageSchema.nullable(),
  }, "Error con el grupo de emociones 1"),

  grupoEmociones2: z.object({
    angustiado: z.boolean("La emoción angustiado debe ser un booleano"),
    preocupado: z.boolean("La emoción preocupado debe ser un booleano"),
    conPanico: z.boolean("La emoción conPanico debe ser un booleano"),
    nervioso: z.boolean("La emoción nervioso debe ser un booleano"),
    asustado: z.boolean("La emoción asustado debe ser un booleano"),
    porcentajeCreenciaAntes: percentageSchema,
    porcentajeCreenciaDespues: percentageSchema.nullable(),
  }, "Error con el grupo de emociones 2"),

  grupoEmociones3: z.object({
    culpable: z.boolean("La emoción culpable debe ser un booleano"),
    conRemordimiento: z.boolean("La emoción conRemordimiento debe ser un booleano"),
    malo: z.boolean("La emoción malo debe ser un booleano"),
    avergonzado: z.boolean("La emoción avergonzado debe ser un booleano"),
    porcentajeCreenciaAntes: percentageSchema,
    porcentajeCreenciaDespues: percentageSchema.nullable(),
  }, "Error con el grupo de emociones 3"),

  grupoEmociones4: z.object({
    inferior: z.boolean("La emoción inferior debe ser un booleano"),
    sinValor: z.boolean("La emoción sinValor debe ser un booleano"),
    inadecuado: z.boolean("La emoción inadecuado debe ser un booleano"),
    deficiente: z.boolean("La emoción deficiente debe ser un booleano"),
    incompetente: z.boolean("La emoción incompetente debe ser un booleano"),
    porcentajeCreenciaAntes: percentageSchema,
    porcentajeCreenciaDespues: percentageSchema.nullable(),
  }, "Error con el grupo de emociones 4"),

  grupoEmociones5: z.object({
    solitario: z.boolean("La emoción solitario debe ser un booleano"),
    noQuerido: z.boolean("La emoción noQuerido debe ser un booleano"),
    noDeseado: z.boolean("La emoción noDeseado debe ser un booleano"),
    rechazado: z.boolean("La emoción rechazado debe ser un booleano"),
    solo: z.boolean("La emoción solo debe ser un booleano"),
    abandonado: z.boolean("La emoción abandonado debe ser un booleano"),
    porcentajeCreenciaAntes: percentageSchema,
    porcentajeCreenciaDespues: percentageSchema.nullable(),
  }, "Error con el grupo de emociones 5"),

  grupoEmociones6: z.object({
    turbado: z.boolean("La emoción turbado debe ser un booleano"),
    tonto: z.boolean("La emoción tonto debe ser un booleano"),
    humillado: z.boolean("La emoción humillado debe ser un booleano"),
    apurado: z.boolean("La emoción apurado debe ser un booleano"),
    porcentajeCreenciaAntes: percentageSchema,
    porcentajeCreenciaDespues: percentageSchema.nullable(),
  }, "Error con el grupo de emociones 6"),

  grupoEmociones7: z.object({
    desesperanzado: z.boolean("La emoción desesperanzado debe ser un booleano"),
    desanimado: z.boolean("La emoción desanimado debe ser un booleano"),
    pesimista: z.boolean("La emoción pesimista debe ser un booleano"),
    descorazonado: z.boolean("La emoción descorazonado debe ser un booleano"),
    porcentajeCreenciaAntes: percentageSchema,
    porcentajeCreenciaDespues: percentageSchema.nullable(),
  }, "Error con el grupo de emociones 7"),

  grupoEmociones8: z.object({
    frustrado: z.boolean("La emoción frustrado debe ser un booleano"),
    atascado: z.boolean("La emoción atascado debe ser un booleano"),
    chasqueado: z.boolean("La emoción chasqueado debe ser un booleano"),
    derrotado: z.boolean("La emoción derrotado debe ser un booleano"),
    porcentajeCreenciaAntes: percentageSchema,
    porcentajeCreenciaDespues: percentageSchema.nullable(),
  }, "Error con el grupo de emociones 8"),

  grupoEmociones9: z.object({
    airado: z.boolean("La emoción airado debe ser un booleano"),
    enfadado: z.boolean("La emoción enfadado debe ser un booleano"),
    resentido: z.boolean("La emoción resentido debe ser un booleano"),
    molesto: z.boolean("La emoción molesto debe ser un booleano"),
    irritado: z.boolean("La emoción irritado debe ser un booleano"),
    trastornado: z.boolean("La emoción trastornado debe ser un booleano"),
    furioso: z.boolean("La emoción furioso debe ser un booleano"),
    porcentajeCreenciaAntes: percentageSchema,
    porcentajeCreenciaDespues: percentageSchema.nullable(),
  }, "Error con el grupo de emociones 9"),

  grupoEmocionesPersonalizadas: z.object({
    listaEmociones: z.string("Las emociones deben ser un array de strings").array(),
    porcentajeCreenciaAntes: percentageSchema,
    porcentajeCreenciaDespues: percentageSchema.nullable(),
  }, "Error con el grupo de emociones personalizadas"),

  pensamientos: z.array(z.object({
    pensamientoNegativo: z.string("El pensamiento negativo debe ser un string").min(1, "El pensamiento negativo debe tener al menos un carácter"),
    porcentajeCreenciaAntes: percentageSchema,
    porcentajeCreenciaDespues: percentageSchema.nullable(),
    pensamientoPositivo: z.string("El pensamiento positivo debe ser un string").min(1, "El pensamiento positivo debe tener al menos un carácter").nullable(),
    porcentajeCreenciaPositivo: percentageSchema.nullable(),
    distorsion: z.array(
      z.boolean("La distorsión debe ser un array de booleanos")
      , "La distorsión debe ser un objeto"
    ).length(10, "La distorsión debe tener 10 elementos")
  }, "El pensamiento debe ser un objeto"), "El pensamiento debe ser un array de objetos")
}, "El registro de estado de ánimo debe ser un objeto");


export const isValidEsquemaRegistroEstadoDeAnimo = (body: {[key: string]: any}): boolean | string => {
  const result = registroEstadoDeAnimoSchema.safeParse(body);

  if (!result.success) {
    const validationError = fromZodError(result.error);
    return validationError.toString();
  }

  return true;
  
}
