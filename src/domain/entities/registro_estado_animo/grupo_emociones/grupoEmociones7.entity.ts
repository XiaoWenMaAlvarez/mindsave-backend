export interface grupoEmociones7RegistroEstadoDeAnimoOptions {
  desesperanzado: boolean;
  desanimado: boolean;
  pesimista: boolean;
  descorazonado: boolean;

  porcentajeCreenciaAntes: number;
  porcentajeCreenciaDespues: number | null;
}

export class GrupoEmociones7 implements grupoEmociones7RegistroEstadoDeAnimoOptions{
  desesperanzado: boolean;
  desanimado: boolean;
  pesimista: boolean;
  descorazonado: boolean;

  porcentajeCreenciaAntes: number;
  porcentajeCreenciaDespues: number | null;

  constructor(options: grupoEmociones7RegistroEstadoDeAnimoOptions) {
    const {desesperanzado, desanimado, pesimista, descorazonado, porcentajeCreenciaAntes, porcentajeCreenciaDespues} = options;
    this.desesperanzado = desesperanzado;
    this.desanimado = desanimado;
    this.pesimista = pesimista;
    this.descorazonado = descorazonado;
    this.porcentajeCreenciaAntes = porcentajeCreenciaAntes;
    this.porcentajeCreenciaDespues = porcentajeCreenciaDespues
  }

  static fromJson(object: {[key: string]: any}): GrupoEmociones7 {
    const {desesperanzado, desanimado, pesimista, descorazonado, porcentajeCreenciaAntes, porcentajeCreenciaDespues} = object;
    const options = {desesperanzado, desanimado, pesimista, descorazonado, porcentajeCreenciaAntes, porcentajeCreenciaDespues};
    return new GrupoEmociones7(options);
  }

  toJson() {
    return {
      desesperanzado: this.desesperanzado,
      desanimado: this.desanimado,
      pesimista: this.pesimista,
      descorazonado: this.descorazonado,
      porcentajeCreenciaAntes: this.porcentajeCreenciaAntes,
      porcentajeCreenciaDespues: this.porcentajeCreenciaDespues
    }
  }

}