import { 
  Distorsion,
  GrupoEmociones1, GrupoEmociones2, GrupoEmociones3, GrupoEmociones4, GrupoEmociones5, 
  GrupoEmociones6, GrupoEmociones7, GrupoEmociones8, GrupoEmociones9,
  GrupoEmocionesPersonalizadas,
  Pensamiento,
  RegistroEstadoAnimo, 
  type distorsionRegistroEstadoAnimoOptions, 
  type grupoEmociones1RegistroEstadoDeAnimoOptions, 
  type grupoEmociones2RegistroEstadoDeAnimoOptions,
  type grupoEmociones3RegistroEstadoDeAnimoOptions,
  type grupoEmociones4RegistroEstadoDeAnimoOptions,
  type grupoEmociones5RegistroEstadoDeAnimoOptions,
  type grupoEmociones6RegistroEstadoDeAnimoOptions,
  type grupoEmociones7RegistroEstadoDeAnimoOptions,
  type grupoEmociones8RegistroEstadoDeAnimoOptions,
  type grupoEmociones9RegistroEstadoDeAnimoOptions,
  type grupoEmocionesPersonalizadasRegistroEstadoDeAnimoOptions,
  type pensamientoRegistroEstadoAnimoOptions,
  type registroEstadoAnimoOptions 
} from "../../../domain/init.js";
import type { 
  DistorsionDB,
  GrupoEmociones1DB, GrupoEmociones2DB, GrupoEmociones3DB, GrupoEmociones4DB, GrupoEmociones5DB, 
  GrupoEmociones6DB, GrupoEmociones7DB, GrupoEmociones8DB, GrupoEmociones9DB,
  GrupoEmocionesPersonalizadasDB,
  PensamientoDB,
  RegistroEstadoAnimoDB 
} from "../../models/init.js";

export class RegistroEstadoAnimoMapper {
  static fromDBtoEntity(registro: RegistroEstadoAnimoDB): RegistroEstadoAnimo {
    const options: registroEstadoAnimoOptions = {
      id: registro.id,
      idUsuario: registro.idUsuario,
      fecha: registro.fecha,
      sucesoTrastornador: registro.sucesoTrastornador,
      grupoEmociones1: RegistroEstadoAnimoMapper.grupoEmociones1FromDBtoEntity(registro.grupoEmociones1),
      grupoEmociones2: RegistroEstadoAnimoMapper.grupoEmociones2FromDBtoEntity(registro.grupoEmociones2),
      grupoEmociones3: RegistroEstadoAnimoMapper.grupoEmociones3FromDBtoEntity(registro.grupoEmociones3),
      grupoEmociones4: RegistroEstadoAnimoMapper.grupoEmociones4FromDBtoEntity(registro.grupoEmociones4),
      grupoEmociones5: RegistroEstadoAnimoMapper.grupoEmociones5FromDBtoEntity(registro.grupoEmociones5),
      grupoEmociones6: RegistroEstadoAnimoMapper.grupoEmociones6FromDBtoEntity(registro.grupoEmociones6),
      grupoEmociones7: RegistroEstadoAnimoMapper.grupoEmociones7FromDBtoEntity(registro.grupoEmociones7),
      grupoEmociones8: RegistroEstadoAnimoMapper.grupoEmociones8FromDBtoEntity(registro.grupoEmociones8),
      grupoEmociones9: RegistroEstadoAnimoMapper.grupoEmociones9FromDBtoEntity(registro.grupoEmociones9),
      grupoEmocionesPersonalizadas: RegistroEstadoAnimoMapper.grupoEmocionesPersonalizadasFromDBtoEntity(registro.grupoEmocionesPersonalizadas),
      pensamientos: registro.pensamientos.map(p => RegistroEstadoAnimoMapper.pensamientoFromDBtoEntity(p)),
    };
    return new RegistroEstadoAnimo(options);
  }

  private static grupoEmociones1FromDBtoEntity(grupoEmociones1: GrupoEmociones1DB): GrupoEmociones1 {
    const options: grupoEmociones1RegistroEstadoDeAnimoOptions = {
      triste: grupoEmociones1.triste,
      melancolico: grupoEmociones1.melancolico,
      deprimido: grupoEmociones1.deprimido,
      decaido: grupoEmociones1.decaido,
      infeliz: grupoEmociones1.infeliz,
      porcentajeCreenciaAntes: grupoEmociones1.porcentajeCreenciaAntes,
      porcentajeCreenciaDespues: grupoEmociones1.porcentajeCreenciaDespues,
    };
    return new GrupoEmociones1(options);
  }
  
