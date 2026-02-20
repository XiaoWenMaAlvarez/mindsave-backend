export interface grupoEmociones9RegistroEstadoDeAnimoOptions {
  airado: boolean;
  enfadado: boolean;
  resentido: boolean;
  molesto: boolean;
  irritado: boolean;
  trastornado: boolean;
  furioso: boolean;

  porcentajeCreenciaAntes: number;
  porcentajeCreenciaDespues: number | null;
}

export class GrupoEmociones9 implements grupoEmociones9RegistroEstadoDeAnimoOptions{
  airado: boolean;
  enfadado: boolean;
  resentido: boolean;
  molesto: boolean;
  irritado: boolean;
  trastornado: boolean;
  furioso: boolean;

  porcentajeCreenciaAntes: number;
  porcentajeCreenciaDespues: number | null;

  constructor(options: grupoEmociones9RegistroEstadoDeAnimoOptions) {
    const {airado, enfadado, resentido, molesto, irritado, trastornado, furioso, porcentajeCreenciaAntes, porcentajeCreenciaDespues} = options;
    this.airado = airado;
    this.enfadado = enfadado;
    this.resentido = resentido;
    this.molesto = molesto;
    this.irritado = irritado;
    this.trastornado = trastornado;
    this.furioso = furioso;
    this.porcentajeCreenciaAntes = porcentajeCreenciaAntes;
    this.porcentajeCreenciaDespues = porcentajeCreenciaDespues
  }

  static fromJson(object: {[key: string]: any}): GrupoEmociones9 {
    const {airado, enfadado, resentido, molesto, irritado, trastornado, furioso, porcentajeCreenciaAntes, porcentajeCreenciaDespues} = object;
    const options = {airado, enfadado, resentido, molesto, irritado, trastornado, furioso, porcentajeCreenciaAntes, porcentajeCreenciaDespues};
    return new GrupoEmociones9(options);
  }

  toJson() {
    return {
      airado: this.airado,
      enfadado: this.enfadado,
      resentido: this.resentido,
      molesto: this.molesto,
      irritado: this.irritado,
      trastornado: this.trastornado,
      furioso: this.furioso,
      porcentajeCreenciaAntes: this.porcentajeCreenciaAntes,
      porcentajeCreenciaDespues: this.porcentajeCreenciaDespues
    }
  }

}