type opcionesValidas = 0 | 1 | 2 | 3 | 4;

export interface depresionTesBreveOptions {
  tristeza: opcionesValidas;
  desesperanza: opcionesValidas;
  bajaAutoestima: opcionesValidas;
  faltaDeValor: opcionesValidas;
  perdidaDeSatisfaccion: opcionesValidas;
}

export class DepresionTestBreve {

  public tristeza: opcionesValidas;
  public desesperanza: opcionesValidas;
  public bajaAutoestima: opcionesValidas;
  public faltaDeValor: opcionesValidas;
  public perdidaDeSatisfaccion: opcionesValidas;

  constructor(options: depresionTesBreveOptions){
    const {tristeza, desesperanza, bajaAutoestima, faltaDeValor, perdidaDeSatisfaccion} = options;
    this.tristeza = tristeza;
    this.desesperanza = desesperanza;
    this.bajaAutoestima = bajaAutoestima;
    this.faltaDeValor = faltaDeValor;
    this.perdidaDeSatisfaccion = perdidaDeSatisfaccion;
  }

  static fromJson(object: {[key: string]: any}): DepresionTestBreve {
    const {tristeza, desesperanza, bajaAutoestima, faltaDeValor, perdidaDeSatisfaccion} = object; 
    const options = {tristeza,  desesperanza, bajaAutoestima, faltaDeValor, perdidaDeSatisfaccion};
    return new DepresionTestBreve(options);
  }

  toJson() {
    return {
      tristeza: this.tristeza,
      desesperanza: this.desesperanza,
      bajaAutoestima: this.bajaAutoestima,
      faltaDeValor: this.faltaDeValor,
      perdidaDeSatisfaccion: this.perdidaDeSatisfaccion
    }
  }

}
