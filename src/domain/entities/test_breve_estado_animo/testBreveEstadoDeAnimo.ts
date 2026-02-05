import { DepresionTestBreve} from "./depresionTestBreve.js";
import { ImpulsoSuicidaTestBreve } from "./impulsoSuicidaTestBreve.entity.js";
import { SentimientosAnsiedadFisicaTestBreve } from "./sentimientosAnsiedadFisicaTestBreve.js";
import { SentimientosAnsiedadEmocionalTestBreve} from "./sentimientosAnsiedadEmocionalTestBreve.js";

export interface tesBreveEstadoDeAnimoOptions {
  impulsoSuicida: ImpulsoSuicidaTestBreve;
  depresion: DepresionTestBreve;
  ansiedadEmocional: SentimientosAnsiedadEmocionalTestBreve;
  ansiedadFisica: SentimientosAnsiedadFisicaTestBreve;
  idUsuario: string;
  fecha?: Date;
  id?: string;
  notas?: string;
}

export class TestBreveEstadoDeAnimo {

  public depresion: DepresionTestBreve;
  public impulsoSuicida: ImpulsoSuicidaTestBreve;
  public ansiedadFisica: SentimientosAnsiedadFisicaTestBreve;
  public ansiedadEmocional: SentimientosAnsiedadEmocionalTestBreve;
  public idUsuario: string;
  public fecha: Date = new Date();
  public id?: string;
  public notas?: string;

  constructor(options: tesBreveEstadoDeAnimoOptions) {
    const {depresion, impulsoSuicida, ansiedadFisica, ansiedadEmocional, idUsuario, fecha, id, notas} = options;
    this.impulsoSuicida = impulsoSuicida;
    this.depresion = depresion;
    this.ansiedadFisica = ansiedadFisica;
    this.ansiedadEmocional = ansiedadEmocional;
    this.idUsuario = idUsuario;
    this.fecha = fecha ? fecha : new Date();
    if(id) this.id = id;
    if(notas) this.notas = notas;
  }
  

  static fromJson(object: {[key: string]: any}): TestBreveEstadoDeAnimo {
    const {depresion, impulsoSuicida, ansiedadFisica, ansiedadEmocional, idUsuario, fecha, id, notas} = object;
    const options: tesBreveEstadoDeAnimoOptions = {
      depresion: DepresionTestBreve.fromJson(depresion),
      impulsoSuicida: ImpulsoSuicidaTestBreve.fromJson(impulsoSuicida),
      ansiedadFisica: SentimientosAnsiedadFisicaTestBreve.fromJson(ansiedadFisica),
      ansiedadEmocional: SentimientosAnsiedadEmocionalTestBreve.fromJson(ansiedadEmocional),
      idUsuario,
    };
    if(fecha) options.fecha = new Date(fecha);
    if(id) options.id = id;
    if(notas) options.notas = notas;
    
    return new TestBreveEstadoDeAnimo(options);
  }
}