import { RegistroEstadoAnimoDatasource } from '../../domain/datasources/init.js';
import { RegistroEstadoAnimo } from '../../domain/init.js';
import { prisma } from "../../data/index.js";
import type { RegistroEstadoAnimoDB } from '../models/init.js';
import { RegistroEstadoAnimoMapper } from '../init.js';

export class RegistroEstadoAnimoDatasourceImpl implements RegistroEstadoAnimoDatasource {

  async saveRegistroEstadoDeAnimo(registro: RegistroEstadoAnimo): Promise<string> {
    const user = await prisma.user.findUnique({
      where: {id: registro.idUsuario}
    });
    if(user == null) return "";

    const nuevoRegistro = await prisma.registroEstadoAnimo.create({
      data: {
        user: {connect: {id: registro.idUsuario}},
        fecha: registro.fecha,
        sucesoTrastornador: registro.sucesoTrastornador,
        grupoEmociones1: { create: registro.grupoEmociones1.toJson() },
        grupoEmociones2: { create: registro.grupoEmociones2.toJson() },
        grupoEmociones3: { create: registro.grupoEmociones3.toJson() },
        grupoEmociones4: { create: registro.grupoEmociones4.toJson() },
        grupoEmociones5: { create: registro.grupoEmociones5.toJson() },
        grupoEmociones6: { create: registro.grupoEmociones6.toJson() },
        grupoEmociones7: { create: registro.grupoEmociones7.toJson() },
        grupoEmociones8: { create: registro.grupoEmociones8.toJson() },
        grupoEmociones9: { create: registro.grupoEmociones9.toJson() },
        ...(registro.grupoEmocionesPersonalizadas && {
          grupoEmocionesPersonalizadas: {
            create: {
              porcentajeCreenciaAntes: registro.grupoEmocionesPersonalizadas.porcentajeCreenciaAntes,
              porcentajeCreenciaDespues: registro.grupoEmocionesPersonalizadas.porcentajeCreenciaDespues,
              listaEmociones: { create: registro.grupoEmocionesPersonalizadas.listaEmociones.map(e => ({ descripcion: e })) }
            }
          },
        }),
        pensamientos: {
          create: registro.pensamientos.map((p) => ({
            pensamientoNegativo: p.pensamientoNegativo,
            porcentajeCreenciaAntes: p.porcentajeCreenciaAntes,
            porcentajeCreenciaDespues: p.porcentajeCreenciaDespues,
            pensamientoPositivo: p.pensamientoPositivo,
            porcentajeCreenciaPositivo: p.porcentajeCreenciaPositivo,
            distorsion: {
              create: p.distorsion,
            },
          })),
        },
      },
    });
    return nuevoRegistro.id;
  }

  
  async getRegistroEstadoDeAnimoPendientes(userId: string, page?: number, limit?: number): Promise<RegistroEstadoAnimo[]> {
    limit = limit ?? 10;
    page = page ?? 1;
    const registros = await prisma.registroEstadoAnimo.findMany({
      take: limit,
      skip: page * limit - limit,
      orderBy: {
        fecha: 'desc',
      },
      where: {
        idUsuario: userId,
        grupoEmociones1: {
          porcentajeCreenciaDespues: {
            equals: null,
          },
        }
      },
      include: {
        grupoEmociones1: true,
        grupoEmociones2: true,
        grupoEmociones3: true,
        grupoEmociones4: true,
        grupoEmociones5: true,
        grupoEmociones6: true,
        grupoEmociones7: true,
        grupoEmociones8: true,
        grupoEmociones9: true,
        grupoEmocionesPersonalizadas: {
          include: { listaEmociones: true },
        },
        pensamientos: {
          include: { distorsion: true },
        },
      },
    });

    if (!registros) return [];
    const registroDB = registros as unknown as RegistroEstadoAnimoDB[];
    const registrosEntity: RegistroEstadoAnimo[] = registroDB.map(registro => RegistroEstadoAnimoMapper.fromDBtoEntity(registro));
    return registrosEntity;
  }

