import { UserDatasource } from '../../domain/datasources/init.js';
import { UserEntity } from '../../domain/init.js';
import { prisma } from "../../data/index.js";
import { bcryptAdapter } from '../../config/bcrypt.adapter.js';


export class UserDatasourceImpl implements UserDatasource {

  async register(user: UserEntity): Promise<String | null> {
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

  async login(email: string, password: string): Promise<UserEntity | String> {
    const user = await prisma.user.findUnique({
      where: {
        email: email
        }
    });
    if(user == null) return "Email not found";

    const isMatch = bcryptAdapter.compare(password, user.password);
    if(!isMatch) return "Invalid password";

    if(!user.emailVerified) return "Por favor, verifique su email";

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
  
  
}