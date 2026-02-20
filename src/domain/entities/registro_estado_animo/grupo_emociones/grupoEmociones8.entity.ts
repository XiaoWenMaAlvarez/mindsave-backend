export interface grupoEmociones8RegistroEstadoDeAnimoOptions {
  frustrado: boolean;
  atascado: boolean;
  chasqueado: boolean;
  derrotado: boolean;

  porcentajeCreenciaAntes: number;
  porcentajeCreenciaDespues: number | null;
}

export class GrupoEmociones8 implements grupoEmociones8RegistroEstadoDeAnimoOptions{
  frustrado: boolean;
  atascado: boolean;
  chasqueado: boolean;
  derrotado: boolean;

  porcentajeCreenciaAntes: number;
  porcentajeCreenciaDespues: number | null;

  constructor(options: grupoEmociones8RegistroEstadoDeAnimoOptions) {
    const {frustrado, atascado, chasqueado, derrotado, porcentajeCreenciaAntes, porcentajeCreenciaDespues} = options;
    this.frustrado = frustrado;
    this.atascado = atascado;
    this.chasqueado = chasqueado;
    this.derrotado = derrotado;
    this.porcentajeCreenciaAntes = porcentajeCreenciaAntes;
    this.porcentajeCreenciaDespues = porcentajeCreenciaDespues
  }

  static fromJson(object: {[key: string]: any}): GrupoEmociones8 {
    const {frustrado, atascado, chasqueado, derrotado, porcentajeCreenciaAntes, porcentajeCreenciaDespues} = object;
    const options = {frustrado, atascado, chasqueado, derrotado, porcentajeCreenciaAntes, porcentajeCreenciaDespues};
    return new GrupoEmociones8(options);
  }

  toJson() {
    return {
      frustrado: this.frustrado,
      atascado: this.atascado,
      chasqueado: this.chasqueado,
      derrotado: this.derrotado,
      porcentajeCreenciaAntes: this.porcentajeCreenciaAntes,
      porcentajeCreenciaDespues: this.porcentajeCreenciaDespues
    }
  }

}