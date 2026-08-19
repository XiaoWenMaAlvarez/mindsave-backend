import type { UserEntity } from "../../entities/init.js";

export abstract class AdminUserDatasource {
  abstract createUser(user: UserEntity): Promise<string | null>;
  abstract getUsers(page?: number, limit?: number): Promise<UserEntity[]>;
  abstract getUserById(userId: string): Promise<UserEntity | string>;
  abstract updateUser(user: UserEntity): Promise<string | null>;
  abstract deleteUser(userId: string): Promise<string | null>;
  abstract restoreUser(userId: string): Promise<string | null>;
}