type opcionesValidas = 0 | 1 | 2 | 3 | 4;

export interface depresionTesBreveOptions {
  tristeza: opcionesValidas;
  desesperanza: opcionesValidas;
  bajaAutoestima: opcionesValidas;
  faltaDeValor: opcionesValidas;
  perdidaDeSatisfaccion: opcionesValidas;
}

export class DepresionTestBreve {

  constructor(
    public tristeza: opcionesValidas,
    public desesperanza: opcionesValidas,
    public bajaAutoestima: opcionesValidas,
    public faltaDeValor: opcionesValidas,
    public perdidaDeSatisfaccion: opcionesValidas,
  ){
  }

  static fromJson(options: depresionTesBreveOptions): DepresionTestBreve {
    return new DepresionTestBreve(
      options.tristeza,
      options.desesperanza,
      options.bajaAutoestima,
      options.faltaDeValor,
      options.perdidaDeSatisfaccion,
    );
  }

}
