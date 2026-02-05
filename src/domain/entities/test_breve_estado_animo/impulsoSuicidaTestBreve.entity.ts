type opcionesValidas = 0 | 1 | 2 | 3 | 4;

export interface impulsoSuicidaTestBreveOptions {
  pensamientosSuicidas: opcionesValidas;
  deseosDeMorir: opcionesValidas;
}
export class ImpulsoSuicidaTestBreve {
  
  public pensamientosSuicidas: opcionesValidas;
  public deseosDeMorir: opcionesValidas;

  constructor(options: impulsoSuicidaTestBreveOptions){
    const {pensamientosSuicidas, deseosDeMorir} = options;
    this.pensamientosSuicidas = pensamientosSuicidas;
    this.deseosDeMorir = deseosDeMorir;
  }

  static fromJson(object: {[key: string]: any}): ImpulsoSuicidaTestBreve {
    const {pensamientosSuicidas, deseosDeMorir} = object;
    const options = {pensamientosSuicidas, deseosDeMorir};
    return new ImpulsoSuicidaTestBreve(options);
  }

  toJson() {
    return {
      pensamientosSuicidas: this.pensamientosSuicidas,
      deseosDeMorir: this.deseosDeMorir
    }
  }

}
