import { AdminUserDatasource } from '../../../domain/datasources/init.js';
import { UserEntity } from '../../../domain/init.js';
import { prisma } from "../../../data/index.js";
import { TipoRol } from '../../../generated/prisma/enums.js';


export class AdminUserDatasourceImpl implements AdminUserDatasource {

  async createUser(user: UserEntity): Promise<string | null> {
    const isEmailRepeat = await prisma.user.findUnique({
      where: {
        email: user.email
        }
    });

    if(isEmailRepeat != null) return "Email already exists";

    const role = user.role === TipoRol.PROFESIONAL_ROL ? TipoRol.PROFESIONAL_ROL : TipoRol.USER_ROL

    const findRole = await prisma.role.findUnique({
      where: {
        description: role
      }
    });

    if(findRole == null) return "Invalid role";

    await prisma.user.create({
      data: {
        email: user.email,
        name: user.name,
        password: user.password,
        roleId: findRole.id,
        emailVerified: user.emailVerified
      }
    });

    return null;
  }

  async getUsers(page?: number, limit?: number): Promise<UserEntity[]> {
    limit = limit ?? 10;
    page = page ?? 1;
    const usuarios = await prisma.user.findMany({
      take: limit,
      skip: page * limit - limit,
      include: {
        role: true
      },
    });

    if (!usuarios) return [];

    return usuarios.map((user) => UserEntity.fromJson({
      id: user.id, 
      email: user.email, 
      name: user.name, 
      password: "", 
      emailVerified: user.emailVerified, 
      role: user.role.description,
      isActive: user.isActive
    }))
  }

  async getUserById(userId: string): Promise<UserEntity | string> {
    const user = await prisma.user.findUnique({
      where: {
        id: userId
        },
      include: {
        role: true
      }
    });

    if(user == null) return "User not found";
    
    return UserEntity.fromJson({
      id: user.id, 
      email: user.email, 
      name: user.name, 
      password: "", 
      emailVerified: user.emailVerified, 
      role: user.role.description,
      isActive: user.isActive
    })
  }


  async updateUser(user: UserEntity): Promise<void> {
    const usuarioParaEditar = await prisma.user.findFirst({
      where: {
        id: user.id
      },
    });

    if(usuarioParaEditar == null) return;

    const roleDescription = user.role === TipoRol.PROFESIONAL_ROL ? TipoRol.PROFESIONAL_ROL : TipoRol.USER_ROL

    const role = await prisma.role.findFirst({
      where: {
        description: roleDescription
      }
    })

    if(role == null) return;

    await prisma.user.update({
      where: {
        id: user.id
      },
      data: {
        email: user.email,
        name: user.name,
        password: user.password,
        emailVerified: user.emailVerified,
        roleId: role.id
      }
    });

    return;

  }


  async deleteUser(userId: string): Promise<void> {
    const usuarioParaEliminar = await prisma.user.findFirst({
      where: {
        id: userId
      },
    });

    if(usuarioParaEliminar == null) return;

    await prisma.user.update({
      where: {
        id: userId
      },
      data: {
        isActive: false
      }
    });

    return;
  }

  async restoreUser(userId: string): Promise<void> {
    const usuarioParaEliminar = await prisma.user.findFirst({
      where: {
        id: userId
      },
    });

    if(usuarioParaEliminar == null) return;

    await prisma.user.update({
      where: {
        id: userId
      },
      data: {
        isActive: true
      }
    });

    return;
  }

}