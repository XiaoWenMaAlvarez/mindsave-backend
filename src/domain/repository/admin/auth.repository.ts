import type { UserEntity } from "../../entities/init.js";

export abstract class AdminAuthRepository {
  abstract login(email: string, password: string): Promise<UserEntity | string>;
}