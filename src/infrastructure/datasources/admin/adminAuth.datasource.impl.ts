import { AdminAuthDatasource } from '../../../domain/datasources/init.js';
import { UserEntity } from '../../../domain/init.js';
import { prisma } from "../../../data/index.js";
import { bcryptAdapter } from '../../../config/bcrypt.adapter.js';


export class AdminAuthDatasourceImpl implements AdminAuthDatasource {

  async login(email: string, password: string): Promise<UserEntity | string> {
    const user = await prisma.user.findUnique({
      where: {
        email: email,
        isActive: true,
        role: {
          description: "PROFESIONAL_ROL"
        }
        },
      include: {
        role: true
      }
    });
    if(user == null) return "User not found";

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
}