export interface grupoEmociones6RegistroEstadoDeAnimoOptions {
  turbado: boolean;
  tonto: boolean;
  humillado: boolean;
  apurado: boolean;

  porcentajeCreenciaAntes: number;
  porcentajeCreenciaDespues: number | null;
}

export class GrupoEmociones6 implements grupoEmociones6RegistroEstadoDeAnimoOptions{
  turbado: boolean;
  tonto: boolean;
  humillado: boolean;
  apurado: boolean;

  porcentajeCreenciaAntes: number;
  porcentajeCreenciaDespues: number | null;

  constructor(options: grupoEmociones6RegistroEstadoDeAnimoOptions) {
    const {turbado, tonto, humillado, apurado, porcentajeCreenciaAntes, porcentajeCreenciaDespues} = options;
    this.turbado = turbado;
    this.tonto = tonto;
    this.humillado = humillado;
    this.apurado = apurado;
    this.porcentajeCreenciaAntes = porcentajeCreenciaAntes;
    this.porcentajeCreenciaDespues = porcentajeCreenciaDespues
  }

  static fromJson(object: {[key: string]: any}): GrupoEmociones6 {
    const {turbado, tonto, humillado, apurado, porcentajeCreenciaAntes, porcentajeCreenciaDespues} = object;
    const options = {turbado, tonto, humillado, apurado, porcentajeCreenciaAntes, porcentajeCreenciaDespues};
    return new GrupoEmociones6(options);
  }

  toJson() {
    return {
      turbado: this.turbado,
      tonto: this.tonto,
      humillado: this.humillado,
      apurado: this.apurado,
      porcentajeCreenciaAntes: this.porcentajeCreenciaAntes,
      porcentajeCreenciaDespues: this.porcentajeCreenciaDespues
    }
  }

}