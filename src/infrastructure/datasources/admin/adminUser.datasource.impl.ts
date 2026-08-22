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

  async getUsers(page?: number, limit?: number, query?: string, emailVerify?: string, rol?: string, state?: string): Promise<{results: UserEntity[], totalPages: number}> {
    limit = limit ?? 10;
    page = page ?? 1;
    const cleanQuery = query?.trim();
    const cleanEmailVerify = emailVerify?.trim();
    const cleanRol = rol?.trim();
    const cleanState = state?.trim();

    // WHERE (name ILIKE '%query%' OR email ILIKE '%query%')
    const where: any = {};

    if (cleanQuery) {
      where.OR = [
        { name: { contains: cleanQuery, mode: 'insensitive' as const } },
        { email: { contains: cleanQuery, mode: 'insensitive' as const } },
      ];
    }

    if(cleanEmailVerify){
      where.emailVerified = cleanEmailVerify === "verify" ? true : false;
    }

    if(cleanRol){
      const role = cleanRol === TipoRol.PROFESIONAL_ROL ? TipoRol.PROFESIONAL_ROL : TipoRol.USER_ROL
      const findRole = await prisma.role.findUnique({
        where: {
          description: role
        }
      });
      
      if(findRole != null) where.roleId = findRole.id
    }

    if(cleanState){
      where.isActive = cleanState === "active" ? true : false;
    }

    const [usuarios, totalUsuarios] = await Promise.all([
      prisma.user.findMany({
        take: limit,
        skip: page * limit - limit,
        where,
        include: {
          role: true
        },
      }),
      prisma.user.count({ where })
    ]);

    const totalPages = Math.max(1, Math.ceil(totalUsuarios / limit));

    return {
      results: usuarios.map((user) => UserEntity.fromJson({
        id: user.id, 
        email: user.email, 
        name: user.name, 
        password: "", 
        emailVerified: user.emailVerified, 
        role: user.role.description,
        isActive: user.isActive
      })),
      totalPages
    }
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


  async updateUser(user: UserEntity): Promise<string | null> {
    const usuarioParaEditar = await prisma.user.findFirst({
      where: {
        id: user.id,
      },
    });

    if(usuarioParaEditar == null) return "ID not found";

    if(usuarioParaEditar.email !== user.email){
      const isEmailRepeat = await prisma.user.findUnique({
        where: {
          email: user.email
        }
      });
      if(isEmailRepeat != null) return "Email already exists";
    }

    const roleDescription = user.role === TipoRol.PROFESIONAL_ROL ? TipoRol.PROFESIONAL_ROL : TipoRol.USER_ROL

    const role = await prisma.role.findFirst({
      where: {
        description: roleDescription
      }
    })

    if(role == null) return "Invalid role";

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

    return null;

  }


  async deleteUser(userId: string): Promise<string | null> {
    const usuarioParaEliminar = await prisma.user.findFirst({
      where: {
        id: userId
      },
    });

    if(usuarioParaEliminar == null) return "ID not found";

    await prisma.user.update({
      where: {
        id: userId
      },
      data: {
        isActive: false
      }
    });

    return null;
  }

  async restoreUser(userId: string): Promise<string | null> {
    const usuarioParaEliminar = await prisma.user.findFirst({
      where: {
        id: userId
      },
    });

    if(usuarioParaEliminar == null) return "ID not found";

    await prisma.user.update({
      where: {
        id: userId
      },
      data: {
        isActive: true
      }
    });

    return null;
  }

}