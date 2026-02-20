export interface distorsionRegistroEstadoAnimoOptions {
  pensamientoTodoONada: boolean;
  generalizacionExcesiva: boolean;
  filtroMental: boolean;
  descargarLoPositivo: boolean;
  saltarAConclusiones: boolean;
  magnificacionOMinimizacion: boolean;
  razonamientoEmocional: boolean;
  afirmacionesDelTipoDeberia: boolean;
  ponerEtiquetas: boolean;
  inculpacion: boolean;
}

export class Distorsion implements distorsionRegistroEstadoAnimoOptions {
  pensamientoTodoONada: boolean;
  generalizacionExcesiva: boolean;
  filtroMental: boolean;
  descargarLoPositivo: boolean;
  saltarAConclusiones: boolean;
  magnificacionOMinimizacion: boolean;
  razonamientoEmocional: boolean;
  afirmacionesDelTipoDeberia: boolean;
  ponerEtiquetas: boolean;
  inculpacion: boolean;

  constructor(options: distorsionRegistroEstadoAnimoOptions){
    const {pensamientoTodoONada, generalizacionExcesiva, filtroMental, descargarLoPositivo, saltarAConclusiones, 
      magnificacionOMinimizacion, razonamientoEmocional, afirmacionesDelTipoDeberia, ponerEtiquetas, inculpacion} = options;
    this.pensamientoTodoONada = pensamientoTodoONada;
    this.generalizacionExcesiva = generalizacionExcesiva;
    this.filtroMental = filtroMental;
    this.descargarLoPositivo = descargarLoPositivo;
    this.saltarAConclusiones = saltarAConclusiones;
    this.magnificacionOMinimizacion = magnificacionOMinimizacion;
    this.razonamientoEmocional = razonamientoEmocional;
    this.afirmacionesDelTipoDeberia = afirmacionesDelTipoDeberia;
    this.ponerEtiquetas = ponerEtiquetas;
    this.inculpacion = inculpacion;
  }

  static fromJson(lista: boolean[]): Distorsion {
    const [pensamientoTodoONada, generalizacionExcesiva, filtroMental, descargarLoPositivo, saltarAConclusiones, 
      magnificacionOMinimizacion, razonamientoEmocional, afirmacionesDelTipoDeberia, ponerEtiquetas, inculpacion] = lista;
    const options = {
      pensamientoTodoONada: pensamientoTodoONada, 
      generalizacionExcesiva: generalizacionExcesiva, 
      filtroMental: filtroMental, 
      descargarLoPositivo: descargarLoPositivo, 
      saltarAConclusiones: saltarAConclusiones, 
      magnificacionOMinimizacion: magnificacionOMinimizacion, 
      razonamientoEmocional: razonamientoEmocional, 
      afirmacionesDelTipoDeberia: afirmacionesDelTipoDeberia, 
      ponerEtiquetas: ponerEtiquetas, 
      inculpacion: inculpacion
    } as distorsionRegistroEstadoAnimoOptions;
    return new Distorsion(options);
  }

  toJson(): boolean[] {
    return [
      this.pensamientoTodoONada,
      this.generalizacionExcesiva,
      this.filtroMental,
      this.descargarLoPositivo,
      this.saltarAConclusiones,
      this.magnificacionOMinimizacion,
      this.razonamientoEmocional,
      this.afirmacionesDelTipoDeberia,
      this.ponerEtiquetas,
      this.inculpacion,
    ]
  }

}