import type { UserEntity } from '../../../domain/init.js';
import type { AdminAuthRepository } from '../../../domain/repository/init.js';
import { AdminAuthDatasource } from '../../../domain/datasources/init.js';

export class AdminAuthRepositoryImpl implements AdminAuthRepository {

  constructor(
    private readonly adminAuthDatasource: AdminAuthDatasource
  ){}

  login(email: string, password: string): Promise<UserEntity | string> {
    return this.adminAuthDatasource.login(email, password);
  }
  
}