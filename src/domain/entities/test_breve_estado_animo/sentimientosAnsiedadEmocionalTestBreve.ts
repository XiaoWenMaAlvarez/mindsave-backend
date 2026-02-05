type opcionesValidas = 0 | 1 | 2 | 3 | 4;

export interface sentimientosAnsiedadEmocionalTestBreveOptions {
  angustiado: opcionesValidas;
  nervioso: opcionesValidas;
  preocupado: opcionesValidas;
  asustado: opcionesValidas;
  tenso: opcionesValidas;
}


export class SentimientosAnsiedadEmocionalTestBreve {

  public angustiado: opcionesValidas;
  public nervioso: opcionesValidas;
  public preocupado: opcionesValidas;
  public asustado: opcionesValidas;
  public tenso: opcionesValidas;

  constructor(options: sentimientosAnsiedadEmocionalTestBreveOptions){
    const {angustiado, nervioso, preocupado, asustado, tenso} = options;
    this.angustiado = angustiado;
    this.nervioso = nervioso;
    this.preocupado = preocupado;
    this.asustado = asustado;
    this.tenso = tenso;
  }
  
  static fromJson(object: {[key: string]: any}): SentimientosAnsiedadEmocionalTestBreve {
    const {angustiado, nervioso, preocupado, asustado, tenso} = object;
    const options = {angustiado, nervioso, preocupado, asustado, tenso};
    return new SentimientosAnsiedadEmocionalTestBreve(options);
  }

  toJson() {
    return {
      angustiado: this.angustiado,
      nervioso: this.nervioso,
      preocupado: this.preocupado,
      asustado: this.asustado,
      tenso: this.tenso
    }
  }

}
