import type { UserEntity } from '../../../domain/init.js';
import type { AdminUserRepository } from '../../../domain/repository/init.js';
import { AdminUserDatasource } from '../../../domain/datasources/init.js';

export class AdminUserRepositoryImpl implements AdminUserRepository {

  constructor(
    private readonly adminUserDatasource: AdminUserDatasource
  ){}

  createUser(user: UserEntity): Promise<string | null> {
    return this.adminUserDatasource.createUser(user);
  }
  getUsers(page?: number, limit?: number): Promise<UserEntity[]> {
    return this.adminUserDatasource.getUsers(page, limit);
  }
  getUserById(userId: string): Promise<UserEntity | string> {
    return this.adminUserDatasource.getUserById(userId);
  }
  updateUser(user: UserEntity): Promise<string | null> {
    return this.adminUserDatasource.updateUser(user);
  }
  deleteUser(userId: string): Promise<string | null> {
    return this.adminUserDatasource.deleteUser(userId);
  }

  restoreUser(userId: string): Promise<string | null> {
    return this.adminUserDatasource.restoreUser(userId)
  }

}