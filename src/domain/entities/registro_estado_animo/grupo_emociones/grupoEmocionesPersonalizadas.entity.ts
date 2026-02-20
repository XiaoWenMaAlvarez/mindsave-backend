export interface grupoEmocionesPersonalizadasRegistroEstadoDeAnimoOptions {
  listaEmociones: string[];
  porcentajeCreenciaAntes: number;
  porcentajeCreenciaDespues: number | null;
}

export class GrupoEmocionesPersonalizadas implements grupoEmocionesPersonalizadasRegistroEstadoDeAnimoOptions{
  listaEmociones: string[];
  porcentajeCreenciaAntes: number;
  porcentajeCreenciaDespues: number | null;

  constructor(options: grupoEmocionesPersonalizadasRegistroEstadoDeAnimoOptions) {
    const {listaEmociones, porcentajeCreenciaAntes, porcentajeCreenciaDespues} = options;
    this.listaEmociones = [...listaEmociones];
    this.porcentajeCreenciaAntes = porcentajeCreenciaAntes;
    this.porcentajeCreenciaDespues = porcentajeCreenciaDespues
  }

  static fromJson(object: {[key: string]: any}): GrupoEmocionesPersonalizadas {
    const {listaEmociones, porcentajeCreenciaAntes, porcentajeCreenciaDespues} = object;
    const options = {listaEmociones, porcentajeCreenciaAntes, porcentajeCreenciaDespues};
    return new GrupoEmocionesPersonalizadas(options);
  }

  toJson() {
    return {
      listaEmociones: [...this.listaEmociones],
      porcentajeCreenciaAntes: this.porcentajeCreenciaAntes,
      porcentajeCreenciaDespues: this.porcentajeCreenciaDespues
    }
  }

}