export interface userOptions {
  id: string;
  email: string;
  name: string;
  password: string;
  emailVerified: boolean;
  role: string;
  isActive?: string | undefined;
}

export class UserEntity {

  public id: string;
  public email: string;
  public name: string;
  public password: string;
  public emailVerified: boolean;
  public role: string;
  public isActive: string | undefined;

  constructor(options: userOptions){
    const {id, email, name, password, emailVerified, role, isActive} = options;
    this.id = id;
    this.email = email;
    this.name = name;
    this.password = password;
    this.emailVerified = emailVerified;
    this.role = role;
    this.isActive = isActive == undefined ? undefined : isActive
  }

  static fromJson(object: {[key: string]: any}): UserEntity {
    const {id, email, name, password, emailVerified, role, isActive} = object; 
    const options = {id, email, name, password, emailVerified, role, isActive};
    return new UserEntity(options);
  }

  toJson() {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      password: this.password,
      emailVerified: this.emailVerified,
      role: this.role,
      isActive: this.isActive
    }
  }

}
