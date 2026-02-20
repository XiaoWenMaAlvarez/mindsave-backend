import { RegistroEstadoAnimo } from "../../../../domain/entities/init.js";
import { isValidEsquemaRegistroEstadoDeAnimo } from '../../schemas/init.js';


export class RegistroEstadoDeAnimoDTO {
  constructor(){}

  static create(body: {[key: string]: any}): [string | null, RegistroEstadoAnimo | null] {
    const result = isValidEsquemaRegistroEstadoDeAnimo(body);
    if(typeof result === "string") return [result, null];
    return [null, RegistroEstadoAnimo.fromJson(body)];
  }

  static edit(body: {[key: string]: any}): [string | null, RegistroEstadoAnimo | null] {
    const result = isValidEsquemaRegistroEstadoDeAnimo(body);
    if(typeof result === "string") return [result, null];
    return [null, RegistroEstadoAnimo.fromJson(body)];
  }
}

