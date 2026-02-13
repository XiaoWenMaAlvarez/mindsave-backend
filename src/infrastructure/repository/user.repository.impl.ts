import type { UserEntity } from '../../domain/init.js';
import type { UserRepository } from '../../domain/repository/init.js';
import { UserDatasource } from '../../domain/datasources/init.js';

export class UserRepositoryImpl implements UserRepository {

  constructor(
    private readonly userDatasource: UserDatasource
  ){}

  verifyUserByEmailAndToken(email: string, token: string): Promise<boolean | null> {
    return this.userDatasource.verifyUserByEmailAndToken(email, token);
  }
  resetPassword(email: string, token: string, newPassword: string): Promise<boolean> {
    return this.userDatasource.resetPassword(email, token, newPassword);
  }

  createResetPasswordToken(email: string, token: string, tokenTimeAliveMinutes: number): Promise<void> {
    return this.userDatasource.createResetPasswordToken(email, token, tokenTimeAliveMinutes);
  }
  verifyUserByEmail(email: string): Promise<boolean | null> {
    return this.userDatasource.validateEmail(email);
  }
  register(user: UserEntity): Promise<string | null> {
    return this.userDatasource.register(user);
  }
  login(email: string, password: string): Promise<UserEntity | string> {
    return this.userDatasource.login(email, password);
  }
  validateEmail(token: string): Promise<boolean> {
    return this.userDatasource.validateEmail(token);
  }
  
}