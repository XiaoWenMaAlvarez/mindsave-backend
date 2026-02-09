import type { UserEntity } from '../../domain/init.js';
import type { UserRepository } from '../../domain/repository/init.js';
import { UserDatasource } from '../../domain/datasources/init.js';

export class UserRepositoryImpl implements UserRepository {

  constructor(
    private readonly userDatasource: UserDatasource
  ){}
  register(user: UserEntity): Promise<String | null> {
    return this.userDatasource.register(user);
  }
  login(email: string, password: string): Promise<UserEntity | String> {
    return this.userDatasource.login(email, password);
  }
  validateEmail(token: string): Promise<boolean> {
    return this.userDatasource.validateEmail(token);
  }
  
}