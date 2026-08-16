import type { UserEntity } from "../../entities/init.js";

export abstract class AdminAuthDatasource {
  abstract login(email: string, password: string): Promise<UserEntity | string>;
  abstract register(user: UserEntity): Promise<string | UserEntity>;
}