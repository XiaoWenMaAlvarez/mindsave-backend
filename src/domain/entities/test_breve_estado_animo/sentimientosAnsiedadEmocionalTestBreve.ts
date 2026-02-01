type opcionesValidas = 0 | 1 | 2 | 3 | 4;

export interface sentimientosAnsiedadEmocionalTestBreveOptions {
  angustiado: opcionesValidas;
  nervioso: opcionesValidas;
  preocupado: opcionesValidas;
  asustado: opcionesValidas;
  tenso: opcionesValidas;
}


export class SentimientosAnsiedadEmocionalTestBreve {

  constructor(
      public angustiado: opcionesValidas,
      public nervioso: opcionesValidas,
      public preocupado: opcionesValidas,
      public asustado: opcionesValidas,
      public tenso: opcionesValidas,
    ){
    }
  
    static fromJson(options: sentimientosAnsiedadEmocionalTestBreveOptions): SentimientosAnsiedadEmocionalTestBreve {
      return new SentimientosAnsiedadEmocionalTestBreve(
        options.angustiado,
        options.nervioso,
        options.preocupado,
        options.asustado,
        options.tenso,
      );
    }
}

  