  private static grupoEmociones2FromDBtoEntity(grupoEmociones2: GrupoEmociones2DB): GrupoEmociones2 {
    const options: grupoEmociones2RegistroEstadoDeAnimoOptions = {
      angustiado: grupoEmociones2.angustiado,
      preocupado: grupoEmociones2.preocupado,
      conPanico: grupoEmociones2.conPanico,
      nervioso: grupoEmociones2.nervioso,
      asustado: grupoEmociones2.asustado,
      porcentajeCreenciaAntes: grupoEmociones2.porcentajeCreenciaAntes,
      porcentajeCreenciaDespues: grupoEmociones2.porcentajeCreenciaDespues,
    };
    return new GrupoEmociones2(options);
  }

  private static grupoEmociones3FromDBtoEntity(grupoEmociones3: GrupoEmociones3DB): GrupoEmociones3 {
    const options: grupoEmociones3RegistroEstadoDeAnimoOptions = {
      culpable: grupoEmociones3.culpable,
      conRemordimiento: grupoEmociones3.conRemordimiento,
      malo: grupoEmociones3.malo,
      avergonzado: grupoEmociones3.avergonzado,
      porcentajeCreenciaAntes: grupoEmociones3.porcentajeCreenciaAntes,
      porcentajeCreenciaDespues: grupoEmociones3.porcentajeCreenciaDespues,
    };
    return new GrupoEmociones3(options);
  }

  private static grupoEmociones4FromDBtoEntity(grupoEmociones4: GrupoEmociones4DB): GrupoEmociones4 {
    const options: grupoEmociones4RegistroEstadoDeAnimoOptions = {
      inferior: grupoEmociones4.inferior,
      sinValor: grupoEmociones4.sinValor,
      inadecuado: grupoEmociones4.inadecuado,
      deficiente: grupoEmociones4.deficiente,
      incompetente: grupoEmociones4.incompetente,
      porcentajeCreenciaAntes: grupoEmociones4.porcentajeCreenciaAntes,
      porcentajeCreenciaDespues: grupoEmociones4.porcentajeCreenciaDespues,
    };
    return new GrupoEmociones4(options);
  }

  private static grupoEmociones5FromDBtoEntity(grupoEmociones5: GrupoEmociones5DB): GrupoEmociones5 {
    const options: grupoEmociones5RegistroEstadoDeAnimoOptions = {
      solitario: grupoEmociones5.solitario,
      noQuerido: grupoEmociones5.noQuerido,
      noDeseado: grupoEmociones5.noDeseado,
      rechazado: grupoEmociones5.rechazado,
      solo: grupoEmociones5.solo,
      abandonado: grupoEmociones5.abandonado,
      porcentajeCreenciaAntes: grupoEmociones5.porcentajeCreenciaAntes,
      porcentajeCreenciaDespues: grupoEmociones5.porcentajeCreenciaDespues,
    };
    return new GrupoEmociones5(options);
  }

  private static grupoEmociones6FromDBtoEntity(grupoEmociones6: GrupoEmociones6DB): GrupoEmociones6 {
    const options: grupoEmociones6RegistroEstadoDeAnimoOptions = {
      turbado: grupoEmociones6.turbado,
      tonto: grupoEmociones6.tonto,
      humillado: grupoEmociones6.humillado,
      apurado: grupoEmociones6.apurado,
      porcentajeCreenciaAntes: grupoEmociones6.porcentajeCreenciaAntes,
      porcentajeCreenciaDespues: grupoEmociones6.porcentajeCreenciaDespues,
    };
    return new GrupoEmociones6(options);
  }

