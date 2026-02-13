import type { UserEntity } from "../entities/init.js";

export abstract class UserRepository {
  abstract register(user: UserEntity): Promise<string | null>;
  abstract login(email: string, password: string): Promise<UserEntity | string>;
  abstract validateEmail(token: string): Promise<boolean>;
  abstract verifyUserByEmail(email: string): Promise<boolean | null>;
  abstract verifyUserByEmailAndToken(email: string, token: string): Promise<boolean | null>;
  abstract createResetPasswordToken(email: string, token: string, tokenTimeAliveMinutes: number): Promise<void>;
  abstract resetPassword(email: string, token: string, newPassword: string): Promise<boolean>;
}