import { isValidEsquemaAdminGetUsersQuerySchema } from "../../../schemas/init.js";

export interface AdminGetUsersQuery {
  page: number;
  limit: number;
  query: string;
  emailVerify: string;
  rol: string;
  state: string;
}

export class AdminGetUsersQueryDTO {
  constructor(){}

  static getUserByPageAndQuery(body: {[key: string]: any}): [string | null, AdminGetUsersQuery | null] {
    const result = isValidEsquemaAdminGetUsersQuerySchema(body);
    if(typeof result === "string") return [result, null];
    return [null, {
      page: Number(body.page),
      limit: Number(body.limit),
      query: body.query,
      emailVerify: body.emailVerify,
      rol: body.rol,
      state: body.state
    }];
  }


}

