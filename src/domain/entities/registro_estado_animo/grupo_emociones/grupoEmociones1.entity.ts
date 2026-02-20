export interface grupoEmociones1RegistroEstadoDeAnimoOptions {
  triste: boolean;
  melancolico: boolean;
  deprimido: boolean;
  decaido: boolean;
  infeliz: boolean;

  porcentajeCreenciaAntes: number;
  porcentajeCreenciaDespues: number | null;
}

export class GrupoEmociones1 implements grupoEmociones1RegistroEstadoDeAnimoOptions{
  triste: boolean;
  melancolico: boolean;
  deprimido: boolean;
  decaido: boolean;
  infeliz: boolean;

  porcentajeCreenciaAntes: number;
  porcentajeCreenciaDespues: number | null;

  constructor(options: grupoEmociones1RegistroEstadoDeAnimoOptions) {
    const {triste, melancolico, deprimido, decaido, infeliz, porcentajeCreenciaAntes, porcentajeCreenciaDespues} = options;
    this.triste = triste;
    this.melancolico = melancolico;
    this.deprimido = deprimido;
    this.decaido = decaido;
    this.infeliz = infeliz;
    this.porcentajeCreenciaAntes = porcentajeCreenciaAntes;
    this.porcentajeCreenciaDespues = porcentajeCreenciaDespues
  }

  static fromJson(object: {[key: string]: any}): GrupoEmociones1 {
    const {triste, melancolico, deprimido, decaido, infeliz, porcentajeCreenciaAntes, porcentajeCreenciaDespues} = object;
    const options = {triste, melancolico, deprimido, decaido, infeliz, porcentajeCreenciaAntes, porcentajeCreenciaDespues};
    return new GrupoEmociones1(options);
  }

  toJson() {
    return {
      triste: this.triste,
      melancolico: this.melancolico,
      deprimido: this.deprimido,
      decaido: this.decaido,
      infeliz: this.infeliz,
      porcentajeCreenciaAntes: this.porcentajeCreenciaAntes,
      porcentajeCreenciaDespues: this.porcentajeCreenciaDespues
    }
  }

}