import type { UserEntity } from "../../entities/init.js";

export abstract class AdminUserDatasource {
  abstract createUser(user: UserEntity): Promise<string | UserEntity>;
  abstract getUsers(page?: number, limit?: number, query?: string, emailVerify?: string, rol?: string, state?: string): Promise<{results: UserEntity[], totalPages: number}>;
  abstract getUserById(userId: string): Promise<UserEntity | string>;
  abstract updateUser(user: UserEntity): Promise<string | null>;
  abstract deleteUser(userId: string): Promise<string | null>;
  abstract restoreUser(userId: string): Promise<string | null>;
}