import { UserEntity } from "../../../../../domain/entities/init.js";
import { isValidEsquemaAdminRegisterUser, isValidUuid } from "../../../schemas/init.js";

export interface UserAdmin {
  email: string;
  name: string
  password: string;
  emailVerified: string;
  role: string;
}

export class UserAdminDTO {
  constructor(){}

  static createUser(body: {[key: string]: any}): [string | null, UserEntity | null] {
    const result = isValidEsquemaAdminRegisterUser(body);
    if(typeof result === "string") return [result, null];
    return [null, UserEntity.fromJson({
      email: body.email,
      name: body.name,
      password: body.password,
      emailVerified: body.emailVerified,
      role: body.role
    })];
  }

  static editeUser(body: {[key: string]: any}, idUser: string): [string | null, UserEntity | null] {
    const result = isValidEsquemaAdminRegisterUser(body);
    if(typeof result === "string") return [result, null];

    const isValidId: boolean | string = isValidUuid(idUser);
    if(isValidId !== true) return ["Invalid id", null];

    return [null, UserEntity.fromJson({
      id: idUser,
      email: body.email,
      name: body.name,
      password: body.password,
      emailVerified: body.emailVerified,
      role: body.role
    })];
  }

}

