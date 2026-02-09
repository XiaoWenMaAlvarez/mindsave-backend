import { UserEntity } from "../../../../domain/entities/init.js";
import { isValidEsquemaRegisterUser, isValidEsquemaLoginUser } from "../../schemas/init.js";

export interface UserLogin {
  email: string;
  password: string;
}

export class UserDTO {
  constructor(){}

  static register(body: {[key: string]: any}): [string | null, UserEntity | null] {
    const result = isValidEsquemaRegisterUser(body);
    if(typeof result === "string") return [result, null];
    return [null, UserEntity.fromJson({
      email: body.email,
      name: body.name,
      password: body.password,
      emailVerified: false,
      id: ""
    })];
  }

  static login(body: {[key: string]: any}): [string | null, UserLogin | null] {
    const result = isValidEsquemaLoginUser(body);
    if(typeof result === "string") return [result, null];
    const userLogin: UserLogin = {
      email: body.email,
      password: body.password,
    }
    return [null, userLogin];
  }
}

