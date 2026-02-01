import { DepresionTestBreve, type depresionTesBreveOptions } from "./depresionTestBreve.js";
import { ImpulsoSuicidaTestBreve, type impulsoSuicidaTestBreveOptions } from "./impulsoSuicidaTestBreve.entity.js";
import { SentimientosAnsiedadFisicaTestBreve, type sentimientosAnsiedadFisicaTesBreveOptions } from "./sentimientosAnsiedadFisicaTestBreve.js";
import { SentimientosAnsiedadEmocionalTestBreve, type sentimientosAnsiedadEmocionalTestBreveOptions } from "./sentimientosAnsiedadEmocionalTestBreve.js";

export interface tesBreveEstadoDeAnimoOptions {
  impulsoSuicida: impulsoSuicidaTestBreveOptions;
  depresion: depresionTesBreveOptions;
  ansiedadEmocional: sentimientosAnsiedadEmocionalTestBreveOptions;
  ansiedadFisica: sentimientosAnsiedadFisicaTesBreveOptions;
  idUsuario: string;
  fecha?: Date;
  id?: string;
  notas?: string;
}

export class TestBreveEstadoDeAnimo {

  constructor(
    public depresion: DepresionTestBreve,
    public impulsoSuicida: ImpulsoSuicidaTestBreve,
    public ansiedadFisica: SentimientosAnsiedadFisicaTestBreve,
    public ansiedadEmocional: SentimientosAnsiedadEmocionalTestBreve,
    public idUsuario: string,
    public fecha: Date = new Date(),
    public id?: string,
    public notas?: string,
    
  ) {}

  static fromJson(json: tesBreveEstadoDeAnimoOptions): TestBreveEstadoDeAnimo {
    return new TestBreveEstadoDeAnimo(
      DepresionTestBreve.fromJson(json.depresion),
      ImpulsoSuicidaTestBreve.fromJson(json.impulsoSuicida),
      SentimientosAnsiedadFisicaTestBreve.fromJson(json.ansiedadFisica),
      SentimientosAnsiedadEmocionalTestBreve.fromJson(json.ansiedadEmocional),
      json.idUsuario,
      json.fecha ? new Date(json.fecha) : undefined,
      json.id,
      json.notas
    );
  }
}