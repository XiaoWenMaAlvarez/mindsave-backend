import { TestBreveEstadoDeAnimo } from "../../../../domain/entities/init.js";
import { isValidEsquemaTestBreveEstadoDeAnimo } from "../../schemas/test_breve_estado_de_animo/testBreveEstadoDeAnimo.schema.js";


export class TestBreveEstadoDeAnimoDTO {
  constructor(){}

  static create(body: {[key: string]: any}): [string | null, TestBreveEstadoDeAnimo | null] {
    const result = isValidEsquemaTestBreveEstadoDeAnimo(body);
    if(typeof result === "string") return [result, null];
    return [null, TestBreveEstadoDeAnimo.fromJson({
      ...body,
      fecha: new Date(body.fecha)
    })];
  }

  static edit(body: {[key: string]: any}): [string | null, TestBreveEstadoDeAnimo | null] {
    const result = isValidEsquemaTestBreveEstadoDeAnimo(body);
    if(typeof result === "string") return [result, null];
    return [null, TestBreveEstadoDeAnimo.fromJson({
      ...body,
      fecha: new Date(body.fecha)
      }
    )];
  }
}

