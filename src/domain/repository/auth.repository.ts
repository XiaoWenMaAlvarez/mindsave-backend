import type { UserEntity } from "../entities/init.js";

export abstract class UserRepository {
  abstract register(user: UserEntity): Promise<String | null>;
  abstract login(email: string, password: string): Promise<UserEntity | String>;
  abstract validateEmail(token: string): Promise<boolean>;
}