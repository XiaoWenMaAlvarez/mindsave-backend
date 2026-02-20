export interface grupoEmociones2RegistroEstadoDeAnimoOptions {
  angustiado: boolean;
  preocupado: boolean;
  conPanico: boolean;
  nervioso: boolean;
  asustado: boolean;

  porcentajeCreenciaAntes: number;
  porcentajeCreenciaDespues: number | null;
}

export class GrupoEmociones2 implements grupoEmociones2RegistroEstadoDeAnimoOptions{
  angustiado: boolean;
  preocupado: boolean;
  conPanico: boolean;
  nervioso: boolean;
  asustado: boolean;

  porcentajeCreenciaAntes: number;
  porcentajeCreenciaDespues: number | null;

  constructor(options: grupoEmociones2RegistroEstadoDeAnimoOptions) {
    const {angustiado, preocupado, conPanico, nervioso, asustado, porcentajeCreenciaAntes, porcentajeCreenciaDespues} = options;
    this.angustiado = angustiado;
    this.preocupado = preocupado;
    this.conPanico = conPanico;
    this.nervioso = nervioso;
    this.asustado = asustado;
    this.porcentajeCreenciaAntes = porcentajeCreenciaAntes;
    this.porcentajeCreenciaDespues = porcentajeCreenciaDespues
  }

  static fromJson(object: {[key: string]: any}): GrupoEmociones2 {
    const {angustiado, preocupado, conPanico, nervioso, asustado, porcentajeCreenciaAntes, porcentajeCreenciaDespues} = object;
    const options = {angustiado, preocupado, conPanico, nervioso, asustado, porcentajeCreenciaAntes, porcentajeCreenciaDespues};
    return new GrupoEmociones2(options);
  }

  toJson() {
    return {
      angustiado: this.angustiado,
      preocupado: this.preocupado,
      conPanico: this.conPanico,
      nervioso: this.nervioso,
      asustado: this.asustado,
      porcentajeCreenciaAntes: this.porcentajeCreenciaAntes,
      porcentajeCreenciaDespues: this.porcentajeCreenciaDespues
    }
  }

}