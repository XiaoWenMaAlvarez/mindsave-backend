export interface grupoEmociones3RegistroEstadoDeAnimoOptions {
  culpable: boolean;
  conRemordimiento: boolean;
  malo: boolean;
  avergonzado: boolean;

  porcentajeCreenciaAntes: number;
  porcentajeCreenciaDespues: number | null;
}

export class GrupoEmociones3 implements grupoEmociones3RegistroEstadoDeAnimoOptions{
  culpable: boolean;
  conRemordimiento: boolean;
  malo: boolean;
  avergonzado: boolean;

  porcentajeCreenciaAntes: number;
  porcentajeCreenciaDespues: number | null;

  constructor(options: grupoEmociones3RegistroEstadoDeAnimoOptions) {
    const {culpable, conRemordimiento, malo, avergonzado, porcentajeCreenciaAntes, porcentajeCreenciaDespues} = options;
    this.culpable = culpable;
    this.conRemordimiento = conRemordimiento;
    this.malo = malo;
    this.avergonzado = avergonzado;
    this.porcentajeCreenciaAntes = porcentajeCreenciaAntes;
    this.porcentajeCreenciaDespues = porcentajeCreenciaDespues
  }

  static fromJson(object: {[key: string]: any}): GrupoEmociones3 {
    const {culpable, conRemordimiento, malo, avergonzado, porcentajeCreenciaAntes, porcentajeCreenciaDespues} = object;
    const options = {culpable, conRemordimiento, malo, avergonzado, porcentajeCreenciaAntes, porcentajeCreenciaDespues};
    return new GrupoEmociones3(options);
  }

  toJson() {
    return {
      culpable: this.culpable,
      conRemordimiento: this.conRemordimiento,
      malo: this.malo,
      avergonzado: this.avergonzado,
      porcentajeCreenciaAntes: this.porcentajeCreenciaAntes,
      porcentajeCreenciaDespues: this.porcentajeCreenciaDespues
    }
  }

}