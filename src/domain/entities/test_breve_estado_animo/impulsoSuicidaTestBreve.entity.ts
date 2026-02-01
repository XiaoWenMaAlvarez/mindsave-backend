type opcionesValidas = 0 | 1 | 2 | 3 | 4;

export interface impulsoSuicidaTestBreveOptions {
  pensamientosSuicidas: opcionesValidas;
  deseosDeMorir: opcionesValidas;
}

export class ImpulsoSuicidaTestBreve {
  constructor(
    public pensamientosSuicidas: opcionesValidas,
    public deseosDeMorir: opcionesValidas,
  ){}

  static fromJson(options: impulsoSuicidaTestBreveOptions): ImpulsoSuicidaTestBreve {
    return new ImpulsoSuicidaTestBreve(options.pensamientosSuicidas, options.deseosDeMorir);
  }

}
