export class RegistroEstadoDeAnimoMapper {

  static fromBodyToSchema(body:  { [key: string]: any }) {
    return {
      id: body?.id ?? undefined,
      idUsuario: body?.idUsuario ?? undefined,
      fecha: body?.fecha ?? undefined,
      sucesoTrastornador: body?.sucesoTrastornador ?? undefined,
      grupoEmociones1: {
        triste: body?.grupoEmociones?.grupo1?.seleccionEmociones?.[0] ?? undefined,
        melancolico: body?.grupoEmociones?.grupo1?.seleccionEmociones?.[1] ?? undefined,
        deprimido: body?.grupoEmociones?.grupo1?.seleccionEmociones?.[2] ?? undefined,
        decaido: body?.grupoEmociones?.grupo1?.seleccionEmociones?.[3] ?? undefined,
        infeliz: body?.grupoEmociones?.grupo1?.seleccionEmociones?.[4] ?? undefined,
        porcentajeCreenciaAntes: body?.grupoEmociones?.grupo1?.porcentajeCreenciaAntes ?? undefined,
        porcentajeCreenciaDespues: body?.grupoEmociones?.grupo1?.porcentajeCreenciaDespues ?? undefined
      },
      grupoEmociones2: {
        angustiado: body?.grupoEmociones?.grupo2?.seleccionEmociones?.[0] ?? undefined,
        preocupado: body?.grupoEmociones?.grupo2?.seleccionEmociones?.[1] ?? undefined,
        conPanico: body?.grupoEmociones?.grupo2?.seleccionEmociones?.[2] ?? undefined,
        nervioso: body?.grupoEmociones?.grupo2?.seleccionEmociones?.[3] ?? undefined,
        asustado: body?.grupoEmociones?.grupo2?.seleccionEmociones?.[4] ?? undefined,
        porcentajeCreenciaAntes: body?.grupoEmociones?.grupo2?.porcentajeCreenciaAntes ?? undefined,
        porcentajeCreenciaDespues: body?.grupoEmociones?.grupo2?.porcentajeCreenciaDespues ?? undefined       
      },
      grupoEmociones3: {
        culpable: body?.grupoEmociones?.grupo3?.seleccionEmociones?.[0] ?? undefined,
        conRemordimiento: body?.grupoEmociones?.grupo3?.seleccionEmociones?.[1] ?? undefined,
        malo: body?.grupoEmociones?.grupo3?.seleccionEmociones?.[2] ?? undefined,
        avergonzado: body?.grupoEmociones?.grupo3?.seleccionEmociones?.[3] ?? undefined,
        porcentajeCreenciaAntes: body?.grupoEmociones?.grupo3?.porcentajeCreenciaAntes ?? undefined,
        porcentajeCreenciaDespues: body?.grupoEmociones?.grupo3?.porcentajeCreenciaDespues ?? undefined       
      },
      grupoEmociones4: {
        inferior: body?.grupoEmociones?.grupo4?.seleccionEmociones?.[0] ?? undefined,
        sinValor: body?.grupoEmociones?.grupo4?.seleccionEmociones?.[1] ?? undefined,
        inadecuado: body?.grupoEmociones?.grupo4?.seleccionEmociones?.[2] ?? undefined,
        deficiente: body?.grupoEmociones?.grupo4?.seleccionEmociones?.[3] ?? undefined,
        incompetente: body?.grupoEmociones?.grupo4?.seleccionEmociones?.[4] ?? undefined,
        porcentajeCreenciaAntes: body?.grupoEmociones?.grupo4?.porcentajeCreenciaAntes ?? undefined,
        porcentajeCreenciaDespues: body?.grupoEmociones?.grupo4?.porcentajeCreenciaDespues ?? undefined       
      },
      grupoEmociones5: {
        solitario: body?.grupoEmociones?.grupo5?.seleccionEmociones?.[0] ?? undefined,
        noQuerido: body?.grupoEmociones?.grupo5?.seleccionEmociones?.[1] ?? undefined,
        noDeseado: body?.grupoEmociones?.grupo5?.seleccionEmociones?.[2] ?? undefined,
        rechazado: body?.grupoEmociones?.grupo5?.seleccionEmociones?.[3] ?? undefined,
        solo: body?.grupoEmociones?.grupo5?.seleccionEmociones?.[4] ?? undefined,
        abandonado: body?.grupoEmociones?.grupo5?.seleccionEmociones?.[5] ?? undefined,
        porcentajeCreenciaAntes: body?.grupoEmociones?.grupo5?.porcentajeCreenciaAntes ?? undefined,
        porcentajeCreenciaDespues: body?.grupoEmociones?.grupo5?.porcentajeCreenciaDespues ?? undefined       
      },
      grupoEmociones6: {
        turbado: body?.grupoEmociones?.grupo6?.seleccionEmociones?.[0] ?? undefined,
        tonto: body?.grupoEmociones?.grupo6?.seleccionEmociones?.[1] ?? undefined,
        humillado: body?.grupoEmociones?.grupo6?.seleccionEmociones?.[2] ?? undefined,
        apurado: body?.grupoEmociones?.grupo6?.seleccionEmociones?.[3] ?? undefined,
        porcentajeCreenciaAntes: body?.grupoEmociones?.grupo6?.porcentajeCreenciaAntes ?? undefined,
        porcentajeCreenciaDespues: body?.grupoEmociones?.grupo6?.porcentajeCreenciaDespues ?? undefined       
      },
      grupoEmociones7: {
        desesperanzado: body?.grupoEmociones?.grupo7?.seleccionEmociones?.[0] ?? undefined,
        desanimado: body?.grupoEmociones?.grupo7?.seleccionEmociones?.[1] ?? undefined,
        pesimista: body?.grupoEmociones?.grupo7?.seleccionEmociones?.[2] ?? undefined,
        descorazonado: body?.grupoEmociones?.grupo7?.seleccionEmociones?.[3] ?? undefined,
        porcentajeCreenciaAntes: body?.grupoEmociones?.grupo7?.porcentajeCreenciaAntes ?? undefined,
        porcentajeCreenciaDespues: body?.grupoEmociones?.grupo7?.porcentajeCreenciaDespues ?? undefined       
      },
      grupoEmociones8: {
        frustrado: body?.grupoEmociones?.grupo8?.seleccionEmociones?.[0] ?? undefined,
        atascado: body?.grupoEmociones?.grupo8?.seleccionEmociones?.[1] ?? undefined,
        chasqueado: body?.grupoEmociones?.grupo8?.seleccionEmociones?.[2] ?? undefined,
        derrotado: body?.grupoEmociones?.grupo8?.seleccionEmociones?.[3] ?? undefined,
        porcentajeCreenciaAntes: body?.grupoEmociones?.grupo8?.porcentajeCreenciaAntes ?? undefined,
        porcentajeCreenciaDespues: body?.grupoEmociones?.grupo8?.porcentajeCreenciaDespues ?? undefined       
      },
      grupoEmociones9: {
        airado: body?.grupoEmociones?.grupo9?.seleccionEmociones?.[0] ?? undefined,
        enfadado: body?.grupoEmociones?.grupo9?.seleccionEmociones?.[1] ?? undefined,
        resentido: body?.grupoEmociones?.grupo9?.seleccionEmociones?.[2] ?? undefined,
        molesto: body?.grupoEmociones?.grupo9?.seleccionEmociones?.[3] ?? undefined,
        irritado: body?.grupoEmociones?.grupo9?.seleccionEmociones?.[4] ?? undefined,
        trastornado: body?.grupoEmociones?.grupo9?.seleccionEmociones?.[5] ?? undefined,
        furioso: body?.grupoEmociones?.grupo9?.seleccionEmociones?.[6] ?? undefined,
        porcentajeCreenciaAntes: body?.grupoEmociones?.grupo9?.porcentajeCreenciaAntes ?? undefined,
        porcentajeCreenciaDespues: body?.grupoEmociones?.grupo9?.porcentajeCreenciaDespues ?? undefined      
      },
      grupoEmocionesPersonalizadas: {
        emociones: body?.grupoEmociones?.grupo10?.listaEmociones ?? undefined,
        porcentajeCreenciaAntes: body?.grupoEmociones?.grupo10?.porcentajeCreenciaAntes ?? undefined,
        porcentajeCreenciaDespues: body?.grupoEmociones?.grupo10?.porcentajeCreenciaDespues ?? undefined
      },
      pensamientos: body?.listaPensamientos?.map((pensamiento: { [key: string]: any }) => {
        return {
          pensamientoNegativo: pensamiento?.pensamientoNegativo ?? undefined,
          porcentajeCreenciaAntes: pensamiento?.porcentajeCreenciaPensamientoNegativoAntes ?? undefined,
          porcentajeCreenciaDespues: pensamiento?.porcentajeCreenciaPensamientoNegativoDespues ?? undefined,
          pensamientoPositivo: pensamiento?.pensamientoPositivo ?? undefined,
          porcentajeCreenciaPositivo: pensamiento?.porcentajeCreenciaPensamientoPositivo ?? undefined,           
          distorsion: {
            pensamientoTodoONada: pensamiento?.distorsionesIdentificadas?.[0] ?? undefined,
            generalizacionExcesiva: pensamiento?.distorsionesIdentificadas?.[1] ?? undefined,
            filtroMental: pensamiento?.distorsionesIdentificadas?.[2] ?? undefined,
            descargarLoPositivo: pensamiento?.distorsionesIdentificadas?.[3] ?? undefined,
            saltarAConclusiones: pensamiento?.distorsionesIdentificadas?.[4] ?? undefined,
            magnificacionOMinimizacion: pensamiento?.distorsionesIdentificadas?.[5] ?? undefined,
            razonamientoEmocional: pensamiento?.distorsionesIdentificadas?.[6] ?? undefined,
            afirmacionesDelTipoDeberia: pensamiento?.distorsionesIdentificadas?.[7] ?? undefined,
            ponerEtiquetas: pensamiento?.distorsionesIdentificadas?.[8] ?? undefined,
            inculpacion: pensamiento?.distorsionesIdentificadas?.[9] ?? undefined           
          }
        }
      }) ?? undefined
    }
  }

}

