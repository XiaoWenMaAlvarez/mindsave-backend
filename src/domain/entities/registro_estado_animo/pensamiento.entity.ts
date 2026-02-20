import { Distorsion } from "./distorsion.entity.js";

export interface pensamientoRegistroEstadoAnimoOptions {
  pensamientoNegativo: string;
  porcentajeCreenciaAntes: number;
  porcentajeCreenciaDespues: number | null;
  pensamientoPositivo: string | null;
  porcentajeCreenciaPositivo: number | null;
  distorsion: Distorsion;
}


export class Pensamiento implements pensamientoRegistroEstadoAnimoOptions {
  pensamientoNegativo: string;
  porcentajeCreenciaAntes: number;
  porcentajeCreenciaDespues: number | null;
  pensamientoPositivo: string | null;
  porcentajeCreenciaPositivo: number | null;
  distorsion: Distorsion;

  constructor(options: pensamientoRegistroEstadoAnimoOptions){
    const {pensamientoNegativo, porcentajeCreenciaAntes, porcentajeCreenciaDespues, pensamientoPositivo, porcentajeCreenciaPositivo, distorsion } = options;
    this.pensamientoNegativo = pensamientoNegativo;
    this.porcentajeCreenciaAntes = porcentajeCreenciaAntes;
    this.porcentajeCreenciaDespues = porcentajeCreenciaDespues;
    this.pensamientoPositivo = pensamientoPositivo;
    this.porcentajeCreenciaPositivo = porcentajeCreenciaPositivo
    this.distorsion = distorsion;
  }

  static fromJson(object: {[key: string]: any}): Pensamiento {
    const {pensamientoNegativo, porcentajeCreenciaAntes, porcentajeCreenciaDespues, pensamientoPositivo, porcentajeCreenciaPositivo, distorsion }= object;
    const options = {pensamientoNegativo, porcentajeCreenciaAntes, porcentajeCreenciaDespues, pensamientoPositivo, 
      porcentajeCreenciaPositivo, distorsion: Distorsion.fromJson(distorsion) };
    return new Pensamiento(options);
  }

  toJson() {
    return {
      pensamientoNegativo: this.pensamientoNegativo,
      porcentajeCreenciaAntes: this.porcentajeCreenciaAntes,
      porcentajeCreenciaDespues: this.porcentajeCreenciaDespues,
      pensamientoPositivo: this.pensamientoPositivo,
      porcentajeCreenciaPositivo: this.porcentajeCreenciaPositivo,
      distorsion: this.distorsion.toJson(),
    }
  }

}
