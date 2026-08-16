import { AdminAuthDatasource } from '../../../domain/datasources/init.js';
import { UserEntity } from '../../../domain/init.js';
import { prisma } from "../../../data/index.js";
import { bcryptAdapter } from '../../../config/bcrypt.adapter.js';


export class AdminAuthDatasourceImpl implements AdminAuthDatasource {

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

    const isMatch = bcryptAdapter.compare(password, user.password);
    if(!isMatch) return "Invalid password";

    if(!user.emailVerified) return "EMAIL_NOT_VERIFIED";

    user.password = "";

    if(user.role.description !== "PROFESIONAL_ROL" ) return "USER_IS_NOT_ADMIN";

    return UserEntity.fromJson({
      id: user.id, 
      email: user.email, 
      name: user.name, 
      password: user.password, 
      emailVerified: user.emailVerified, 
      role: user.role.description
    });

  }

    async register(user: UserEntity): Promise<string | UserEntity> {
    const isEmailRepeat = await prisma.user.findUnique({
      where: {
        email: user.email
        }
    });

    if(isEmailRepeat != null) return "Email already exists";

    const findRole = await prisma.role.findUnique({
      where: {
        description: "PROFESIONAL_ROL"
      }
    });

    if(findRole == null) return "Undefined role";

    const userCreated = await prisma.user.create({
      data: {
        email: user.email,
        name: user.name,
        password: user.password,
        roleId: findRole.id,
        emailVerified: true
      }
    });

    return UserEntity.fromJson({
      id: userCreated.id,
      email: userCreated.email,
      name: userCreated.name,
      password: userCreated.password,
      emailVerified: userCreated.emailVerified,
      role: "PROFESIONAL_ROL"
    });
  }
  
  
}