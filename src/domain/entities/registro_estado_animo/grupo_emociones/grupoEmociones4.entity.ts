export interface grupoEmociones4RegistroEstadoDeAnimoOptions {
  inferior: boolean;
  sinValor: boolean;
  inadecuado: boolean;
  deficiente: boolean;
  incompetente: boolean;

  porcentajeCreenciaAntes: number;
  porcentajeCreenciaDespues: number | null;
}

export class GrupoEmociones4 implements grupoEmociones4RegistroEstadoDeAnimoOptions{
  inferior: boolean;
  sinValor: boolean;
  inadecuado: boolean;
  deficiente: boolean;
  incompetente: boolean;

  porcentajeCreenciaAntes: number;
  porcentajeCreenciaDespues: number | null;

  constructor(options: grupoEmociones4RegistroEstadoDeAnimoOptions) {
    const {inferior, sinValor, inadecuado, deficiente, incompetente, porcentajeCreenciaAntes, porcentajeCreenciaDespues} = options;
    this.inferior = inferior;
    this.sinValor = sinValor;
    this.inadecuado = inadecuado;
    this.deficiente = deficiente;
    this.incompetente = incompetente;
    this.porcentajeCreenciaAntes = porcentajeCreenciaAntes;
    this.porcentajeCreenciaDespues = porcentajeCreenciaDespues
  }

  static fromJson(object: {[key: string]: any}): GrupoEmociones4 {
    const {inferior, sinValor, inadecuado, deficiente, incompetente, porcentajeCreenciaAntes, porcentajeCreenciaDespues} = object;
    const options = {inferior, sinValor, inadecuado, deficiente, incompetente, porcentajeCreenciaAntes, porcentajeCreenciaDespues};
    return new GrupoEmociones4(options);
  }

  toJson() {
    return {
      inferior: this.inferior,
      sinValor: this.sinValor,
      inadecuado: this.inadecuado,
      deficiente: this.deficiente,
      incompetente: this.incompetente,
      porcentajeCreenciaAntes: this.porcentajeCreenciaAntes,
      porcentajeCreenciaDespues: this.porcentajeCreenciaDespues
    }
  }

}