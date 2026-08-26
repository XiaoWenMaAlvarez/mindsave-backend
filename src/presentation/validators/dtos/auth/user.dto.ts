import { isValidEsquemaLoginUser } from "../../schemas/init.js";

export interface UserLogin {
  email: string;
  password: string;
}

export class UserDTO {
  constructor(){}

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

