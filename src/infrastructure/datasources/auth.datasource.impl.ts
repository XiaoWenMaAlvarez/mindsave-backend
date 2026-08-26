import { UserDatasource } from '../../domain/datasources/init.js';
import { UserEntity } from '../../domain/init.js';
import { prisma } from "../../data/index.js";
import { bcryptAdapter } from '../../config/bcrypt.adapter.js';


export class UserDatasourceImpl implements UserDatasource {

  async findUnverifiedUserByEmail(email: string): Promise<Pick<UserEntity, "email" | "name"> | null> {
    return prisma.user.findFirst({
      where: {
        email,
        emailVerified: false,
        isActive: true,
        role: {
          description: "USER_ROL",
        },
      },
      select: {
        email: true,
        name: true,
      },
    });
  }

  async findActiveUserById(id: string): Promise<UserEntity | null> {
    const user = await prisma.user.findUnique({
      where: {
        id,
        isActive: true,
      },
      include: {
        role: true,
      },
    });

    if (user == null) return null;

    return UserEntity.fromJson({
      id: user.id,
      email: user.email,
      name: user.name,
      password: "",
      emailVerified: user.emailVerified,
      role: user.role.description,
    });
  }

  async verifyUserByEmailAndToken(email: string, token: string): Promise<boolean | null> {
    try {
      const user = await prisma.user.findUnique({
        where: {
          email: email,
          resetToken: token,
          resetTokenExpiration: {
            gt: new Date()
          }
        }
      });
      if(user == null) return false;
      return true;
    } catch (error) {
      return false;
    }
  }

  async resetPassword(email: string, token: string, newPassword: string): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: {
          email: email,
          resetToken: token,
          resetTokenExpiration: {
            gt: new Date()
          }
        }
      });
      if(user == null) return false;
      await prisma.user.update({
        where: { email: email },
        data: {
          password: newPassword,
          resetToken: null,
          resetTokenExpiration: null
        }
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async createResetPasswordToken(email: string, token: string, tokenTimeAliveMinutes: number): Promise<void> {
    await prisma.user.update({
      where: { email: email },
      data: {
        resetToken: token,
        resetTokenExpiration: new Date(Date.now() + tokenTimeAliveMinutes * 60 * 1000)
      }
    });
  }

  async register(user: UserEntity): Promise<string | null> {
    const isEmailRepeat = await prisma.user.findUnique({
      where: {
        email: user.email
        }
    });

    if(isEmailRepeat != null) return "Email already exists";

    const findRole = await prisma.role.findUnique({
      where: {
        description: "USER_ROL"
      }
    });

    if(findRole == null) return "Invalid role";

    await prisma.user.create({
      data: {
        email: user.email,
        name: user.name,
        password: user.password,
        roleId: findRole.id,
        emailVerified: false
      }
    });

    return null;
  }

  async login(email: string, password: string): Promise<UserEntity | string> {
    const user = await prisma.user.findUnique({
      where: {
        email: email
        },
        include: {
          role: true
        }
    });
    if(user == null) return "Email not found";

    if(!user.isActive) return "User is deleted or ban";

    const isMatch = bcryptAdapter.compare(password, user.password);
    if(!isMatch) return "Invalid password";

    if(!user.emailVerified) return "EMAIL_NOT_VERIFIED";

    if(user.role.description !== "USER_ROL") return "INCORRET_ROLE";

    user.password = "";

    return UserEntity.fromJson({
      id: user.id, 
      email: user.email, 
      name: user.name, 
      password: user.password, 
      emailVerified: user.emailVerified, 
      role: user.role.description
    });

  }
  
  async validateEmail(email: string): Promise<boolean> {
    try {
      await prisma.user.update({
        where: { email },
        data: { emailVerified: true }
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async verifyUserByEmail(email: string): Promise<boolean | null> {
    try {
      const isEmailRepeat = await prisma.user.findUnique({
        where: {
          email: email
        }
      });
      if(isEmailRepeat != null) return true;
      return false;
    } catch (error) {
      return null;
    }
  }
  
}
