export interface grupoEmociones5RegistroEstadoDeAnimoOptions {
  solitario: boolean;
  noQuerido: boolean;
  noDeseado: boolean;
  rechazado: boolean;
  solo: boolean;
  abandonado: boolean;

  porcentajeCreenciaAntes: number;
  porcentajeCreenciaDespues: number | null;
}

export class GrupoEmociones5 implements grupoEmociones5RegistroEstadoDeAnimoOptions{
  solitario: boolean;
  noQuerido: boolean;
  noDeseado: boolean;
  rechazado: boolean;
  solo: boolean;
  abandonado: boolean;

  porcentajeCreenciaAntes: number;
  porcentajeCreenciaDespues: number | null;

  constructor(options: grupoEmociones5RegistroEstadoDeAnimoOptions) {
    const {solitario, noQuerido, noDeseado, rechazado, solo, abandonado, porcentajeCreenciaAntes, porcentajeCreenciaDespues} = options;
    this.solitario = solitario;
    this.noQuerido = noQuerido;
    this.noDeseado = noDeseado;
    this.rechazado = rechazado;
    this.solo = solo;
    this.abandonado = abandonado;
    this.porcentajeCreenciaAntes = porcentajeCreenciaAntes;
    this.porcentajeCreenciaDespues = porcentajeCreenciaDespues
  }

  static fromJson(object: {[key: string]: any}): GrupoEmociones5 {
    const {solitario, noQuerido, noDeseado, rechazado, solo, abandonado, porcentajeCreenciaAntes, porcentajeCreenciaDespues} = object;
    const options = {solitario, noQuerido, noDeseado, rechazado, solo, abandonado, porcentajeCreenciaAntes, porcentajeCreenciaDespues};
    return new GrupoEmociones5(options);
  }

  toJson() {
    return {
      solitario: this.solitario,
      noQuerido: this.noQuerido,
      noDeseado: this.noDeseado,
      rechazado: this.rechazado,
      solo: this.solo,
      abandonado: this.abandonado,
      porcentajeCreenciaAntes: this.porcentajeCreenciaAntes,
      porcentajeCreenciaDespues: this.porcentajeCreenciaDespues
    }
  }

}