  async getRegistroEstadoDeAnimoCompletos(userId: string, page?: number, limit?: number): Promise<RegistroEstadoAnimo[]> {
    limit = limit ?? 10;
    page = page ?? 1;
    const registros = await prisma.registroEstadoAnimo.findMany({
      take: limit,
      skip: page * limit - limit,
      orderBy: {
        fecha: 'desc',
      },
      where: {
        idUsuario: userId,
        grupoEmociones1: {
          porcentajeCreenciaDespues: {
            not: null,
          },
        }
      },
      include: {
        grupoEmociones1: true,
        grupoEmociones2: true,
        grupoEmociones3: true,
        grupoEmociones4: true,
        grupoEmociones5: true,
        grupoEmociones6: true,
        grupoEmociones7: true,
        grupoEmociones8: true,
        grupoEmociones9: true,
        grupoEmocionesPersonalizadas: {
          include: { listaEmociones: true },
        },
        pensamientos: {
          include: { distorsion: true },
        },
      },
    });

    if (!registros) return [];
    const registroDB = registros as unknown as RegistroEstadoAnimoDB[];
    const registrosEntity: RegistroEstadoAnimo[] = registroDB.map(registro => RegistroEstadoAnimoMapper.fromDBtoEntity(registro));
    return registrosEntity;
  }

  async editarRegistroEstadoDeAnimo(registro: RegistroEstadoAnimo): Promise<void> {
    await this.eliminarRegistroEstadoDeAnimo(registro.id!, registro.idUsuario);

    const user = await prisma.user.findUnique({
      where: {id: registro.idUsuario}
    });
    if(user == null) return;

    await prisma.registroEstadoAnimo.create({
      data: {
        id: registro.id!,
        user: {connect: {id: registro.idUsuario}},
        fecha: registro.fecha,
        sucesoTrastornador: registro.sucesoTrastornador,
        grupoEmociones1: { create: registro.grupoEmociones1.toJson() },
        grupoEmociones2: { create: registro.grupoEmociones2.toJson() },
        grupoEmociones3: { create: registro.grupoEmociones3.toJson() },
        grupoEmociones4: { create: registro.grupoEmociones4.toJson() },
        grupoEmociones5: { create: registro.grupoEmociones5.toJson() },
        grupoEmociones6: { create: registro.grupoEmociones6.toJson() },
        grupoEmociones7: { create: registro.grupoEmociones7.toJson() },
        grupoEmociones8: { create: registro.grupoEmociones8.toJson() },
        grupoEmociones9: { create: registro.grupoEmociones9.toJson() },
        ...(registro.grupoEmocionesPersonalizadas && {
          grupoEmocionesPersonalizadas: {
            create: {
              porcentajeCreenciaAntes: registro.grupoEmocionesPersonalizadas.porcentajeCreenciaAntes,
              porcentajeCreenciaDespues: registro.grupoEmocionesPersonalizadas.porcentajeCreenciaDespues,
              listaEmociones: { create: registro.grupoEmocionesPersonalizadas.listaEmociones.map(e => ({ descripcion: e })) }
            }
          },
        }),
        pensamientos: {
          create: registro.pensamientos.map((p) => ({
            pensamientoNegativo: p.pensamientoNegativo,
            porcentajeCreenciaAntes: p.porcentajeCreenciaAntes,
            porcentajeCreenciaDespues: p.porcentajeCreenciaDespues,
            pensamientoPositivo: p.pensamientoPositivo,
            porcentajeCreenciaPositivo: p.porcentajeCreenciaPositivo,
            distorsion: {
              create: p.distorsion,
            },
          })),
        },
      },
    });
    return;
  }

  async eliminarRegistroEstadoDeAnimo(idRegistro: string, userId: string): Promise<void> {
    const registroParaEliminar = await prisma.registroEstadoAnimo.findFirst({
      where: {
        id: idRegistro,
        idUsuario: userId
      },
    });

    if(registroParaEliminar == null) return;

    await prisma.$transaction([
      prisma.registroEstadoAnimo.deleteMany({
        where: {
          id: idRegistro,
          idUsuario: userId
        }
      }),
    ]);
  }
  
  async getRegistroEstadoDeAnimoById(userId: string, idRegistro: string): Promise<RegistroEstadoAnimo | null> {
    const registro = await prisma.registroEstadoAnimo.findFirst({
      where: {
        id: idRegistro,
        idUsuario: userId,
      },
      include: {
        grupoEmociones1: true,
        grupoEmociones2: true,
        grupoEmociones3: true,
        grupoEmociones4: true,
        grupoEmociones5: true,
        grupoEmociones6: true,
        grupoEmociones7: true,
        grupoEmociones8: true,
        grupoEmociones9: true,
        grupoEmocionesPersonalizadas: {
          include: { listaEmociones: true },
        },
        pensamientos: {
          include: { distorsion: true },
        },
      },
    });

    if (!registro) return null;

    const registroDB = registro as unknown as RegistroEstadoAnimoDB;

    const registroEntity: RegistroEstadoAnimo = RegistroEstadoAnimoMapper.fromDBtoEntity(registroDB);
    return registroEntity;
  }

}
