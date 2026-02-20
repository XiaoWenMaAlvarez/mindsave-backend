import { GrupoEmociones1,  GrupoEmociones2, GrupoEmociones3, GrupoEmociones4, GrupoEmociones5,
  GrupoEmociones6, GrupoEmociones7, GrupoEmociones8, GrupoEmociones9, GrupoEmocionesPersonalizadas
} from './grupo_emociones/init.js';
import { Pensamiento } from './pensamiento.entity.js';

export interface registroEstadoAnimoOptions {
  id?: string;
  idUsuario: string;
  fecha: Date;
  sucesoTrastornador: string;
  grupoEmociones1: GrupoEmociones1;
  grupoEmociones2: GrupoEmociones2;
  grupoEmociones3: GrupoEmociones3;
  grupoEmociones4: GrupoEmociones4;
  grupoEmociones5: GrupoEmociones5;
  grupoEmociones6: GrupoEmociones6;
  grupoEmociones7: GrupoEmociones7;
  grupoEmociones8: GrupoEmociones8;
  grupoEmociones9: GrupoEmociones9;
  grupoEmocionesPersonalizadas? : GrupoEmocionesPersonalizadas;
  pensamientos: Pensamiento[];
}


export class RegistroEstadoAnimo implements registroEstadoAnimoOptions{
  id?: string;
  idUsuario: string;
  fecha: Date;
  sucesoTrastornador: string;
  grupoEmociones1: GrupoEmociones1;
  grupoEmociones2: GrupoEmociones2;
  grupoEmociones3: GrupoEmociones3;
  grupoEmociones4: GrupoEmociones4;
  grupoEmociones5: GrupoEmociones5;
  grupoEmociones6: GrupoEmociones6;
  grupoEmociones7: GrupoEmociones7;
  grupoEmociones8: GrupoEmociones8;
  grupoEmociones9: GrupoEmociones9;
  grupoEmocionesPersonalizadas? : GrupoEmocionesPersonalizadas;
  pensamientos: Pensamiento[];

  constructor(options: registroEstadoAnimoOptions){
    const {id, idUsuario, fecha, sucesoTrastornador, grupoEmociones1, grupoEmociones2, grupoEmociones3, grupoEmociones4, 
      grupoEmociones5, grupoEmociones6, grupoEmociones7, grupoEmociones8, grupoEmociones9, grupoEmocionesPersonalizadas,
      pensamientos} = options;
      if(id) this.id = id;
      this.idUsuario = idUsuario;
      this.fecha = fecha;
      this.sucesoTrastornador = sucesoTrastornador;
      this.grupoEmociones1 = grupoEmociones1;
      this.grupoEmociones2 = grupoEmociones2;
      this.grupoEmociones3 = grupoEmociones3;
      this.grupoEmociones4 = grupoEmociones4;
      this.grupoEmociones5 = grupoEmociones5;
      this.grupoEmociones6 = grupoEmociones6;
      this.grupoEmociones7 = grupoEmociones7;
      this.grupoEmociones8 = grupoEmociones8;
      this.grupoEmociones9 = grupoEmociones9;
      if(grupoEmocionesPersonalizadas) this.grupoEmocionesPersonalizadas = grupoEmocionesPersonalizadas;
      this.pensamientos = [...pensamientos];
    
  }

  static fromJson(object: {[key: string]: any}): RegistroEstadoAnimo {
    const {id, idUsuario, fecha, sucesoTrastornador, grupoEmociones1, grupoEmociones2, grupoEmociones3, grupoEmociones4, 
      grupoEmociones5, grupoEmociones6, grupoEmociones7, grupoEmociones8, grupoEmociones9, grupoEmocionesPersonalizadas,
      pensamientos} = object;
    const options: registroEstadoAnimoOptions = {
      idUsuario, 
      fecha: typeof fecha === 'string' ? new Date(fecha) : fecha,
      sucesoTrastornador, 
      grupoEmociones1: GrupoEmociones1.fromJson(grupoEmociones1), 
      grupoEmociones2: GrupoEmociones2.fromJson(grupoEmociones2), 
      grupoEmociones3: GrupoEmociones3.fromJson(grupoEmociones3), 
      grupoEmociones4: GrupoEmociones4.fromJson(grupoEmociones4), 
      grupoEmociones5: GrupoEmociones5.fromJson(grupoEmociones5), 
      grupoEmociones6: GrupoEmociones6.fromJson(grupoEmociones6), 
      grupoEmociones7: GrupoEmociones7.fromJson(grupoEmociones7), 
      grupoEmociones8: GrupoEmociones8.fromJson(grupoEmociones8), 
      grupoEmociones9: GrupoEmociones9.fromJson(grupoEmociones9), 
      pensamientos: pensamientos.map((pensamiento: { [key: string]: any }) => Pensamiento.fromJson(pensamiento))
    };
    if(id) options.id = id;
    if(grupoEmocionesPersonalizadas) options.grupoEmocionesPersonalizadas = GrupoEmocionesPersonalizadas.fromJson(grupoEmocionesPersonalizadas);
    return new RegistroEstadoAnimo(options);
  }

  toJson() {
    return {
      id: this.id,
      idUsuario: this.idUsuario,
      fecha: this.fecha,
      sucesoTrastornador: this.sucesoTrastornador,
      grupoEmociones1: this.grupoEmociones1.toJson(),
      grupoEmociones2: this.grupoEmociones2.toJson(),
      grupoEmociones3: this.grupoEmociones3.toJson(),
      grupoEmociones4: this.grupoEmociones4.toJson(),
      grupoEmociones5: this.grupoEmociones5.toJson(),
      grupoEmociones6: this.grupoEmociones6.toJson(),
      grupoEmociones7: this.grupoEmociones7.toJson(),
      grupoEmociones8: this.grupoEmociones8.toJson(),
      grupoEmociones9: this.grupoEmociones9.toJson(),
      grupoEmocionesPersonalizadas: this.grupoEmocionesPersonalizadas?.toJson(),
      pensamientos: this.pensamientos.map((pensamiento) => pensamiento.toJson()),
    }
  }

}
