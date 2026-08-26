import { UserEntity, type UserEditInterface } from "../../../../../domain/entities/init.js";
import { isValidEsquemaAdminRegisterUser, isValidEsquemaAdminUpdateUser, isValidUuid } from "../../../schemas/init.js";

export interface UserAdmin {
  email: string;
  name: string;
  password: string;
  emailVerified: boolean;
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

  static editeUser(body: {[key: string]: any}, idUser: string): [string | null, UserEditInterface | null] {
    const result = isValidEsquemaAdminUpdateUser(body);
    if(typeof result === "string") return [result, null];

    const isValidId: boolean | string = isValidUuid(idUser);
    if(isValidId !== true) return ["Invalid id", null];

    return [null, {
      id: idUser,
      ...(body.email !== undefined && {email: body.email}),
      ...(body.name !== undefined && {name: body.name}),
      ...(body.password !== undefined && {password: body.password}),
      ...(body.emailVerified !== undefined && {emailVerified: body.emailVerified}),
      ...(body.role !== undefined && {role: body.role}),
      ...(body.isActive !== undefined && {isActive: body.isActive})
    }];
  }

}
