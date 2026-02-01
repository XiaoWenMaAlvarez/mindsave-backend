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

  constructor(
    public palpitaciones: opcionesValidas,
    public sudoracion: opcionesValidas,
    public temblores: opcionesValidas,
    public dificultadRespirar: opcionesValidas,
    public ahogo: opcionesValidas,
    public dolorPecho: opcionesValidas,
    public nauseas: opcionesValidas,
    public mareos: opcionesValidas,
    public sensacionIrrealidad: opcionesValidas,
    public inestabilidadHormigueos: opcionesValidas
  ){
  }

  static fromJson(options: sentimientosAnsiedadFisicaTesBreveOptions): SentimientosAnsiedadFisicaTestBreve {
    return new SentimientosAnsiedadFisicaTestBreve(
      options.palpitaciones,
      options.sudoracion,
      options.temblores,
      options.dificultadRespirar,
      options.ahogo,
      options.dolorPecho,
      options.nauseas,
      options.mareos,
      options.sensacionIrrealidad,
      options.inestabilidadHormigueos,
    );
  }

}
