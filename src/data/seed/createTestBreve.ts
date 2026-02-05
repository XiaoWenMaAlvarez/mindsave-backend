import { prisma } from "../postgres/index.js";

const newRegistro = await prisma.testBreveEstadoDeAnimo.create({
    data: {
      idUsuario: "Juan",
      depresion: {
        create: {
          "tristeza": 1,
          "desesperanza": 2,
          "bajaAutoestima": 3,
          "faltaDeValor": 4,
          "perdidaDeSatisfaccion": 0
        }
      },
      impulsoSuicida: {
        create: {
          "pensamientosSuicidas": 0,
          "deseosDeMorir": 0
        }
      },
      ansiedadFisica: {
        create: {
          "palpitaciones": 1,
          "sudoracion": 0,
          "temblores": 1,
          "dificultadRespirar": 0,
          "ahogo": 4,
          "dolorPecho": 0,
          "nauseas": 1,
          "mareos": 0,
          "sensacionIrrealidad": 3,
          "inestabilidadHormigueos": 1
        }
      },
      ansiedadEmocional: {
        create: {
          "angustiado": 2,
          "nervioso": 1,
          "preocupado": 2,
          "asustado": 1,
          "tenso": 2
        }
      }
    }
  });

  console.log(newRegistro);