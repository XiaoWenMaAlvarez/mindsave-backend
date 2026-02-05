import { TestBreveEstadoDeAnimo } from "../../domain/entities/init.js";
import { isValidEsquemaTestBreveEstadoDeAnimo } from "./schemas/testBreveEstadoDeAnimo.schema.js";


export class CreateTestBreveEstadoDeAnimoDTO {
  constructor(){}

  static create(body: {[key: string]: any}): [string | null, TestBreveEstadoDeAnimo | null] {
    const result = isValidEsquemaTestBreveEstadoDeAnimo(body);
    if(typeof result === "string") return [result, null];
    return [null, TestBreveEstadoDeAnimo.fromJson(body)];
  }
}

