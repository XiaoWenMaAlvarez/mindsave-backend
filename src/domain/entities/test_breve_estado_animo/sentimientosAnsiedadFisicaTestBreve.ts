type opcionesValidas = 0 | 1 | 2 | 3 | 4;

export interface sentimientosAnsiedadFisicaTesBreveOptions {
  palpitaciones: opcionesValidas;
  sudoracion: opcionesValidas;
  temblores: opcionesValidas;
  dificultadRespirar: opcionesValidas;
  ahogo: opcionesValidas;
  dolorPecho: opcionesValidas;
  nauseas: opcionesValidas;
  mareos: opcionesValidas;
  sensacionIrrealidad: opcionesValidas;
  inestabilidadHormigueos: opcionesValidas;
}


export class SentimientosAnsiedadFisicaTestBreve {

  public palpitaciones: opcionesValidas;
  public sudoracion: opcionesValidas;
  public temblores: opcionesValidas;
  public dificultadRespirar: opcionesValidas;
  public ahogo: opcionesValidas;
  public dolorPecho: opcionesValidas;
  public nauseas: opcionesValidas;
  public mareos: opcionesValidas;
  public sensacionIrrealidad: opcionesValidas;
  public inestabilidadHormigueos: opcionesValidas;

  constructor(options: sentimientosAnsiedadFisicaTesBreveOptions){
    const {palpitaciones, sudoracion, temblores, dificultadRespirar, ahogo, dolorPecho, nauseas, mareos, 
      sensacionIrrealidad, inestabilidadHormigueos} = options;
    this.palpitaciones = palpitaciones;
    this.sudoracion = sudoracion;
    this.temblores = temblores;
    this.dificultadRespirar = dificultadRespirar;
    this.ahogo = ahogo;
    this.dolorPecho = dolorPecho;
    this.nauseas = nauseas;
    this.mareos = mareos;
    this.sensacionIrrealidad = sensacionIrrealidad;
    this.inestabilidadHormigueos = inestabilidadHormigueos;
  }

  static fromJson(object: {[key: string]: any}): SentimientosAnsiedadFisicaTestBreve {
    const {palpitaciones, sudoracion, temblores, dificultadRespirar, ahogo, dolorPecho, nauseas, mareos, 
      sensacionIrrealidad, inestabilidadHormigueos} = object;
      const options = {palpitaciones, sudoracion, temblores, dificultadRespirar, ahogo, dolorPecho, nauseas, mareos, 
      sensacionIrrealidad, inestabilidadHormigueos}
    return new SentimientosAnsiedadFisicaTestBreve(options);
  }

  toJson() {
    return {
      palpitaciones: this.palpitaciones,
      sudoracion: this.sudoracion,
      temblores: this.temblores,
      dificultadRespirar: this.dificultadRespirar,
      ahogo: this.ahogo,
      dolorPecho: this.dolorPecho,
      nauseas: this.nauseas,
      mareos: this.mareos,
      sensacionIrrealidad: this.sensacionIrrealidad,
      inestabilidadHormigueos: this.inestabilidadHormigueos
    }
  }

}