  private static grupoEmociones7FromDBtoEntity(grupoEmociones7: GrupoEmociones7DB): GrupoEmociones7 {
    const options: grupoEmociones7RegistroEstadoDeAnimoOptions = {
      desesperanzado: grupoEmociones7.desesperanzado,
      desanimado: grupoEmociones7.desanimado,
      pesimista: grupoEmociones7.pesimista,
      descorazonado: grupoEmociones7.descorazonado,
      porcentajeCreenciaAntes: grupoEmociones7.porcentajeCreenciaAntes,
      porcentajeCreenciaDespues: grupoEmociones7.porcentajeCreenciaDespues,
    };
    return new GrupoEmociones7(options);
  }

  private static grupoEmociones8FromDBtoEntity(grupoEmociones8: GrupoEmociones8DB): GrupoEmociones8 {
    const options: grupoEmociones8RegistroEstadoDeAnimoOptions = {
      frustrado: grupoEmociones8.frustrado,
      atascado: grupoEmociones8.atascado,
      chasqueado: grupoEmociones8.chasqueado,
      derrotado: grupoEmociones8.derrotado,
      porcentajeCreenciaAntes: grupoEmociones8.porcentajeCreenciaAntes,
      porcentajeCreenciaDespues: grupoEmociones8.porcentajeCreenciaDespues,
    };
    return new GrupoEmociones8(options);
  }

  private static grupoEmociones9FromDBtoEntity(grupoEmociones9: GrupoEmociones9DB): GrupoEmociones9 {
    const options: grupoEmociones9RegistroEstadoDeAnimoOptions = {
      airado: grupoEmociones9.airado,
      enfadado: grupoEmociones9.enfadado,
      resentido: grupoEmociones9.resentido,
      molesto: grupoEmociones9.molesto,
      irritado: grupoEmociones9.irritado,
      trastornado: grupoEmociones9.trastornado,
      furioso: grupoEmociones9.furioso,
      porcentajeCreenciaAntes: grupoEmociones9.porcentajeCreenciaAntes,
      porcentajeCreenciaDespues: grupoEmociones9.porcentajeCreenciaDespues,
    };
    return new GrupoEmociones9(options);
  }

  private static grupoEmocionesPersonalizadasFromDBtoEntity(grupoEmocionesPersonalizadas: GrupoEmocionesPersonalizadasDB): GrupoEmocionesPersonalizadas {
    const options: grupoEmocionesPersonalizadasRegistroEstadoDeAnimoOptions = {
      listaEmociones: grupoEmocionesPersonalizadas.listaEmociones.map(e => e.descripcion),
      porcentajeCreenciaAntes: grupoEmocionesPersonalizadas.porcentajeCreenciaAntes,
      porcentajeCreenciaDespues: grupoEmocionesPersonalizadas.porcentajeCreenciaDespues,
    };
    return new GrupoEmocionesPersonalizadas(options);
  }

  private static distorsionFromDBtoEntity(distorsion: DistorsionDB): Distorsion {
    const options: distorsionRegistroEstadoAnimoOptions = {
      pensamientoTodoONada: distorsion.pensamientoTodoONada,
      generalizacionExcesiva: distorsion.generalizacionExcesiva,
      filtroMental: distorsion.filtroMental,
      descargarLoPositivo: distorsion.descargarLoPositivo,
      saltarAConclusiones: distorsion.saltarAConclusiones,
      magnificacionOMinimizacion: distorsion.magnificacionOMinimizacion,
      razonamientoEmocional: distorsion.razonamientoEmocional,
      afirmacionesDelTipoDeberia: distorsion.afirmacionesDelTipoDeberia,
      ponerEtiquetas: distorsion.ponerEtiquetas,
      inculpacion: distorsion.inculpacion,
    };
    return new Distorsion(options);
  }

  private static pensamientoFromDBtoEntity(pensamiento: PensamientoDB): Pensamiento {
    const options: pensamientoRegistroEstadoAnimoOptions = {
      pensamientoNegativo: pensamiento.pensamientoNegativo,
      porcentajeCreenciaAntes: pensamiento.porcentajeCreenciaAntes,
      porcentajeCreenciaDespues: pensamiento.porcentajeCreenciaDespues,
      pensamientoPositivo: pensamiento.pensamientoPositivo,
      porcentajeCreenciaPositivo: pensamiento.porcentajeCreenciaPositivo,
      distorsion: RegistroEstadoAnimoMapper.distorsionFromDBtoEntity(pensamiento.distorsion),
    }
    return new Pensamiento(options);
  }

}