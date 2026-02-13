import { UserDatasource } from '../../domain/datasources/init.js';
import { UserEntity } from '../../domain/init.js';
import { prisma } from "../../data/index.js";
import { bcryptAdapter } from '../../config/bcrypt.adapter.js';


export class UserDatasourceImpl implements UserDatasource {

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

    if(findRole == null) return "Undefined role";

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
        }
    });
    if(user == null) return "Email not found";

    const isMatch = bcryptAdapter.compare(password, user.password);
    if(!isMatch) return "Invalid password";

    if(!user.emailVerified) return "EMAIL_NOT_VERIFIED";

    user.password = "";

    return UserEntity.fromJson(user);

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